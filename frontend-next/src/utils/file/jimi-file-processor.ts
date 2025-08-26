import type FileDownloader from '@/utils/file/file-downloader.ts'
import type { FileWorkerArgs } from '@/utils/file/file-worker.ts'
import { newFileWorker, newGCWorker } from '@/utils/file/worker-builder.ts'
import ThreadPool from '@/utils/thread-pool'

// 文件处理状态
export type FileProcessInfoStatus = 'WAITING' | 'PROCESSING' | 'SUCCESS' | 'FAIL_FILE_NOT_ALLOWED' | 'FAIL_WRONG_KEY'

// 文件处理详情
export interface FileProcessInfo {
  id: number
  inputFileName: string
  outPutFileName: string
  status: FileProcessInfoStatus
  progress: number
}

// 基于流处理的基密文件处理器
export default class JimiFileProcessor {
  private _fileThreadPool: ThreadPool
  private _gcThreadPool: ThreadPool
  private _filesDownloader: Map<number, FileDownloader> = new Map()
  private _processInfoCallback: (info: FileProcessInfo) => void = () => {}
  constructor() {
    this._gcThreadPool = new ThreadPool(newGCWorker, [], 1)
    this._fileThreadPool = new ThreadPool(newFileWorker, [
      {
        type: 'on-process',
        processor: (info: FileProcessInfo) => this._processInfoCallback(info),
      },
      {
        type: 'write-data-chunk',
        processor: ({ id, data, isFinal }: { id: number, data: Uint8Array, isFinal: boolean }) => {
          this._filesDownloader.get()
        },
      },
      {
        type: 'gc-one',
        processor: (data: Transferable) => this._gcThreadPool.submit([data], [data]).then(),
      },
    ], 1, false)
  }

  /**
   * 提交文件处理
   *
   * @param id 任务ID
   * @param file FIle
   * @param key 加解密的对称密钥
   */
  submit(id: number, file: File, key: Uint8Array) {
    this._processInfoCallback({
      id,
      inputFileName: file.name,
      outPutFileName: '',
      status: 'WAITING',
      progress: 0,
    })
    this._fileThreadPool.submit({ id, file, key } as FileWorkerArgs)
      .then((fileName: string) => {
        this._processInfoCallback({
          id,
          inputFileName: file.name,
          outPutFileName: fileName,
          status: 'SUCCESS',
          progress: 100,
        })
      })
      .catch((e: Error) => {
        this._processInfoCallback({
          id,
          inputFileName: file.name,
          outPutFileName: '',
          status: (e.message as FileProcessInfoStatus),
          progress: 0,
        })
      })
  }

  close() {
    this._fileThreadPool.shutdown()
    this._gcThreadPool.shutdown()
  }

  restart() {
    this._fileThreadPool.restart()
    this._gcThreadPool.restart()
  }

  setTargetPoolSize(size: number) {
    this._fileThreadPool.targetPoolSize = size
  }

  subscribeProcessInfo(callback: (info: FileProcessInfo) => void) {
    this._processInfoCallback = callback
  }

  subscribePoolSize(callback: (size: number) => void) {
    this._fileThreadPool.subscribePoolSize(callback)
  }

  subscribeTaskQueueSize(callback: (size: number) => void) {
    this._fileThreadPool.subscribeTaskQueueSize(callback)
  }
}
