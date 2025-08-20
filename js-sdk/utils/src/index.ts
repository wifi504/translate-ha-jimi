import { decode, encode } from '@hayalib/encoder'
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
    arr[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16)
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
 * 合并多个 Uint8Array
 *
 * @param chunks Uint8Array[]
 */
export function mergeUint8Arrays(chunks: Uint8Array[]): Uint8Array {
  // 1. 计算总长度
  const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0)

  // 2. 创建一个新 Uint8Array
  const merged = new Uint8Array(totalLength)

  // 3. 逐个拷贝
  let offset = 0
  for (const arr of chunks) {
    merged.set(arr, offset)
    offset += arr.length
  }

  return merged
}

/**
 * 打包元数据
 *
 * @param payload 载荷数据
 * @param meta 可以被JSON序列化的元数据对象
 */
export function packData(payload: Uint8Array, meta: any): Uint8Array {
  // 1. 处理元数据
  const metadata: Uint8Array = stringToUint8Array(encode(stringToUint8Array(JSON.stringify(meta))))
  // 2. 写头部：元数据长度（4字节）
  const header = new Uint8Array(4)
  new DataView(header.buffer).setUint32(0, metadata.length, true)

  // 3. 拼接：header + meta + payload
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
 * @return 解包出来的元数据对象和载荷数据
 */
export function unpackData(packed: Uint8Array) {
  const view = new DataView(packed.buffer)
  const metaLen = view.getUint32(0, true)

  const metadata = packed.slice(4, 4 + metaLen)
  const payload = packed.slice(4 + metaLen)

  const meta: any = JSON.parse(uint8ArrayToString(decode(uint8ArrayToString(metadata))))

  return { meta, payload }
}
