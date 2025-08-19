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
