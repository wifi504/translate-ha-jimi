import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 递归删除所有名为dist的文件夹，排除node_modules目录
 * @param currentDir 起始目录路径
 */
function deleteDistFolders(currentDir: string): void {
  try {
    // 读取当前目录下的所有文件/文件夹
    const items = fs.readdirSync(currentDir, { withFileTypes: true })

    for (const item of items) {
      const itemPath = path.join(currentDir, item.name)

      // 跳过node_modules目录
      if (item.isDirectory() && item.name === 'node_modules') {
        continue
      }

      // 如果是目录
      if (item.isDirectory()) {
        // 如果是dist目录，删除它
        if (item.name === 'dist') {
          try {
            // 递归删除目录及其内容
            fs.rmSync(itemPath, { recursive: true, force: true })
            console.log(`已删除: ${itemPath}`)
          }
          catch (err) {
            console.error(`删除失败 ${itemPath}:`, err instanceof Error ? err.message : String(err))
          }
        }
        else {
          // 递归处理其他目录
          deleteDistFolders(itemPath)
        }
      }
    }
  }
  catch (err) {
    console.error(`访问目录失败 ${currentDir}:`, err instanceof Error ? err.message : String(err))
  }
}

// 从当前工作目录开始执行
deleteDistFolders(process.cwd())
console.log('操作完成')
