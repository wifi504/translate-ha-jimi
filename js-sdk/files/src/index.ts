/* eslint-disable unused-imports/no-unused-vars */
import { encode } from '@hayalib/encoder'
import { stringToUint8Array } from '@hayalib/utils'
import workerpool from 'workerpool'
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
 * @param sharedKey chacha20 的加密密钥，如果传 null 则纯编码
 * @param progressRef 可选传入一个 Ref 对象，执行期间会把进度实时更新
 * @param progressRef.value 响应式变量
 */
export function handleFileUpload(file: File, sharedKey: Uint8Array | null, progressRef?: { value: any }) {
  const ref = progressRef || { value: undefined }
  ref.value = 0
  if (getFileExtension(file.name) === 'hjm') {
    return handleHaJimiFile(file, sharedKey, ref)
  }
  else {
    return handleNormalFile(file, sharedKey, ref)
  }
}

// TODO 继续把文件处理的多线程实现做完
// 把普通的文件转换成基密文件
async function handleNormalFile(file: File, sharedKey: Uint8Array | null, progressRef: { value: any }) {
  // 对于meta，目前只需要保留原文件名
  const meta = encode(stringToUint8Array(JSON.stringify({ fileName: file.name })), '基密文件')
  const metaData = stringToUint8Array(meta)
  // 对于payload，先把File分片，然后逐个处理（压缩->加密?），直接写
  const pool = workerpool.pool()
  await pool.terminate()
}

// 把基密文件转换成普通的文件
async function handleHaJimiFile(file: File, sharedKey: Uint8Array | null, progressRef: { value: any }) {

}

/**
 测试流程
 const file = options.file.file as File
 console.log(file)
 const buf = await file.arrayBuffer()
 console.log(buf)
 uploadRef.value.clear()
 if (files.getFileExtension(file.name) !== 'hjm') {
 // 文件
 const payload = compressor.compress(new Uint8Array(buf))
 // 文件元数据
 const meta = encoder.encode(utils.stringToUint8Array(JSON.stringify({
 fileName: file.name,
 })), '基密文件')
 files.downloadFile(files.packData(payload, utils.stringToUint8Array(meta)), '基密文件.hjm')
 }
 else {
 const haJiFile = files.unpackData(new Uint8Array(buf))
 const payload = compressor.decompress(haJiFile.payload)
 const meta = JSON.parse(utils.uint8ArrayToString(encoder.decode(utils.uint8ArrayToString(haJiFile.metadata))))
 files.downloadFile(payload, meta.fileName)
 }
 */

/**
 * 获取文件拓展名
 *
 * @param filename 文件名
 * @return 拓展名（没有则为null）
 */
function getFileExtension(filename: string): string | null {
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

/**
 * 分片文件
 *
 * @param file File
 * @param chunkSize 分片大小
 */
async function splitFile(file: File, chunkSize = 20 * 1024 * 1024): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = []
  let offset = 0

  while (offset < file.size) {
    const blob = file.slice(offset, offset + chunkSize)
    const buffer = await blob.arrayBuffer()
    chunks.push(new Uint8Array(buffer))
    offset += chunkSize
  }

  return chunks
}

/**
 * 合并分片文件
 *
 * @param chunks 文件分片
 */
function mergeChunks(chunks: { index: number, data: Uint8Array }[]): Uint8Array {
  // 1. 按 index 排序
  chunks.sort((a, b) => a.index - b.index)

  // 2. 计算总长度
  const totalLength = chunks.reduce((sum, c) => sum + c.data.length, 0)

  // 3. 拼接
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const c of chunks) {
    result.set(c.data, offset)
    offset += c.data.length
  }

  return result
}
