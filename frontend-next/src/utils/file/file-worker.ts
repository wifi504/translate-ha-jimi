import type { Chunk } from '@/utils/file/file-chunk.ts'
import { compressChunk, decompressChunk, initCompression, initDecompression } from '@hayalib/compressor'
import { decryptChunk, encryptChunk, initDecryption, initEncryption } from '@hayalib/encryptor'
import { buildMetaData, extractMetaDataInfo, hexToUint8Array, uint8ArrayToHex } from '@hayalib/utils'
import ChunkCollector from '@/utils/file/chunk-collector.ts'
import { splitIntoChunks } from '@/utils/file/file-chunk.ts'
import { getFileExtension } from '@/utils/file/file-utils.ts'
import { defineWorker, postToMain } from '@/utils/thread-pool'

defineWorker(main)

export interface FileWorkerArgs { id: number, file: File, key: Uint8Array }

/**
 * 基密文件处理
 *
 *  - id: 文件的ID，用于通知进度
 *  - file: File 对象
 *  - key: 对称加解密用的密钥
 *
 * @return string 处理后的文件名
 * @throws Error 错误消息为 FileProcessInfoStatus 类型
 */
function main(args: FileWorkerArgs) {
  // 首先判断文件拓展名，如果是普通文件，走处理普通文件的流程，如果是基密文件，走基密文件的流程
  if (getFileExtension(args.file.name) === 'hjm') {
    return handleJimiFile(args)
  }
  else {
    return handleNormalFile(args)
  }
}

/*
  普通文件流程：
    1. 构造元数据，返回 "基密文件.hjm" 文件名
    2. 写入元数据
    3. 写入文件流（文件流处理：读取->压缩->加密->写入）
 */
async function handleNormalFile({ id, file, key }: FileWorkerArgs) {
  // 1. 初始化加密流、构造元数据
  const { state: encryptState, header: encryptHeader } = initEncryption(key)
  const meta = { fileName: file.name, header: uint8ArrayToHex(encryptHeader) }
  const metaBytes = buildMetaData(meta)
  // 2. 写入元数据
  writeDataChunk(id, metaBytes)
  callbackProgress(id, 0)
  // 3. 初始化压缩流
  const compressState = initCompression()
  // 4. 初始化加密缓冲区
  const handleEncrypt = (chunk: Uint8Array, isLast: boolean) => {
    const encrypted = encryptChunk(encryptState, chunk, isLast)
    writeDataChunk(id, encrypted, isLast)
  }
  const chunkCollector = new ChunkCollector(30 * 1024 * 1024, handleEncrypt)
  // 4. 分片读取文件并处理
  await splitIntoChunks(file, 20 * 1024 * 1024, async (chunk: Chunk) => {
    const isFinal = chunk.id === chunk.totalChunks - 1
    // 压缩
    const compressed = compressChunk(compressState, chunk.data, isFinal)
    // 加密
    chunkCollector.push(compressed, isFinal)
    callbackProgress(id, ((chunk.id + 1) / chunk.totalChunks) * 100)
  })
}

/*
  基密文件流程：
    1. 读取元数据，再次判断是不是基密文件，如果不是，抛出 FileProcessInfoStatus."FAIL_FILE_NOT_ALLOWED"
    2. 元数据解析出 header，初始化密钥流
    3. 写入文件流（文件流处理：读取->解密->解压->写入，如果解密出错，抛出 FileProcessInfoStatus."FAIL_WRONG_KEY"）
 */
async function handleJimiFile({ id, file, key }: FileWorkerArgs) {
  try {
    const { data, metaByteLength }: { data: any, metaByteLength: number } = await extractMetaDataInfo(file)
    // 初始化解密流
    const decryptState = initDecryption(key, hexToUint8Array(data.header))
    // 初始化解压流
    const decompressState = initDecompression()
    const handleDecompress = (chunk: Uint8Array, isLast: boolean) => {
      const decompressed = decompressChunk(decompressState, chunk, isLast)
      writeDataChunk(id, decompressed, isLast)
    }
    const chunkCollector = new ChunkCollector(20 * 1024 * 1024, handleDecompress)
    // 解密的分片要比加密的分片多17字节（TAG和标记的16+1）
    await splitIntoChunks(file, 30 * 1024 * 1024 + 17, async (chunk: Chunk) => {
      try {
        const { data, isFinal }: { data: Uint8Array, isFinal: boolean } = decryptChunk(decryptState, chunk.data)
        if (isFinal !== (chunk.id === chunk.totalChunks - 1)) {
          throw new Error('decrypt-failed')
        }
        chunkCollector.push(data, isFinal)
      }
      catch {
        throw new Error('decrypt-failed')
      }
      callbackProgress(id, ((chunk.id + 1) / chunk.totalChunks) * 100)
    }, metaByteLength)
  }
  catch (e) {
    if (e instanceof Error) {
      if (e.message === 'decrypt-failed') {
        throw new Error('FAIL_WRONG_KEY')
      }
      else {
        throw new Error('FAIL_FILE_NOT_ALLOWED')
      }
    }
  }
}

/**
 * 向主线程报告任务进度
 *
 * @param id 文件ID
 * @param progress 进度
 */
function callbackProgress(id: number, progress: number) {
  postToMain('on-process', { id, progress })
}

/**
 * 向主线程要写的数据分片
 *
 * @param id 文件ID
 * @param data 数据
 * @param isFinal 是否结束写入
 */
function writeDataChunk(id: number, data: Uint8Array, isFinal = false) {
  postToMain('write-data-chunk', {
    id,
    data,
    isFinal,
  }, [data.buffer])
}
