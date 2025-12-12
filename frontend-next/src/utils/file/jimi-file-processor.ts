import type { FileWorkerArgs } from '@/utils/file/file-worker.ts'
import { extractMetaDataInfo } from '@hayalib/utils'
import FileDownloader from '@/utils/file/file-downloader.ts'
import { getFileExtension, getRandomSuffix } from '@/utils/file/file-utils.ts'
import { newFileWorker } from '@/utils/file/worker-builder.ts'
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
  private _filesDownloader: Map<number, FileDownloader> = new Map()
  private _submitFilesInfo: Map<number, FileProcessInfo> = new Map()
  private _processInfoCallback: (info: FileProcessInfo) => void = () => {}
  public suffixType: 'ORIGIN' | 'RANDOM' = 'RANDOM'

  constructor() {
    this._fileThreadPool = new ThreadPool(newFileWorker, [
      {
        type: 'on-process',
        processor: ({ id, progress }: { id: number, progress: number }) => {
          this.callbackFileProcessInfo(id, 'PROCESSING', progress)
        },
      },
      {
        type: 'write-data-chunk',
        processor: ({ id, data, isFinal }: { id: number, data: Uint8Array, isFinal: boolean }) => {
          this._filesDownloader.get(id)!.save(data, isFinal)
        },
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
  async submit(id: number, file: File, key: Uint8Array) {
    // 1. 添加文件
    this._submitFilesInfo.set(id, {
      id,
      inputFileName: file.name,
      outPutFileName: '',
      status: 'WAITING',
      progress: 0,
    })
    this.callbackFileProcessInfo(id)
    // 2. 获取文件名
    let outputName: string
    if (getFileExtension(file.name) === 'hjm') {
      try {
        outputName = (await extractMetaDataInfo(file)).data.fileName!
      }
      catch {
        outputName = '这不是基密文件！'
      }
    }
    else {
      switch (this.suffixType) {
        case 'ORIGIN':
          outputName = `基密文件__${file.name}.hjm`
          break
        case 'RANDOM':
          outputName = `基密文件__${getRandomSuffix()}.hjm`
          break
      }
    }
    // 3. 初始化下载器
    this._filesDownloader.set(id, new FileDownloader(outputName))
    this._submitFilesInfo.get(id)!.outPutFileName = outputName
    // 4. 提交处理任务
    this._fileThreadPool.submit({ id, file, key } as FileWorkerArgs)
      .then(() => this.callbackFileProcessInfo(id, 'SUCCESS', 100))
      .catch((e: Error) => this.callbackFileProcessInfo(id, (e.message as FileProcessInfoStatus), 0))
  }

  // 回调指定文件的事件
  private callbackFileProcessInfo(id: number, status?: FileProcessInfoStatus, progress?: number) {
    if (this._submitFilesInfo.has(id)) {
      const info = this._submitFilesInfo.get(id)!
      if (status) info.status = status
      if (progress) info.progress = progress
      this._processInfoCallback(info)
    }
  }

  close() {
    this._fileThreadPool.shutdown()
  }

  restart() {
    this._fileThreadPool.restart()
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
