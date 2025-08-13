/**
 * 剪贴板工具
 */

/**
 * 读取剪贴板（可能需要授权，是个异步string）
 */
export async function readClipboard(): Promise<string> {
  return await navigator.clipboard.readText()
}

/**
 * 复制到剪贴板（可能需要授权，是个异步void）
 * @param text 要复制的文本
 */
export async function writeClipboard(text: string): Promise<void> {
  return await navigator.clipboard.writeText(text)
}
