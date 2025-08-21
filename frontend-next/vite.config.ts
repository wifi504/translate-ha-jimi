import type { ComponentResolveResult, ComponentResolverFunction } from 'unplugin-vue-components'
import type { Plugin } from 'vite'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import { formatCSSVariableName, themeProxy } from './src/utils/global-theme.ts'

// 注入当前处在的Git提交SHA
const GIT_SHA = execSync('git rev-parse HEAD').toString().trim()
// 注入当前项目版本号
const PKG_JSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  base: '/hajimi/',
  plugins: [
    vue(),
    Components({
      dirs: ['src/components'],
      extensions: ['vue'],
      deep: true,
      dts: 'src/components.d.ts',
      resolvers: [
        NaiveUiResolver(),
        VIconsResolver(),
      ],
    }),
    themeCSS(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
  define: {
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(GIT_SHA),
    'import.meta.env.VITE_VERSION': JSON.stringify(PKG_JSON.version),
  },
  server: {
    port: 5200,
  },
  preview: {
    port: 5201,
  },
})

// 自动导入 vicons
function VIconsResolver(): ComponentResolverFunction {
  return function (name: string): ComponentResolveResult {
    // 把 ViLibraryComponent 这样的组件名解析出来，分别得到库和组件名
    function splitIconName(str: string): [string, string] | null {
      const match = str.match(/^Vi([A-Z][a-z0-9]*)(?=[A-Z])(.+)$/)
      if (!match) return null
      const [, firstWord, rest] = match
      return [firstWord, rest]
    }
    if (name.startsWith('Vi')) {
      const split = splitIconName(name)
      if (split && split[0] && split[1]) {
        return {
          name: split[1],
          from: `@vicons/${split[0].toLowerCase()}`,
        }
      }
    }
  }
}

// 自动定义全局CSS主题变量
function themeCSS(): Plugin {
  function genCSS(themeObj: Record<string, string>) {
    const vars = (Object.keys(themeObj) as Array<keyof typeof themeObj>)
      .map(key => `  ${formatCSSVariableName(key)}: none;`)
      .join('\n')
    return `/* 声明全局CSS变量，实际值会动态注入，使用 Vite Plugin 自动生成 */\n:root {\n${vars}\n}\n`
  }

  return {
    name: 'vite-plugin-theme-css',
    configResolved() {
      const css = genCSS(themeProxy)
      const outPath = path.resolve(process.cwd(), './src/assets/style/theme-define.css')
      fs.mkdirSync(path.dirname(outPath), { recursive: true })
      fs.writeFileSync(outPath, css, 'utf-8')
      console.log('✨ theme-define.css 已生成')
    },
  }
}
