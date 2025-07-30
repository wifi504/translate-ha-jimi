/**
 * 哈基密语文本压缩服务
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
import pako from 'pako'

export class TextCompressService {
  /**
   * 压缩字符串为 Uint8Array
   * @param text 要压缩的文本
   * @returns Uint8Array 压缩结果
   */
  static a(text: string): Uint8Array {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    return pako.deflate(data)
  }

  /**
   * 解压 Uint8Array 为字符串
   * @param data 加密前压缩得到的 Uint8Array
   * @returns string 解压后的原始字符串
   */
  static x(data: Uint8Array): string {
    const inflated = pako.inflate(data)
    const decoder = new TextDecoder()
    return decoder.decode(inflated)
  }
}
