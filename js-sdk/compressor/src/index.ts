import pako from 'pako'
/**
 * 哈基压缩器
 *
 * @author WIFI连接超时
 * @version 1.1
 * Create Time 2025/8/18_23:13
 */

/**
 * 压缩
 *
 * @param data 被压缩的数据
 * @return 压缩后的数据
 */
export function compress(data: Uint8Array): Uint8Array {
  return pako.deflate(data)
}

/**
 * 解压
 *
 * @param data 被解压的数据
 * @return 解压后的数据
 */
export function decompress(data: Uint8Array): Uint8Array {
  return pako.inflate(data)
}
