import type { Chunk } from '@/utils/file/file-chunk.ts'
import { compressor } from 'hayalib'
import { ChunkMerger, splitIntoChunks } from '@/utils/file/file-chunk.ts'
import { defineWorker, postToMain, requestTerminate } from '@/utils/thread-pool'

defineWorker(main)

// 当前线程消耗的内存资源
let memoryUsed: number = 0

// 基密文件处理
async function main(data: any) {
  // 处理基密文件
  if (data.command === 'processHaJimiFile') {
    return await processHaJimiFile(data.id, new Uint8Array(data.fileData), data.sharedKey)
  }
  // 处理普通文件
  if (data.command === 'processNormalFile') {
    return await processNormalFile(data.id, new Uint8Array(data.fileData), data.sharedKey)
  }
  // 利用 Transfer 机制回收垃圾
  if (data.command === 'give-up-data') {
    if (Array.isArray(data.data)) {
      let count: number = 0
      data.data.forEach((d: ArrayBuffer) => {
        memoryUsed += d.byteLength ?? 0
        count += d.byteLength ?? 0
      })
      console.log('回收垃圾：', (count / 1024 / 1024).toFixed(2), 'MB')
    }
    else {
      console.log('没有可回收的垃圾')
    }
    checkGarbageCollect()
    return null
  }
}

// 处理基密文件
async function processHaJimiFile(
  id: string,
  fileData: Uint8Array,
  sharedKey: Uint8Array,
) {
  console.log(sharedKey)
  memoryUsed += fileData.length
  // 1. 解密文件
  // 2. 解压文件
  const decompressState = compressor.initDecompression()
  const decompressChunkMerger = new ChunkMerger((p) => {
    postToMain('on-progress', { id, percent: (p).toFixed(2) })
  })
  await splitIntoChunks(fileData, 30 * 1024 * 1024, (chunk: Chunk) => {
    const decompressed = compressor.decompressChunk(
      decompressState,
      chunk.data,
      chunk.id === chunk.totalChunks - 1,
    )
    memoryUsed += decompressed.length * 2
    decompressChunkMerger.push({
      id: chunk.id,
      data: decompressed,
      totalSize: chunk.totalSize,
      totalChunks: chunk.totalChunks,
      start: chunk.start,
      end: chunk.end,
    })
  })
  // 3. 返回最终文件
  checkGarbageCollect()
  return (await decompressChunkMerger.getResult()).buffer
}

// 处理普通文件
async function processNormalFile(
  id: string,
  fileData: Uint8Array,
  sharedKey: Uint8Array,
) {
  console.log(sharedKey)
  memoryUsed += fileData.length + 32 * 1024 * 1024
  // 1. 压缩文件
  const compressState = compressor.initCompression()
  const compressChunkMerger = new ChunkMerger((p) => {
    postToMain('on-progress', { id, percent: (p).toFixed(2) })
  })
  await splitIntoChunks(fileData, 10 * 1024 * 1024, (chunk: Chunk) => {
    const compressed = compressor.compressChunk(
      compressState,
      chunk.data,
      chunk.id === chunk.totalChunks - 1,
    )
    compressChunkMerger.push({
      id: chunk.id,
      data: compressed,
      totalSize: chunk.totalSize,
      totalChunks: chunk.totalChunks,
      start: chunk.start,
      end: chunk.end,
    })
    memoryUsed += compressed.length * 2
  })
  const compressedData = await compressChunkMerger.getResult()
  // 2. 加密文件
  // 3. 返回最终文件
  checkGarbageCollect()
  return (compressedData).buffer
}

// 如果内存消耗达到阈值 300MB，我们申请完成这个任务后关闭此线程
function checkGarbageCollect() {
  console.warn('线程消耗了内存：', (memoryUsed / 1024 / 1024).toFixed(2), 'MB')
  if (memoryUsed >= 300 * 1024 * 1024) {
    requestTerminate('利用 Transfer 机制回收内存')
  }
}
