import type { EventProcessor } from '@/utils/worker/event-util.ts'
import { receiveWorkerEvent } from '@/utils/worker/event-util.ts'

// 线程返回结果
export interface Result {
  promise: Promise<any>
  resolve: ((value: any) => void)
  reject: ((value: any) => void)
}

/**
 * 工作线程
 */
export default class WorkerThread {
  // 工作线程的 Worker
  private readonly _worker: Worker
  private readonly data: any
  private readonly transfer: Transferable[]
  // 线程返回结果
  private readonly promise: Promise<any>
  private resolve: ((value: any) => void)
  private reject: ((value: any) => void)
  // 线程状态
  private _status: 'WAITING' | 'RUNNING' | 'FINISHED' = 'WAITING'

  /**
   * 构造工作线程
   *
   * @param worker Worker
   * @param eventProcessors 事件处理器
   * @param data 线程工作数据
   * @param transfer 可转移数据
   */
  constructor(
    worker: Worker,
    eventProcessors: EventProcessor[],
    data: any,
    transfer?: Transferable[],
  ) {
    this.resolve = () => {}
    this.reject = () => {}
    this.promise = new Promise<any>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
    this.data = data
    this.transfer = transfer || []
    this._worker = worker
    this._worker.onmessage = receiveWorkerEvent(eventProcessors, {
      promise: this.promise,
      resolve: this.resolve,
      reject: this.reject,
    })
  }

  get status(): 'WAITING' | 'RUNNING' | 'FINISHED' {
    return this._status
  }

  get result(): Promise<any> {
    return this.promise
  }

  /**
   * 启动工作线程
   */
  start() {
    if (this._status === 'RUNNING') {
      throw new Error('不能启动正在运行的工作线程！')
    }
    if (this._status === 'FINISHED') {
      throw new Error('不能启动已退出的工作线程！')
    }
    this._status = 'RUNNING'
    this._worker.postMessage({
      type: 'startWorker',
      startFlag: true,
      data: this.data,
    }, this.transfer)
  }

  /**
   * 结束工作线程
   */
  terminate() {
    this._status = 'FINISHED'
    this._worker.terminate()
  }
}
