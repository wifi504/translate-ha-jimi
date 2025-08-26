import type ThreadPool from '@/utils/thread-pool'
import { utils } from 'hayalib'

/**
 * 基密文件处理器，把文件处理完成后调用浏览器下载（这种方式太占内存了，废弃处理）
 *
 * @param id 任务唯一ID
 * @param file 浏览器上传的文件
 * @param fileWorkerPool 基密文件 Worker 的线程池
 * @param gcWorkerPool 垃圾回收线程池
 * @param sharedKey chacha20的对称密钥
 */
export async function processFile(
  id: string,
  file: File,
  fileWorkerPool: ThreadPool,
  gcWorkerPool: ThreadPool,
  sharedKey: Uint8Array,
) {
  if (getFileExtension(file.name) === 'hjm') {
    // 判断文件类型，如果是基密文件，则解密成普通文件
    return await processHaJimiFile(id, file, fileWorkerPool, gcWorkerPool, sharedKey)
  }
  else {
    // 如果是普通文件，则加密成基密文件
    return await processNormalFile(id, file, fileWorkerPool, gcWorkerPool, sharedKey)
  }
}

// 处理基密文件
async function processHaJimiFile(id: string, file: File, fileWorkerPool: ThreadPool, gcWorkerPool: ThreadPool, sharedKey: Uint8Array) {
  // 1. 解包元数据
  const unpacked = utils.unpackData(new Uint8Array(await file.arrayBuffer()))
  const fileData: ArrayBuffer = unpacked.payload.buffer
  // 2. 线程池提交 processHaJimiFile 任务
  const result: ArrayBuffer = await fileWorkerPool.submit({
    command: 'processHaJimiFile',
    id,
    fileData,
    sharedKey,
    header: utils.hexToUint8Array(unpacked.meta.header),
  }, [fileData])
  // 3. 下载文件
  downloadFile(new Uint8Array(result), unpacked.meta.fileName)
  // 4. 释放内存
  await gcWorkerPool.submit([result], [result])
  return unpacked.meta.fileName as string
}

// 处理普通文件
async function processNormalFile(id: string, file: File, fileWorkerPool: ThreadPool, gcWorkerPool: ThreadPool, sharedKey: Uint8Array) {
  // 1. 线程池提交 processNormalFile 任务
  const fileData = await file.arrayBuffer()
  const result: ArrayBuffer = await fileWorkerPool.submit({
    command: 'processNormalFile',
    id,
    fileData,
    sharedKey,
  }, [fileData])
  // 2. 打包元数据
  const resultData = new Uint8Array(result)
  const header = utils.uint8ArrayToHex(resultData.subarray(0, 24))
  const content = resultData.subarray(24)
  const finalData = utils.packData(content, { fileName: file.name, header })
  // 3. 下载文件
  downloadFile(finalData, '基密文件.hjm')
  // 4. 释放内存
  await gcWorkerPool.submit([result, finalData.buffer], [result, finalData.buffer])
  return '基密文件.hjm'
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
export function checkExtensionAsImage(extension: string | null): boolean {
  if (extension === null) return false
  const images = ['jpg', 'jpeg', 'png', 'gif']
  return images.includes(extension.toLowerCase())
}
