import { encryptor, utils } from 'hayalib'
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
    1. 构造元数据
    2. 写入元数据
    3. 写入文件流（文件流处理：读取->压缩->加密->写入）
    4. 返回 "基密文件.hjm"
 */
async function handleNormalFile({ id, file, key }: FileWorkerArgs) {
  // 1. 构造元数据
  const { state: encryptState, header: encryptHeader } = encryptor.initEncryption(key)
  const meta = { fileName: file.name, header: utils.uint8ArrayToHex(encryptHeader) }
  const metaBytes = utils.buildMetaData(meta)
  // 2. 写入元数据
  writeDataChunk(id, metaBytes, true)
  console.log(id, file, key)
}

/*
  基密文件流程：
    1. 读取元数据，再次判断是不是基密文件，如果不是，抛出 FileProcessInfoStatus."FAIL_FILE_NOT_ALLOWED"
    2. 元数据解析出 header，初始化密钥流
    3. 写入文件流（文件流处理：读取->解密->解压->写入，如果解密出错，抛出 FileProcessInfoStatus."FAIL_WRONG_KEY"）
    4. 返回 元数据解析出的原文件名
 */
function handleJimiFile({ id, file, key }: FileWorkerArgs) {
  console.log(id, file, key)
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
