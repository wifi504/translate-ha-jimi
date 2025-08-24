import type ThreadPool from '@/utils/thread-pool'
import { utils } from 'hayalib'

export interface FinalFile { fileArrayBuffer: ArrayBuffer, fileName: string }

/**
 * 基密文件处理器，把文件处理完成后调用浏览器下载
 *
 * @param id 任务唯一ID
 * @param file 浏览器上传的文件
 * @param fileWorkerPool 基密文件 Worker 的线程池
 * @param sharedKey chacha20的对称密钥
 * @return FinalFile 最后返回的可以下载的文件
 */
export async function processFile(
  id: string,
  file: File,
  fileWorkerPool: ThreadPool,
  sharedKey: Uint8Array,
): Promise<FinalFile> {
  if (getFileExtension(file.name) === 'hjm') {
    // 判断文件类型，如果是基密文件，则解密成普通文件
    return await processHaJimiFile(id, file, fileWorkerPool, sharedKey)
  }
  else {
    // 如果是普通文件，则加密成基密文件
    return await processNormalFile(id, file, fileWorkerPool, sharedKey)
  }
}

// 处理基密文件
async function processHaJimiFile(id: string, file: File, fileWorkerPool: ThreadPool, sharedKey: Uint8Array): Promise<FinalFile> {
  // 1. 解包元数据
  const unpacked = utils.unpackData(new Uint8Array(await file.arrayBuffer()))
  const fileData: ArrayBuffer = unpacked.payload.buffer
  // 2. 线程池提交 processHaJimiFile 任务
  const result: ArrayBuffer = await fileWorkerPool.submit({
    command: 'processHaJimiFile',
    id,
    fileData,
    sharedKey,
  }, [fileData])
  // 3. 最后返回可以下载的文件
  return {
    fileArrayBuffer: result,
    fileName: unpacked.meta.fileName,
  }
}

// 处理普通文件
async function processNormalFile(id: string, file: File, fileWorkerPool: ThreadPool, sharedKey: Uint8Array): Promise<FinalFile> {
  // 1. 线程池提交 processNormalFile 任务
  const fileData = await file.arrayBuffer()
  const result: ArrayBuffer = await fileWorkerPool.submit({
    command: 'processNormalFile',
    id,
    fileData,
    sharedKey,
  }, [fileData])
  // 2. 打包元数据
  const finalData = utils.packData(new Uint8Array(result), { fileName: file.name })
  // 3. 最后返回可以下载的文件
  return {
    fileArrayBuffer: finalData.buffer as ArrayBuffer,
    fileName: '基密文件.hjm',
  }
}

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

/**
 * 检查拓展名属不属于图片
 *
 * @param extension 拓展名
 */
export function checkExtentionAsImage(extension: string): boolean {
  const images = ['jpg', 'jpeg', 'png', 'gif']
  return images.includes(extension.toLowerCase())
}
