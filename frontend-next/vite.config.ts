import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 注入当前处在的Git提交SHA
const GIT_SHA = execSync('git rev-parse HEAD').toString().trim()
// 注入当前项目版本号
const PKG_JSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  base: '/hajimi/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5200,
  },
  define: {
    'import.meta.env.VITE_GIT_SHA': JSON.stringify(GIT_SHA),
    'import.meta.env.VITE_VERSION': JSON.stringify(PKG_JSON.version),
  },
})
