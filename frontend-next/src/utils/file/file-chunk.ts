/**
 * 文件分片
 */
interface Chunk {
  id: number // 分片ID，从0开始
  data: Uint8Array // 分片数据
  totalSize: number // 文件总大小（字节）
  totalChunks: number // 总分片数量
  start: number // 分片在原始数据中的起始位置
  end: number // 分片在原始数据中的结束位置（不包含）
}

/**
 * 将数据分片并通过回调返回每个分片
 *
 * @param data 要分片的数据（File对象或Uint8Array）
 * @param chunkSize 每个分片的大小（字节）
 * @param onChunk 每获取到一个分片时的回调函数
 */
async function splitIntoChunks(
  data: File | Uint8Array,
  chunkSize: number,
  onChunk: (chunk: Chunk) => void,
): Promise<void> {
  if (chunkSize <= 0) {
    throw new Error('分片大小必须大于0')
  }

  const totalSize = data instanceof File ? data.size : data.length
  if (totalSize === 0) {
    throw new Error('数据为空，无法分片')
  }

  // 计算总分片数量，向上取整
  const totalChunks = Math.ceil(totalSize / chunkSize)

  if (data instanceof File) {
    // 处理File对象，使用slice方法避免一次性加载到内存
    for (let id = 0; id < totalChunks; id++) {
      const start = id * chunkSize
      const end = Math.min(start + chunkSize, totalSize)

      // 从File中读取分片
      const fileSlice = data.slice(start, end)

      // 将分片转换为Uint8Array
      const arrayBuffer = await fileSlice.arrayBuffer()
      const chunkData = new Uint8Array(arrayBuffer)

      // 调用回调函数
      onChunk({
        id,
        data: chunkData,
        totalSize,
        totalChunks,
        start,
        end,
      })
    }
  }
  else {
    // 处理Uint8Array
    for (let id = 0; id < totalChunks; id++) {
      const start = id * chunkSize
      const end = Math.min(start + chunkSize, totalSize)

      // 直接从Uint8Array中截取分片
      const chunkData = data.subarray(start, end)

      // 调用回调函数
      onChunk({
        id,
        data: chunkData,
        totalSize,
        totalChunks,
        start,
        end,
      })
    }
  }
}

/**
 * 用于合并文件分片的类
 */
class ChunkMerger {
  private readonly promise: Promise<Uint8Array>
  private resolve: (value: Uint8Array) => void = () => {}
  private reject: (reason: Error) => void = () => {}
  private readonly onProgress: (progress: number) => void
  private totalChunks: number | null = null
  private receivedChunks: Map<number, Uint8Array> = new Map()
  private isCompleted: boolean = false
  private isRejected: boolean = false

  /**
   * 创建一个ChunkMerger实例
   *
   * @param onProgress 进度回调函数，参数为0-100的百分比
   */
  constructor(onProgress: (progress: number) => void) {
    this.onProgress = onProgress
    // 初始化进度为0
    this.onProgress(0)

    // 创建Promise并保存resolve和reject方法
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * 处理一个分片
   *
   * @param chunk 要处理的分片
   * @throws 如果已完成、已拒绝或分片无效则抛出错误
   */
  push(chunk: Chunk): void {
    console.log('push了新的分片：', chunk)
    // 检查状态
    if (this.isCompleted) {
      throw new Error('所有分片已处理完成，不能再添加新分片')
    }
    if (this.isRejected) {
      throw new Error('处理已失败，不能再添加新分片')
    }

    // 第一次push时初始化
    if (this.totalChunks === null) {
      this.totalChunks = chunk.totalChunks
    }
    else {
      // 验证分片的一致性
      if (chunk.totalChunks !== this.totalChunks) {
        const error = new Error(`总分片数量不一致，预期: ${this.totalChunks}, 实际: ${chunk.totalChunks}`)
        this.reject(error)
        this.isRejected = true
        throw error
      }
    }

    // 检查分片ID是否有效
    if (chunk.id < 0 || chunk.id >= this.totalChunks!) {
      const error = new Error(`无效的分片ID: ${chunk.id}，总分片数量: ${this.totalChunks}`)
      this.reject(error)
      this.isRejected = true
      throw error
    }

    // 检查是否为重复分片
    if (this.receivedChunks.has(chunk.id)) {
      const error = new Error(`重复的分片ID: ${chunk.id}`)
      this.reject(error)
      this.isRejected = true
      throw error
    }

    // 将分片数据写入缓冲区
    this.receivedChunks.set(chunk.id, chunk.data)

    // 更新进度
    const progress = (this.receivedChunks.size / this.totalChunks!) * 100
    this.onProgress(progress)

    // 检查是否所有分片都已处理完成
    if (this.receivedChunks.size === this.totalChunks) {
      this.isCompleted = true
      let totalLength: number = 0
      this.receivedChunks.forEach((chunk) => {
        totalLength += chunk.length
      })
      const merged = new Uint8Array(totalLength)
      let offset = 0
      for (let i = 0; i < this.totalChunks; i++) {
        const get = this.receivedChunks.get(i)
        if (get) {
          merged.set(get, offset)
          offset += get.length
        }
        else {
          throw new Error('ChunkMerger分片数据不完整，拼接失败！')
        }
      }
      this.receivedChunks.clear()
      this.resolve(merged)
    }
  }

  /**
   * 获取合并结果的Promise
   *
   * @returns 包含合并后数据的Promise
   */
  getResult(): Promise<Uint8Array> {
    return this.promise
  }
}

export type { Chunk }
export { ChunkMerger, splitIntoChunks }
