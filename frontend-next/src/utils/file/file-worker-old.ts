// import type { Chunk } from '@/utils/file/file-chunk.ts'
// import { compressor, encryptor } from 'hayalib'
// import { ChunkMerger, splitIntoChunks } from '@/utils/file/file-chunk.ts'
// import { defineWorker, postToMain } from '@/utils/thread-pool'
//
// defineWorker(main)
//
// // 当前线程消耗的内存资源
// // let memoryUsed: number = 60 * 1024 * 1024
//
// // 基密文件处理
// async function main(data: any) {
//   // 处理基密文件
//   if (data.command === 'processHaJimiFile') {
//     return await processHaJimiFile(data.id, new Uint8Array(data.fileData), data.sharedKey, data.header)
//   }
//   // 处理普通文件
//   if (data.command === 'processNormalFile') {
//     return await processNormalFile(data.id, new Uint8Array(data.fileData), data.sharedKey)
//   }
// }
//
// // 处理基密文件
// async function processHaJimiFile(
//   id: string,
//   fileData: Uint8Array,
//   sharedKey: Uint8Array,
//   header: Uint8Array,
// ) {
//   // 1. 解密文件
//   const decryptState = encryptor.initDecryption(sharedKey, header)
//   const chunkMerger = new ChunkMerger((p) => {
//     postToMain('on-progress', { id, percent: (p * 0.6).toFixed(2) })
//   })
//   await splitIntoChunks(fileData, 30 * 1024 * 1024 + 17, (chunk: Chunk) => {
//     const decrypted = encryptor.decryptChunk(decryptState, chunk.data)
//     if (decrypted.isFinal && !(chunk.id === chunk.totalChunks - 1)) {
//       throw new Error('解密失败，分片数据不匹配！')
//     }
//     chunkMerger.push({
//       id: chunk.id,
//       data: decrypted.data,
//       totalSize: chunk.totalSize,
//       totalChunks: chunk.totalChunks,
//       start: chunk.start,
//       end: chunk.end,
//     })
//   })
//   await chunkMerger.waitForReady()
//   postToMain('gc-one', fileData.buffer, [fileData.buffer])
//   // 2. 解压文件
//   const decompressState = compressor.initDecompression()
//   chunkMerger.onProgress = (p) => {
//     postToMain('on-progress', { id, percent: (p * 0.4 + 60).toFixed(2) })
//   }
//   await chunkMerger.foreachEdit((chunk, edit) => {
//     const decompressed = compressor.decompressChunk(
//       decompressState,
//       chunk.data,
//       chunk.id === chunk.totalChunks - 1,
//     )
//     edit({
//       id: chunk.id,
//       data: decompressed,
//       totalSize: chunk.totalSize,
//       totalChunks: chunk.totalChunks,
//       start: chunk.start,
//       end: chunk.end,
//     })
//   })
//   await chunkMerger.waitForReady()
//   // 3. 返回最终文件
//   const res = chunkMerger.getResult()
//   return res.buffer
// }
//
// // 处理普通文件
// async function processNormalFile(
//   id: string,
//   file: File,
//   sharedKey: Uint8Array,
// ) {
//   // postToMain('on-progress', { id, percent: (p * 0.7).toFixed(2) })
//   // 1. 压缩文件
//   const compressState = compressor.initCompression()
//   const compressChunkMerger = new ChunkMerger((p) => {
//     postToMain('on-progress', { id, percent: (p * 0.7).toFixed(2) })
//   })
//   await splitIntoChunks(file, 10 * 1024 * 1024, (chunk: Chunk) => {
//     const compressed = compressor.compressChunk(
//       compressState,
//       chunk.data,
//       chunk.id === chunk.totalChunks - 1,
//     )
//     compressChunkMerger.push({
//       id: chunk.id,
//       data: compressed,
//       totalSize: chunk.totalSize,
//       totalChunks: chunk.totalChunks,
//       start: chunk.start,
//       end: chunk.end,
//     })
//   })
//   await compressChunkMerger.waitForReady()
//   postToMain('gc-one', fileData.buffer, [fileData.buffer])
//   const compressedData = compressChunkMerger.getResult()
//   // 2. 加密文件
//   const encryptState = encryptor.initEncryption(sharedKey)
//   const encryptChunkMerger = new ChunkMerger((p) => {
//     postToMain('on-progress', { id, percent: (p * 0.3 + 70).toFixed(2) })
//   })
//   await splitIntoChunks(compressedData, 30 * 1024 * 1024, (chunk: Chunk) => {
//     const encrypted = encryptor.encryptChunk(encryptState.state, chunk.data, chunk.id === chunk.totalChunks - 1)
//     encryptChunkMerger.push({
//       id: chunk.id,
//       data: encrypted,
//       totalSize: chunk.totalSize,
//       totalChunks: chunk.totalChunks,
//       start: chunk.start,
//       end: chunk.end,
//     })
//   })
//   await encryptChunkMerger.waitForReady()
//   postToMain('gc-one', compressedData.buffer, [compressedData.buffer])
//   // 3. 返回最终文件
//   const encryptedData = encryptChunkMerger.getResult()
//   const result = new Uint8Array(24 + encryptedData.length)
//   result.set(encryptState.header, 0)
//   result.set(encryptedData, 24)
//   postToMain('gc-one', encryptedData.buffer, [encryptedData.buffer])
//   return result.buffer
// }
//
// // 如果内存消耗达到阈值 300MB，我们申请完成这个任务后关闭此线程
// // function checkGarbageCollect() {
// //   if (memoryUsed >= 300 * 1024 * 1024) {
// //     requestTerminate(`利用 Transfer 机制回收内存，当前线程释放了内存 ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`)
// //   }
// // }
