import { mergeUint8Arrays } from '@hayalib/utils'

/**
 * Web Worker 实现的压缩
 */
export class CompressClient {
  private worker: Worker
  private chunks: Uint8Array[] = []
  private progress: number = 0
  private readonly onProgress?: (progress: number) => void
  private resolve!: (result: Uint8Array) => void
  constructor(type: 'compress' | 'decompress', onProgress?: (progress: number) => void) {
    if (type === 'compress') {
      this.worker = new Worker(new URL('./compress-worker.ts', import.meta.url), { type: 'module' })
    }
    else {
      this.worker = new Worker(new URL('./decompress-worker.ts', import.meta.url), { type: 'module' })
    }
    this.onProgress = onProgress

    this.worker.onmessage = (event) => {
      const type = event.data.type
      if (type === 'end') {
        this.chunks = event.data.chunks
        if (this.resolve) this.resolve(mergeUint8Arrays(this.chunks))
      }
      else if (type === 'progress') {
        this.progress += event.data.progress
        if (this.onProgress) this.onProgress(this.progress)
      }
    }
  }

  /**
   * 处理文件
   *
   * @param file 文件
   * @param chunkSize 分片大小
   */
  async handleFile(file: File, chunkSize = 10 * 1024 * 1024): Promise<Uint8Array> {
    this.chunks = []
    return new Promise((resolve) => {
      this.resolve = resolve
      let offset = 0
      const totalSize = file.size

      const readNext = () => {
        if (offset >= totalSize) {
          this.worker.postMessage({ type: 'flush' })
          return
        }

        const blob = file.slice(offset, offset + chunkSize)
        blob.arrayBuffer().then((buffer) => {
          const data = new Uint8Array(buffer)
          this.worker.postMessage({ type: 'push', data })
          offset += chunkSize
          readNext()
        })
      }

      readNext()
    })
  }

  /**
   * 处理数据
   *
   * @param data 数据
   * @param chunkSize 分片大小
   */
  async handleData(data: Uint8Array, chunkSize = 40 * 1024 * 1024): Promise<Uint8Array> {
    this.chunks = []
    return new Promise((resolve) => {
      this.resolve = resolve
      let offset = 0
      const totalSize = data.length

      const readNext = () => {
        if (offset >= totalSize) {
          this.worker.postMessage({ type: 'flush' })
          return
        }

        const slice = data.subarray(offset, offset + chunkSize)
        this.worker.postMessage({ type: 'push', data: slice })
        offset += chunkSize
        readNext()
      }

      readNext()
    })
  }

  terminate() {
    setTimeout(() => this.worker.terminate(), 5000)
  }
}
