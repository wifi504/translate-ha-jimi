import { CompressClient } from '@hayalib/compressor'
import { decode, encode } from '@hayalib/encoder'
import { EncryptClient } from '@hayalib/encryptor'
import { hexToUint8Array, stringToUint8Array, uint8ArrayToHex, uint8ArrayToString } from '@hayalib/utils'
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

// 把普通的文件转换成基密文件
async function handleNormalFile(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void) {
  let totalPercent: number = 0
  // 对于meta，目前只需要保留原文件名，可能还有 header
  const meta = { fileName: file.name, header: '' }
  // 对于payload，先把File分片，然后逐个处理（压缩->加密?）
  const totalProgress = file.size
  const compressClient = new CompressClient('compress', (progress) => {
    totalPercent = Math.min(100, 100 * (progress / totalProgress)) * 0.8
    if (onProgress) onProgress(totalPercent)
  })
  let payload = await compressClient.handleFile(file)
  compressClient.terminate()
  if (sharedKey) {
    const encryptClient = new EncryptClient('encrypt', (progress) => {
      totalPercent = Math.min(100, 100 * (progress / payload.length)) * 0.2 + 80
      if (onProgress) onProgress(totalPercent)
    })
    const header = await encryptClient.initEncrypt(sharedKey)
    meta.header = uint8ArrayToHex(header)
    console.log('加密Header：', header, meta.header)
    payload = await encryptClient.handleData(payload)
    encryptClient.terminate()
  }
  const metaStr = encode(stringToUint8Array(JSON.stringify(meta)), '基密文件')
  const metaData = stringToUint8Array(metaStr)
  downloadFile(packData(payload, metaData), '基密文件.hjm')
}

// 把基密文件转换成普通的文件
async function handleHaJimiFile(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void) {
  const haJiFile = unpackData(new Uint8Array(await file.arrayBuffer()))
  const meta = JSON.parse(uint8ArrayToString(decode(uint8ArrayToString(haJiFile.metadata))))
  console.log(meta)
  console.log('解密Header：', meta, hexToUint8Array(meta.header))
  const totalProgress = haJiFile.payload.length
  let payload = haJiFile.payload
  if (sharedKey) {
    const decryptClient = new EncryptClient('decrypt', (progress) => {
      if (onProgress) onProgress(Math.min(100, 100 * (progress / totalProgress)))
    })
    decryptClient.initDecrypt(sharedKey, hexToUint8Array(meta.header))
    payload = await decryptClient.handleData(payload)
    decryptClient.terminate()
  }
  const decompressClient = new CompressClient('decompress', (progress) => {
    if (onProgress) onProgress(Math.min(100, 100 * (progress / totalProgress)))
  })
  payload = await decompressClient.handleData(payload)
  decompressClient.terminate()
  if (!payload || payload.length === 0) {
    if (onProgress) onProgress(0)
    throw new Error('解密失败！')
  }
  downloadFile(payload, meta.fileName)
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
 * 浏览器触发下载文件动作
 *
 * @param data 给用户下载的数据
 * @param filename 文件名
 * @param meta 可以附加的元数据
 */
function downloadFile(data: Uint8Array, filename: string, meta?: any) {
  const pack = meta ? packData(data, meta) : data
  const blob = new Blob([pack], { type: 'application/octet-stream' })
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
 * 打包元数据
 *
 * @param payload 载荷数据
 * @param metadata 元数据
 */
function packData(payload: Uint8Array, metadata: Uint8Array): Uint8Array {
  // 1. 写头部：元数据长度（4字节）
  const header = new Uint8Array(4)
  new DataView(header.buffer).setUint32(0, metadata.length, true)

  // 2. 拼接：header + meta + payload
  const packed = new Uint8Array(header.length + metadata.length + payload.length)
  packed.set(header, 0)
  packed.set(metadata, header.length)
  packed.set(payload, header.length + metadata.length)

  return packed
}

/**
 * 解包元数据
 *
 * @param packed 打包数据
 */
function unpackData(packed: Uint8Array) {
  const view = new DataView(packed.buffer)
  const metaLen = view.getUint32(0, true)

  const metadata = packed.slice(4, 4 + metaLen)
  const payload = packed.slice(4 + metaLen)

  return { metadata, payload }
}
