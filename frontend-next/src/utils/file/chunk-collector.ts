type ChunkCallback = (chunk: Uint8Array, isLast: boolean) => void

// 分片缓冲区
export default class ChunkCollector {
  private buffer: Uint8Array[] = []
  private bufferSize = 0
  private readonly chunkSize: number
  private readonly callback: ChunkCallback

  constructor(chunkSize: number, callback: ChunkCallback) {
    this.chunkSize = chunkSize
    this.callback = callback
  }

  /**
   * 输入数据
   *
   * @param data 新来的 Uint8Array
   * @param isFinal 是否最后一次
   */
  push(data: Uint8Array, isFinal = false) {
    this.buffer.push(data)
    this.bufferSize += data.length

    // 当累计数据超过 chunkSize，就切分
    while (this.bufferSize >= this.chunkSize) {
      const chunk = this.readChunk(this.chunkSize)
      this.callback(chunk, false)
    }

    // 如果是最后一次，输出剩余数据
    if (isFinal && this.bufferSize > 0) {
      const chunk = this.readChunk(this.bufferSize)
      this.callback(chunk, true)
    }
    else if (isFinal && this.bufferSize === 0 && this.buffer.length === 0) {
      // 如果刚好整除，没有剩余，也标记最后一个
      // 可以选择调用回调或者不调用，看你需求
    }
  }

  private readChunk(size: number): Uint8Array {
    let remain = size
    const parts: Uint8Array[] = []

    while (remain > 0 && this.buffer.length > 0) {
      const first = this.buffer[0]
      if (first.length <= remain) {
        parts.push(first)
        this.buffer.shift()
        remain -= first.length
      }
      else {
        parts.push(first.subarray(0, remain))
        this.buffer[0] = first.subarray(remain)
        remain = 0
      }
    }

    this.bufferSize -= size
    return this.concat(parts)
  }

  private concat(chunks: Uint8Array[]): Uint8Array {
    const total = chunks.reduce((acc, c) => acc + c.length, 0)
    const result = new Uint8Array(total)
    let offset = 0
    for (const c of chunks) {
      result.set(c, offset)
      offset += c.length
    }
    return result
  }
}
