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
  extraProps: types.namedTypes.ObjectExpression
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

// 解析 src/router/options.ts 中的 export default 路由配置为扁平化数组，结果可能为 [] 代表文件不存在或者找不到默认导出
function parseOptionsFile(optionsPath: string): FlatRouteOption[] {
  if (!fs.existsSync(optionsPath)) {
    return []
  }

  const raw = fs.readFileSync(optionsPath, 'utf-8')
  const ast = parse(raw, { parser })

  const exportNode = ast.program.body.find(
    (n: any) => n.type === 'ExportDefaultDeclaration',
  ) as types.namedTypes.ExportDefaultDeclaration | undefined

  if (!exportNode) {
    return []
  }

  // 兼容 TSAsExpression
  let rootArray: types.namedTypes.ArrayExpression | null = null
  if (exportNode.declaration.type === 'ArrayExpression') {
    rootArray = exportNode.declaration
  }
  else if (
    exportNode.declaration.type === 'TSAsExpression'
    && exportNode.declaration.expression.type === 'ArrayExpression'
  ) {
    rootArray = exportNode.declaration.expression
  }

  if (!rootArray) {
    return []
  }

  const result: FlatRouteOption[] = []

  function walk(
    nodes: types.namedTypes.ArrayExpression,
    parentSegments: string[] = [],
    isTopLevel = true,
  ) {
    for (const el of nodes.elements) {
      if (!el || el.type !== 'ObjectExpression') {
        continue
      }
      const pathProp = el.properties.find(
        (p): p is types.namedTypes.ObjectProperty =>
          p.type === 'ObjectProperty'
          && p.key.type === 'Identifier'
          && p.key.name === 'path'
          && p.value.type === 'StringLiteral',
      )
      if (!pathProp) {
        continue
      }
      const pathSegment = (pathProp.value as types.namedTypes.StringLiteral).value
      const fullPathSegments = [...parentSegments, pathSegment]

      // 保留 AST 属性节点，构建新的 ObjectExpression
      const extraProps: types.namedTypes.ObjectProperty[] = []

      for (const prop of el.properties) {
        if (
          prop.type === 'ObjectProperty'
          && prop.key.type === 'Identifier'
          && prop.key.name !== 'path'
          && prop.key.name !== 'children'
        ) {
          extraProps.push(prop)
        }
      }

      const extraObjectExpr = types.builders.objectExpression(extraProps)

      result.push({
        pathSegments: fullPathSegments,
        extraProps: extraObjectExpr,
        isTopLevel,
      })

      // 递归处理 children
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

  walk(rootArray)
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

    if (!found) {
      return undefined
    }

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

    if (!childrenProp) {
      return undefined
    }

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

    if (target) {
      // 直接合并
      mergePropsIntoObject(target, opt.extraProps)
    }
    else if (opt.isTopLevel) {
      // 顶层追加
      const newNode = createRouteObjectExpression(last, opt.extraProps)
      rootArrayAST.elements.unshift(newNode)
    }
    else {
      // 子节点挂入 parent.children
      const parentNode = findObjectInArrayASTByPath(parentSegments, rootArrayAST)
      if (!parentNode) {
        continue
      }
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

      if (childrenProp.value.type !== 'ArrayExpression') {
        continue
      }

      const newChild = createRouteObjectExpression(last, opt.extraProps)
      childrenProp.value.elements.unshift(newChild)
    }
  }
}

// 处理顶层和子路由新增节点时，生成 AST 节点的辅助函数：生成路由对象节点
function createRouteObjectExpression(
  path: string,
  extraProps?: types.namedTypes.ObjectExpression,
): types.namedTypes.ObjectExpression {
  const props: types.namedTypes.ObjectProperty[] = [
    types.builders.objectProperty(
      types.builders.identifier('path'),
      types.builders.stringLiteral(path),
    ),
  ]

  if (extraProps) {
    // 这里拆解 extraProps.properties，把属性逐个加入
    for (const prop of extraProps.properties) {
      if (
        prop.type === 'ObjectProperty'
        && prop.key.type === 'Identifier'
        && prop.key.name !== 'path'
      ) {
        props.push(prop)
      }
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
  let count = 1
  function getTaskProgress(): string {
    const total = 7
    return `[${count++}/${total}] `
  }
  console.log('Vue Router 路由配置生成器(v1.0) Powered By WIFI连接超时')

  // 1. 解析目录结构获取入口组件
  console.log(`${getTaskProgress()}从"src/views/"解析视图入口组件`)
  const files = await getIndexVueFiles()
  console.log(`${files.map(f => ` - ${f}`).join('\n')}`)
  // 2. 构建目录树
  console.log(`${getTaskProgress()}构建目录树`)
  const tree = buildRouteTree(files)
  // 3. 构建基础路由 AST
  console.log(`${getTaskProgress()}基于目录树生成 routes 的 AST`)
  const routeArrayAST = types.builders.arrayExpression(buildRoutesFromTree(tree))
  const fileAST = parse('', { parser })
  fileAST.program.body[0] = types.builders.exportDefaultDeclaration(
    types.builders.tsAsExpression(
      routeArrayAST,
      types.builders.tsTypeReference(types.builders.identifier('RouteRecordRaw[]')),
    ),
  )
  // 4. 合并路由增强配置"/router/options.ts"
  console.log(`${getTaskProgress()}合并路由增强配置"/router/options.ts"`)
  const routeOptions = parseOptionsFile(path.resolve(process.cwd(), './src/router/options.ts'))
  if (routeOptions.length > 0) {
    console.log(` - 成功解析 ${routeOptions.length} 条配置`)
    applyRouteOptionsToAST(routeArrayAST, routeOptions)
    console.log(` - 合并完成`)
  }
  else {
    console.log(' - 未发现可合并的自定义配置，或 options.ts 文件为空，跳过此步骤')
  }
  // 5. 编译抽象语法树生成最终 routes
  console.log(`${getTaskProgress()}编译抽象语法树生成最终 routes`)
  const importStatement = `import type { RouteRecordRaw } from 'vue-router'`
  const infoText = `/**
 * Vue Router 路由配置自动生成(v1.0)
 * @author WIFI连接超时
 */`
  let generatedCode = print(fileAST).code
  generatedCode = `${importStatement}\n${infoText}\n${generatedCode}`
  // 6. 代码格式化 && ESLint --fix
  console.log(`${getTaskProgress()}代码格式化 && ESLint --fix"`)
  generatedCode = generatedCode
    .replace(/(?:\n\s*){2,}/g, '\n') // 多个空行变 1 行
    .replace(/\[\{/g, '[\n{') // 对象换行
  generatedCode = await formatWithESLint(generatedCode)
  // 写入文件
  console.log(`${getTaskProgress()}写入文件`)
  fs.writeFileSync(outputPath, generatedCode)
  console.log('Done!')
}

main().catch(console.error)
