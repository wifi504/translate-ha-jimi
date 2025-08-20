import pako from 'pako'
/**
 * 哈基压缩器
 *
 * @author WIFI连接超时
 * @version 1.1
 * Create Time 2025/8/18_23:13
 */

/**
 * 直接压缩
 *
 * @param data 被压缩的数据
 * @return 压缩后的数据
 */
export function compress(data: Uint8Array): Uint8Array {
  return pako.deflate(data)
}

/**
 * 直接解压
 *
 * @param data 被解压的数据
 * @return 解压后的数据
 */
export function decompress(data: Uint8Array): Uint8Array {
  return pako.inflate(data)
}

/**
 * 压缩上下文
 */
export interface CompressState {
  deflate: pako.Deflate | undefined
  inflate: pako.Inflate | undefined
}

// 压缩等级
type Level = 0 | 6 | 1 | -1 | 2 | 3 | 4 | 5 | 7 | 8 | 9

/**
 * 初始化压缩流
 *
 * @param level 压缩等级
 */
export function initCompression(level: Level = 6): CompressState {
  const deflate = new pako.Deflate({ level })
  return { deflate, inflate: undefined }
}

/**
 * 初始化解压流
 */
export function initDecompression(): CompressState {
  const inflate = new pako.Inflate()
  return { inflate, deflate: undefined }
}

/**
 * 压缩分片文件
 *
 * @param state 压缩上下文
 * @param chunk 文件分片数据
 * @param isFinal 是否为最后一个分片
 * @return 压缩后的分片数据
 */
export function compressChunk(
  state: CompressState,
  chunk: Uint8Array,
  isFinal: boolean = false,
) {
  if (!state.deflate) throw new Error('需要先执行 initCompression()')
  const success = state.deflate.push(chunk, isFinal)
  if (!success) throw new Error(`压缩失败: ${state.deflate.msg}`)
  return state.deflate.result as Uint8Array
}

/**
 * 解压分片文件
 *
 * @param state 压缩上下文
 * @param chunk 文件分片数据
 * @param isFinal 是否为最后一个分片
 * @return 压缩后的分片数据
 */
export function decompressChunk(
  state: CompressState,
  chunk: Uint8Array,
  isFinal: boolean = false,
) {
  if (!state.inflate) throw new Error('需要先执行 initDecompression()')
  const success = state.inflate.push(chunk, isFinal)
  if (!success) throw new Error(`压缩失败: ${state.inflate.msg}`)
  return state.inflate.result as Uint8Array
}
