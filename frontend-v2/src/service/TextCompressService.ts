import pako from 'pako'
/**
 * 哈基密语文本压缩服务
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
export class TextCompressService {
  /**
   * 压缩输入（支持 string 或 Uint8Array）
   *  - string 会转成 Uint8Array 再压缩
   *  - Uint8Array 会直接压缩
   */
  static a(input: string | Uint8Array): Uint8Array {
    const data = typeof input === 'string' ? new TextEncoder().encode(input) : input
    return pako.deflate(data)
  }

  /**
   * 解压输入（支持输出 string 或 Uint8Array）
   * - 默认返回解压后的字符串
   * - 若传入 raw=true，则返回 Uint8Array
   */
  static x(data: Uint8Array, raw?: boolean): string | Uint8Array {
    const inflated = pako.inflate(data)
    return raw ? inflated : new TextDecoder().decode(inflated)
  }
}
