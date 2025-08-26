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
 * 合并器状态
 */
type MergerState = 'NEW' | 'FILLING' | 'READY' | 'EDITING'

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
  onChunk: (chunk: Chunk) => Promise<void>,
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
      await onChunk({
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
  private promise!: Promise<void>
  private resolve!: () => void
  private reject!: (reason: Error) => void
  onProgress: (progress: number) => void
  private totalChunks: number | null = null
  private receivedChunks: Map<number, Uint8Array> = new Map()
  private state: MergerState = 'NEW'

  constructor(onProgress: (progress: number) => void) {
    this.onProgress = onProgress
    this.onProgress(0)

    this.refreshPromise()
  }

  /**
   * 刷新 promise，生成新的等待对象
   */
  private refreshPromise() {
    this.promise = new Promise<void>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  /**
   * 处理一个分片
   */
  push(chunk: Chunk): void {
    if (this.state === 'NEW') {
      this.state = 'FILLING'
    }
    if (this.state !== 'FILLING') {
      throw new Error(`当前状态为 ${this.state}，不能 push 分片`)
    }

    // 第一次push时初始化
    if (this.totalChunks === null) {
      this.totalChunks = chunk.totalChunks
    }
    else if (chunk.totalChunks !== this.totalChunks) {
      const error = new Error(`总分片数量不一致，预期: ${this.totalChunks}, 实际: ${chunk.totalChunks}`)
      this.reject(error)
      throw error
    }

    if (chunk.id < 0 || chunk.id >= this.totalChunks!) {
      const error = new Error(`无效的分片ID: ${chunk.id}，总分片数量: ${this.totalChunks}`)
      this.reject(error)
      throw error
    }

    if (this.receivedChunks.has(chunk.id)) {
      const error = new Error(`重复的分片ID: ${chunk.id}`)
      this.reject(error)
      throw error
    }

    this.receivedChunks.set(chunk.id, chunk.data)

    const progress = (this.receivedChunks.size / this.totalChunks!) * 100
    this.onProgress(progress)

    if (this.receivedChunks.size === this.totalChunks) {
      this.state = 'READY'
      this.resolve()
    }
  }

  /**
   * 获取当前最新 promise
   */
  waitForReady(): Promise<void> {
    return this.promise
  }

  /**
   * 合并结果
   */
  getResult(): Uint8Array {
    if (this.state !== 'READY') {
      throw new Error(`当前状态为 ${this.state}，不能执行 getResult`)
    }
    let totalLength = 0
    this.receivedChunks.forEach((chunk) => {
      totalLength += chunk.length
    })
    const merged = new Uint8Array(totalLength)
    let offset = 0
    for (let i = 0; i < this.totalChunks!; i++) {
      const get = this.receivedChunks.get(i)
      if (!get) {
        throw new Error('ChunkMerger分片数据不完整，拼接失败！')
      }
      merged.set(get, offset)
      offset += get.length
    }
    this.receivedChunks.clear()
    return merged
  }

  /**
   * 编辑模式
   */
  async foreachEdit(callback: (chunk: Chunk, edit: (chunk: Chunk) => void) => Promise<void> | void): Promise<void> {
    if (this.state !== 'READY') {
      throw new Error(`当前状态为 ${this.state}，不能进入 foreachEdit`)
    }
    this.state = 'EDITING'
    this.refreshPromise()

    const edit = (chunk: Chunk) => {
      if (this.state !== 'EDITING') {
        throw new Error('不在 EDITING 状态，不能 edit')
      }
      if (chunk.id < 0 || chunk.id >= this.totalChunks!) {
        throw new Error(`无效的分片ID: ${chunk.id}`)
      }
      this.receivedChunks.set(chunk.id, chunk.data)

      if (chunk.id === this.totalChunks! - 1) {
        this.state = 'READY'
        this.resolve()
      }
      this.onProgress((chunk.id / this.totalChunks!) * 100)
    }

    for (let i = 0; i < this.totalChunks!; i++) {
      const data = this.receivedChunks.get(i)!
      const chunk: Chunk = {
        id: i,
        data,
        totalSize: data.length,
        totalChunks: this.totalChunks!,
        start: 0,
        end: data.length,
      }
      await callback(chunk, edit)
    }

    return this.promise
  }
}

export type { Chunk }
export { ChunkMerger, splitIntoChunks }
