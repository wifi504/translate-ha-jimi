import { startWorker, WorkerThread } from '@/utils/worker/thread-util.ts'
import FileWorker from './file-worker?worker'

export class FileWorkerManager {
  private readonly worker: WorkerThread

  constructor() {
    this.worker = new WorkerThread(new FileWorker(), [])
  }

  hello(msg: string) {
    startWorker(this.worker.worker, msg)
  }
}
