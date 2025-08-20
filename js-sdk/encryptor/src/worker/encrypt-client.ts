import { mergeUint8Arrays } from '@hayalib/utils'

/**
 * Web Worker 实现的流加密
 */
export class EncryptClient {
  private worker: Worker
  private chunks: Uint8Array[] = []
  private resolve!: (result: Uint8Array) => void
  private progress: number = 0
  private readonly onProgress?: (progress: number) => void

  constructor(type: 'encrypt' | 'decrypt', onProgress?: (progress: number) => void) {
    if (type === 'encrypt') {
      this.worker = new Worker(new URL('./encrypt-worker.ts', import.meta.url), { type: 'module' })
    }
    else {
      this.worker = new Worker(new URL('./decrypt-worker.ts', import.meta.url), { type: 'module' })
    }
    this.onProgress = onProgress

    this.worker.onmessage = (event: MessageEvent) => {
      const { type } = event.data

      if (type === 'end') {
        this.chunks = event.data.chunks as Uint8Array[]
        if (this.resolve) this.resolve(mergeUint8Arrays(this.chunks))
        return
      }

      if (type === 'progress') {
        this.progress += event.data.progress as number
        if (this.onProgress) this.onProgress(this.progress)
        return
      }

      if (type === 'error') {
        console.error('[EncryptClient]', event.data.message)
        if (this.resolve) this.resolve(new Uint8Array(0))
      }
    }
  }

  async initEncrypt(key: Uint8Array) {
    this.worker.postMessage({ type: 'init', key })
    return new Promise<Uint8Array>((resolve) => {
      const listener = (event: MessageEvent) => {
        if (event.data.type === 'header') {
          this.worker.removeEventListener('message', listener)
          resolve(event.data.header as Uint8Array)
        }
      }
      this.worker.addEventListener('message', listener)
    })
  }

  initDecrypt(key: Uint8Array, header: Uint8Array) {
    this.worker.postMessage({ type: 'init', key, header })
  }

  async handleData(data: Uint8Array, chunkSize = 50 * 1024 * 1024): Promise<Uint8Array> {
    this.chunks = []
    this.progress = 0

    return new Promise<Uint8Array>((resolve) => {
      this.resolve = resolve
      let offset = 0
      const totalSize = data.length

      const readNext = () => {
        if (offset >= totalSize) {
          this.worker.postMessage({ type: 'flush' })
          return
        }

        const slice = data.subarray(offset, offset + chunkSize)
        this.worker.postMessage({ type: 'push', chunk: slice }, [slice.buffer])
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
