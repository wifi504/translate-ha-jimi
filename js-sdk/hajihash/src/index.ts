import type { Message } from 'js-sha3'
import { sha3_256 } from 'js-sha3'

/**
 * 根据输入获取完整哈基摘要
 *
 * @param message 任意消息 string | number[] | ArrayBuffer | Uint8Array
 * @return 完整长度的哈基摘要
 */
export function sha256(message: Message): Uint8Array {
  return new Uint8Array(sha3_256.array(message))
}

/**
 * 根据输入获取哈基校验词
 *
 * @param message 任意消息 string | number[] | ArrayBuffer | Uint8Array
 * @return 两位校验位
 */
export function checkWord(message: Message): Uint8Array {
  return new Uint8Array(sha3_256.array(message).slice(0, 2))
}

/**
 * 根据完整哈基摘要校验输入
 *
 * @param message 任意消息 string | number[] | ArrayBuffer | Uint8Array
 * @param hash 完整长度的哈基摘要
 * @return 校验结果(boolean)
 */
export function verifySha256(message: Message, hash: Uint8Array): boolean {
  return arrayEqual<Uint8Array>(sha256(message), hash)
}

/**
 * 根据哈基校验词校验输入
 *
 * @param message 任意消息 string | number[] | ArrayBuffer | Uint8Array
 * @param hash 哈基校验词
 * @return 校验结果(boolean)
 */
export function verifyCheckWord(message: Message, hash: Uint8Array): boolean {
  return arrayEqual<Uint8Array>(checkWord(message), hash)
}

/**
 * 比较两个数组是否完全相等
 *
 * @param a 数组A
 * @param b 数组B
 */
function arrayEqual<T extends ArrayLike<number>>(a: T, b: T): boolean {
  return a.length === b.length && Array.prototype.every.call(a, (v, i) => v === b[i])
}
