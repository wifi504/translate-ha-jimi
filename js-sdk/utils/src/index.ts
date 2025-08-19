/**
 * 哈基工具
 *
 * @author WIFI连接超时
 * @version 1.1
 * Create Time 2025/8/19_15:33
 */

/**
 * 字符串 --转换-> Uint8Array (UTF-8)
 *
 * @param str 字符串
 */
export function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

/**
 * Uint8Array --转换-> 字符串 (UTF-8)
 *
 * @param arr Uint8Array
 */
export function uint8ArrayToString(arr: Uint8Array): string {
  return new TextDecoder().decode(arr)
}

/**
 * Uint8Array --转换-> Hex
 *
 * @param arr Uint8Array
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Hex --转换-> Uint8Array
 *
 * @param hex Hex
 */
export function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string')
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = Number.parseInt(hex.substring(i, 2), 16)
  }
  return arr
}

/**
 * 对象 --转换-> Uint8Array
 *
 * @param obj 对象
 */
export function objectToUint8Array(obj: any): Uint8Array {
  const json = JSON.stringify(obj)
  return new TextEncoder().encode(json)
}

/**
 * Uint8Array --转换-> 对象
 *
 * @param arr Uint8Array
 */
export function uint8ArrayToObject(arr: Uint8Array): any {
  const json = new TextDecoder().decode(arr)
  return JSON.parse(json)
}

/**
 * 浏览器触发下载文件动作
 *
 * @param data 给用户下载的数据
 * @param filename 文件名
 * @param meta 可以附加的元数据
 */
export function downloadFile(data: Uint8Array, filename: string, meta?: any) {
  const pack = meta ? packFile(data, meta) : data
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
 * 文件打包元数据
 *
 * @param payload 载荷数据
 * @param metadata 元数据
 */
export function packFile(payload: Uint8Array, metadata: any): Uint8Array {
  // 1. 元数据序列化
  const metaJson = JSON.stringify(metadata)
  const metaBytes = new TextEncoder().encode(metaJson)

  // 2. 写头部：元数据长度（4字节）
  const header = new Uint8Array(4)
  new DataView(header.buffer).setUint32(0, metaBytes.length, true)

  // 3. 拼接：header + meta + payload
  const packed = new Uint8Array(header.length + metaBytes.length + payload.length)
  packed.set(header, 0)
  packed.set(metaBytes, header.length)
  packed.set(payload, header.length + metaBytes.length)

  return packed
}

/**
 * 文件解包元数据
 *
 * @param packed 打包数据
 */
export function unpackFile(packed: Uint8Array) {
  const view = new DataView(packed.buffer)
  const metaLen = view.getUint32(0, true)

  const metaBytes = packed.slice(4, 4 + metaLen)
  const metadata = JSON.parse(new TextDecoder().decode(metaBytes))

  const payload = packed.slice(4 + metaLen)

  return { metadata, payload }
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
