/**
 * 浏览器触发下载文件动作
 *
 * @param data 给用户下载的数据
 * @param filename 文件名
 */
export function downloadFile(data: Uint8Array, filename: string) {
  const blob = new Blob([data], { type: 'application/octet-stream' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 获取文件拓展名
 *
 * @param filename 文件名
 * @return 拓展名（没有则为null）
 */
export function getFileExtension(filename: string): string | null {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return null
  }
  return filename.slice(lastDot + 1).toLowerCase()
}
