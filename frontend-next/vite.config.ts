import type { ComponentResolveResult, ComponentResolverFunction } from 'unplugin-vue-components'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
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
