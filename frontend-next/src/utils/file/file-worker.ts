import type { Chunk } from '@/utils/file/file-chunk.ts'
import { compressor } from 'hayalib'
import { ChunkMerger, splitIntoChunks } from '@/utils/file/file-chunk.ts'
import { defineWorker, postToMain, requestTerminate } from '@/utils/thread-pool'

defineWorker(main)

// 当前线程消耗的内存资源
const memoryUsed: number = 0

// 基密文件处理
async function main(data: any) {
  // 如果内存消耗达到阈值 2GB，我们申请完成这个任务后关闭此线程
  if (memoryUsed >= 2 * 1024 * 1024 * 1024) {
    requestTerminate('利用 Transfer 机制回收垃圾')
  }
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
    // 什么都不做
    return null
  }
}

// 处理基密文件
async function processHaJimiFile(
  id: string,
  fileData: Uint8Array,
  sharedKey: Uint8Array,
) {
  // 1. 解密文件
  // 2. 解压文件
  const decompressState = compressor.initDecompression()
  const decompressChunkMerger = new ChunkMerger((p) => {
    postToMain('on-progress', { id, percent: (p).toFixed(2) })
  })
  await splitIntoChunks(fileData, 30 * 1024 * 1024, (chunk: Chunk) => {
    const compressed = compressor.decompressChunk(
      decompressState,
      chunk.data,
      chunk.id === chunk.totalChunks - 1,
    )
    decompressChunkMerger.push({
      id: chunk.id,
      data: compressed,
      totalSize: chunk.totalSize,
      totalChunks: chunk.totalChunks,
      start: chunk.start,
      end: chunk.end,
    })
  })
  // 3. 返回最终文件
  return (await decompressChunkMerger.getResult()).buffer
}

// 处理普通文件
async function processNormalFile(
  id: string,
  fileData: Uint8Array,
  sharedKey: Uint8Array,
) {
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
  })
  // 2. 加密文件
  // 3. 返回最终文件
  return (await compressChunkMerger.getResult()).buffer
}
