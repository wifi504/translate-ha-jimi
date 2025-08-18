import pako from 'pako'
/**
 * 哈基压缩器
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/8/18_23:13
 */

/**
 * 压缩输入（支持 string 或 Uint8Array）
 *
 * @param input  string 会转成 Uint8Array 再压缩；Uint8Array 会直接压缩
 * @return 压缩后的Uint8Array
 */
export function compress(input: string | Uint8Array): Uint8Array {
  const data = typeof input === 'string' ? new TextEncoder().encode(input) : input
  return pako.deflate(data)
}

/**
 * 解压输入（支持输出 string 或 Uint8Array）
 *
 * @param data 被解压的数据
 * @param raw 若传入 raw=true，则返回 Uint8Array
 * @return 默认返回解压后的字符串
 */
export function decompress(data: Uint8Array, raw?: boolean): string | Uint8Array {
  const inflated = pako.inflate(data)
  return raw ? inflated : new TextDecoder().decode(inflated)
}
