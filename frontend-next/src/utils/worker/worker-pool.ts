import type WorkerThread from '@/utils/worker/worker-thread.ts'
import { Queue } from '@/utils/queue.ts'

export interface Work {
  id: number
  workerThread: WorkerThread
  terminateTimeout?: number
}

export default class WorkerPool {
  private _workerKey: number = 0
  private _workerSize: number
  private readonly waitingQueue: Queue<Work> = new Queue()
  private readonly workingPool: Map<number, Work> = new Map()

  constructor(workerSize: number = 2) {
    this._workerSize = workerSize
  }

  private get workerKey(): number {
    return this._workerKey++
  }

  get workerSize(): number {
    return this._workerSize
  }

  set workerSize(size: number) {
    this._workerSize = size
    this.doWork()
  }

  // 执行任务
  private doWork() {
    // 工作池没满吗？看看等待队列有没有任务，给他加满！
    while (this.workingPool.size < this.workerSize && !this.waitingQueue.isEmpty()) {
      const work = this.waitingQueue.dequeue()
      if (work) {
        this.workingPool.set(work.id, work)
      }
    }
    // 工作池有任务，直接执行全部没开始的任务
    if (this.workingPool.size > 0) {
      this.workingPool.forEach((work, id) => {
        if (work.workerThread.status !== 'WAITING') return
        work.workerThread.start()
        work.workerThread.result.finally(() => {
          setTimeout(() => {
            work.workerThread.terminate()
            this.workingPool.delete(id)
            this.doWork()
          }, work.terminateTimeout || 0)
        })
      })
    }
  }

  /**
   * 向线程池提交任务
   *
   * @param workerThread 工作线程
   * @param terminateTimeout 线程退出延迟（毫秒）
   * @return 线程工作结果的Promise
   */
  submit(
    workerThread: WorkerThread,
    terminateTimeout?: number,
  ): Promise<any> {
    this.waitingQueue.enqueue({
      id: this.workerKey,
      workerThread,
      terminateTimeout: terminateTimeout || 0,
    })
    this.doWork()
    return workerThread.result
  }
}
