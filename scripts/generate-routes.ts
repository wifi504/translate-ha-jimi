import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import * as babel from '@babel/parser'
import { ESLint } from 'eslint'
import fg from 'fast-glob'
import { parse, print, types } from 'recast'

/**
 * 路由自动化生成工具
 *  1. 创建文件 src/router/routes.ts 并写上 export default [] ;
 *     可以指定空数组也可以自己写点路由，不过没必要
 *  2. 在 src/router/index.ts 引入 src/router/routes.ts
 *  3. 确认路由视图入口文件是 Index.vue，并且在 src/views/ 下维护好了层级关系
 *  4. 运行 npx tsx scripts/generate-routes.ts
 * @author WIFI连接超时
 * @version 1.0
 */

const outputPath = path.resolve(process.cwd(), './src/router/routes.ts')
const viewsRoot = path.resolve(process.cwd(), './src/views')

// 路由节点
interface RouteNode {
  name: string
  routePath: string
  component?: string // 最终再处理成 () => import()
  children?: RouteNode[]
}

// 扁平化 options.ts
interface FlatRouteOption {
  pathSegments: string[]
  extraProps: Record<string, any>
  isTopLevel: boolean
}

// 解析 TS / 保留注释
const parser = {
  parse(source: string) {
    return babel.parse(source, {
      sourceType: 'module',
      plugins: ['typescript'],
    })
  },
}

// 转换TS代码文件成AST
function parseToAST(code: string) {
  return parse(code, { parser })
}

// 导出AST里面的export表达式内容
function extractExportedRouteArrayExpression(ast: types.namedTypes.File): types.namedTypes.ArrayExpression {
  const exportNode = ast.program.body.find(
    node => node.type === 'ExportDefaultDeclaration',
  ) as types.namedTypes.ExportDefaultDeclaration | undefined

  if (!exportNode) {
    throw new Error('未找到 export default 声明')
  }

  if (
    exportNode.declaration.type === 'TSAsExpression'
    && exportNode.declaration.expression.type === 'ArrayExpression'
  ) {
    return exportNode.declaration.expression
  }

  if (exportNode.declaration.type === 'ArrayExpression') {
    return exportNode.declaration
  }

  throw new Error('export default 不是数组表达式')
}

// 大驼峰变短线（AaaBbb -> aaa-bbb）
function kebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (m, i) => (i ? '-' : '') + m.toLowerCase())
}

// 扫描 views/**/Index.vue，返回相对路径
async function getIndexVueFiles(): Promise<string[]> {
  return fg('**/Index.vue', { cwd: viewsRoot })
}

// 构造目录树
function buildRouteTree(files: string[]): RouteNode[] {
  const root: RouteNode[] = []

  for (const file of files) {
    const parts = file.split('/')
    const pathParts = parts.slice(0, -1)
    const componentPath = `@/views/${parts.join('/')}`

    if (pathParts.length === 0) {
      root.push({
        name: 'root',
        routePath: '/',
        component: componentPath,
      })
      continue
    }

    let current = root
    let fullPath = ''
    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i]
      fullPath += `/${kebabCase(part)}`

      let existing = current.find(item => item.name === part)
      if (!existing) {
        existing = {
          name: part,
          routePath: fullPath,
          children: [],
        }
        current.push(existing)
      }

      if (i === pathParts.length - 1) {
        existing.component = componentPath
      }

      current = existing.children!
    }
  }

  return root
}

// 从目录树构造出路由配置的基础AST
function buildRoutesFromTree(tree: RouteNode[], isChild = false): types.namedTypes.ObjectExpression[] {
  return tree.map((node) => {
    const props: types.namedTypes.ObjectProperty[] = []

    const pathValue = isChild
      ? `${node.routePath.split('/').filter(Boolean).slice(-1)[0]}`
      : node.routePath

    props.push(types.builders.objectProperty(
      types.builders.identifier('path'),
      types.builders.stringLiteral(pathValue),
    ))

    if (node.component) {
      props.push(types.builders.objectProperty(
        types.builders.identifier('component'),
        types.builders.arrowFunctionExpression(
          [],
          types.builders.callExpression(
            types.builders.identifier('import'),
            [types.builders.stringLiteral(node.component)],
          ),
        ),
      ))
    }

    if (node.children && node.children.length > 0) {
      props.push(types.builders.objectProperty(
        types.builders.identifier('children'),
        types.builders.arrayExpression(buildRoutesFromTree(node.children, true)),
      ))
    }

    return types.builders.objectExpression(props)
  })
}

// 解析 src/router/options.ts 中的 export default 路由配置为扁平化数组
function parseOptionsFile(optionsPath: string): FlatRouteOption[] {
  if (!fs.existsSync(optionsPath)) {
    console.log('[routes-gen] 未发现 options.ts，跳过注入自定义配置')
    return []
  }

  const raw = fs.readFileSync(optionsPath, 'utf-8')
  const ast = parse(raw, { parser })

  const exportNode = ast.program.body.find(
    n => n.type === 'ExportDefaultDeclaration',
  ) as types.namedTypes.ExportDefaultDeclaration | undefined

  if (!exportNode || exportNode.declaration.type !== 'ArrayExpression') {
    console.log('[routes-gen] options.ts 中未找到有效的默认导出数组，跳过注入')
    return []
  }

  const result: FlatRouteOption[] = []

  // 递归展开数组为扁平化结构
  function walk(
    nodes: types.namedTypes.ArrayExpression,
    parentSegments: string[] = [],
    isTopLevel = true,
  ) {
    for (const el of nodes.elements) {
      if (!el || el.type !== 'ObjectExpression')
        continue

      const pathProp = el.properties.find(
        (p): p is types.namedTypes.ObjectProperty =>
          p.type === 'ObjectProperty'
          && p.key.type === 'Identifier'
          && p.key.name === 'path'
          && p.value.type === 'StringLiteral',
      )

      if (!pathProp)
        continue

      if (pathProp.value.type !== 'StringLiteral') {
        continue
      }
      const pathSegment = pathProp.value.value
      const fullPathSegments = [...parentSegments, pathSegment]

      // 提取除 path 和 children 之外的字段
      const extraProps = types.builders.objectExpression(
        el.properties.filter(
          p =>
            p.type === 'ObjectProperty'
            && p.key.type === 'Identifier'
            && p.key.name !== 'path'
            && p.key.name !== 'children',
        ),
      )

      result.push({
        pathSegments: fullPathSegments,
        extraProps,
        isTopLevel,
      })

      // 处理 children 递归
      const childrenProp = el.properties.find(
        (p): p is types.namedTypes.ObjectProperty =>
          p.type === 'ObjectProperty'
          && p.key.type === 'Identifier'
          && p.key.name === 'children'
          && p.value.type === 'ArrayExpression',
      )

      if (childrenProp && childrenProp.value.type === 'ArrayExpression') {
        walk(childrenProp.value, fullPathSegments, false)
      }
    }
  }

  walk(exportNode.declaration)
  return result
}

// 根据路径段数组递归查找目标路由节点（返回 AST 中的 ObjectExpression）
function findObjectInArrayASTByPath(
  pathSegments: string[],
  arrayAST: types.namedTypes.ArrayExpression,
): types.namedTypes.ObjectExpression | undefined {
  let currentArray = arrayAST

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i]

    const found = currentArray.elements.find(
      (el): el is types.namedTypes.ObjectExpression =>
        el?.type === 'ObjectExpression'
        && el.properties.some(
          (p): p is types.namedTypes.ObjectProperty =>
            p.type === 'ObjectProperty'
            && p.key.type === 'Identifier'
            && p.key.name === 'path'
            && p.value.type === 'StringLiteral'
            && p.value.value === segment,
        ),
    )

    if (!found)
      return undefined

    if (i === pathSegments.length - 1) {
      return found
    }

    const childrenProp = found.properties.find(
      (p): p is types.namedTypes.ObjectProperty =>
        p.type === 'ObjectProperty'
        && p.key.type === 'Identifier'
        && p.key.name === 'children'
        && p.value.type === 'ArrayExpression',
    )

    if (!childrenProp)
      return undefined

    const childrenArray = childrenProp.value
    if (childrenArray.type !== 'ArrayExpression') {
      return undefined
    }
    currentArray = childrenArray
  }

  return undefined
}

// 将 extraProps 中的字段合并进目标对象（排除 path 和 component）
function mergePropsIntoObject(
  target: types.namedTypes.ObjectExpression,
  extraProps: types.namedTypes.ObjectExpression,
) {
  const existingKeys = new Set<string>()

  for (const prop of target.properties) {
    if (
      prop.type === 'ObjectProperty'
      && prop.key.type === 'Identifier'
    ) {
      existingKeys.add(prop.key.name)
    }
  }

  for (const prop of extraProps.properties) {
    if (
      prop.type === 'ObjectProperty'
      && prop.key.type === 'Identifier'
      && prop.key.name !== 'path'
      && prop.key.name !== 'component'
      && !existingKeys.has(prop.key.name)
    ) {
      target.properties.push(prop)
    }
  }
}

// 将 options.ts 中提取的 extraProps 合并进生成的 routes AST
function applyRouteOptionsToAST(
  rootArrayAST: types.namedTypes.ArrayExpression,
  options: FlatRouteOption[],
) {
  for (const opt of options) {
    const segments = opt.pathSegments
    const last = segments[segments.length - 1]
    const parentSegments = segments.slice(0, -1)

    const target = findObjectInArrayASTByPath(segments, rootArrayAST)

    function toObjectExpression(obj: Record<string, any>): types.namedTypes.ObjectExpression {
      const props = Object.entries(obj).map(([key, val]) =>
        types.builders.objectProperty(
          types.builders.identifier(key),
          typeof val === 'string'
            ? types.builders.stringLiteral(val)
            : typeof val === 'number'
              ? types.builders.numericLiteral(val)
              : typeof val === 'boolean'
                ? types.builders.booleanLiteral(val)
                : types.builders.nullLiteral(),
        ),
      )
      return types.builders.objectExpression(props)
    }

    if (target) {
      mergePropsIntoObject(target, toObjectExpression(opt.extraProps))
    }
    else if (opt.isTopLevel) {
      const newNode = createRouteObjectExpression(last, opt.extraProps)
      rootArrayAST.elements.unshift(newNode)
    }
    else {
      const parentNode = findObjectInArrayASTByPath(parentSegments, rootArrayAST)
      if (!parentNode)
        continue

      let childrenProp = parentNode.properties.find(
        (p): p is types.namedTypes.ObjectProperty =>
          p.type === 'ObjectProperty'
          && p.key.type === 'Identifier'
          && p.key.name === 'children',
      )

      if (!childrenProp) {
        childrenProp = types.builders.objectProperty(
          types.builders.identifier('children'),
          types.builders.arrayExpression([]),
        )
        parentNode.properties.push(childrenProp)
      }

      if (childrenProp.value.type !== 'ArrayExpression')
        continue

      const newChild = createRouteObjectExpression(last, opt.extraProps)

      childrenProp.value.elements.unshift(newChild)
    }
  }
}

// 处理顶层和子路由新增节点时，生成 AST 节点的辅助函数：生成路由对象节点
function createRouteObjectExpression(
  path: string,
  extraProps?: Record<string, any>,
): types.namedTypes.ObjectExpression {
  const props: types.namedTypes.ObjectProperty[] = [
    types.builders.objectProperty(
      types.builders.identifier('path'),
      types.builders.stringLiteral(path),
    ),
  ]

  if (extraProps) {
    for (const [key, val] of Object.entries(extraProps)) {
      if (key === 'path' || key === 'component')
        continue
      let valueNode: types.namedTypes.Expression
      if (typeof val === 'string') {
        valueNode = types.builders.stringLiteral(val)
      }
      else if (typeof val === 'number') {
        valueNode = types.builders.numericLiteral(val)
      }
      else if (typeof val === 'boolean') {
        valueNode = types.builders.booleanLiteral(val)
      }
      else {
        valueNode = types.builders.nullLiteral()
      }
      props.push(types.builders.objectProperty(types.builders.identifier(key), valueNode as any))
    }
  }

  return types.builders.objectExpression(props)
}

// ESLint 格式化
async function formatWithESLint(code: string, filePath = 'src/router/routes.ts') {
  const eslint = new ESLint({ fix: true })
  const results = await eslint.lintText(code, { filePath })

  return results[0].output || code
}

// 主方法
async function main() {
  console.log('Vue Router 路由配置生成器(v1.0) Powered By WIFI连接超时')

  const files = await getIndexVueFiles()
  const tree = buildRouteTree(files)
  const routeASTArray = buildRoutesFromTree(tree)

  // 先生成基础 routes AST
  const ast = parse(`export default []`, { parser })
  ast.program.body[0] = types.builders.exportDefaultDeclaration(
    types.builders.tsAsExpression(
      types.builders.arrayExpression(routeASTArray),
      types.builders.tsTypeReference(types.builders.identifier('RouteRecordRaw')),
    ),
  )

  // 尝试读取 options.ts 并合并
  let options: FlatRouteOption[] = []
  const optionsPath = path.resolve(process.cwd(), './src/router/options.ts')
  if (fs.existsSync(optionsPath)) {
    console.log('检测到 options.ts，开始读取自定义路由配置...')
    options = parseOptionsFile(optionsPath) // 你之前写的解析函数
    applyRouteOptionsToAST(ast.program.body[0].expression.expression, options) // 传入 routes 数组 AST 节点
  }
  else {
    console.log('未检测到 options.ts，跳过自定义配置合并')
  }
  // 5. 格式化输出并写入文件
  console.log('[5/7] 编译抽象语法树')
  let formattedCode = print(ast).code
  console.log('[6/7] 格式化代码')
  formattedCode = formattedCode
    .replace(/(?:\n\s*){2,}/g, '\n') // 多个空行变 1 行
    .replace(/\[\{/g, '[\n{') // 对象换行
  console.log('[7/7] ESLint --fix')
  formattedCode = await formatWithESLint(formattedCode)
  fs.writeFileSync(outputPath, formattedCode)
  console.warn('Done!')
}

main().catch(console.error)
