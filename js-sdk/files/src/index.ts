/* eslint-disable unused-imports/no-unused-vars */
import { getFileExtension } from './file-utils'
/**
 * 基密文件处理器
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/8/19_22:57
 */

/**
 * 处理文件上传，判断文件是普通文件还是基密文件，处理完毕后下载
 *
 * @param file 浏览器上传的文件
 * @param sharedKey chacha20 的加密密钥，如果传 null 则纯压缩
 * @param onProgress 可选对进度回调
 */
export function handleFileUpload(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void) {
  if (getFileExtension(file.name) === 'hjm') {
    return handleHaJimiFile(file, sharedKey, onProgress)
  }
  else {
    return handleNormalFile(file, sharedKey, onProgress)
  }
}

// 基密文件 -> 普通文件
async function handleHaJimiFile(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void) {

}

// 普通文件 -> 基密文件
async function handleNormalFile(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void) {

}
