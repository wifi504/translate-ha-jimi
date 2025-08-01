import { spawn } from 'node:child_process'
import chokidar from 'chokidar'

const watcher = chokidar.watch('src/views/**/*.vue', {
  ignoreInitial: true,
})

watcher.on('add', run).on('unlink', run).on('change', run)

function run() {
  const proc = spawn('ts-node', ['scripts/generate-routes.ts'], { stdio: 'inherit' })
}
