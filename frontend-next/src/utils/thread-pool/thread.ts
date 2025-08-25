import type { EventProcessor } from './worker'
import Logger from './logger'
import { receiveEvent } from './worker'

// 线程状态
export type Status = 'NEW' | 'BLOCKED' | 'RUNNING' | 'TERMINATED'
// 线程工作的任务，会放在阻塞队列里
export interface Task {
  id: number
  data: any
  transfer: Transferable[]
  result: Result
}
// 线程返回结果
export interface Result {
  promise: Promise<any>
  resolve: ((value: any) => void)
  reject: ((value: any) => void)
}
// 获取新的 Result
export function newResult(): Result {
  let resolve: (value: any) => void = () => {}
  let reject: (value: any) => void = () => {}
  const promise = new Promise<any>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

export default class Thread {
  private readonly _worker: Worker
  private readonly _takeTask: () => Promise<Task>
  private _runFlag: boolean = true
  private _requestTerminatePromise: Promise<void> | undefined
  private _requestTerminateResolve: (() => void) | undefined
  private _status: Status = 'NEW'
  private readonly _terminateOnError: boolean
  private _logger: Logger = new Logger('Thread').setLevel('INFO')

  /**
   * 线程构造函数
   *
   * @param worker 线程管理的 Web Worker
   * @param takeTask 线程获取新任务的函数
   * @param eventProcessors 线程事件处理器
   * @param terminateOnError 遇到异常时终止线程吗，默认为 true
   */
  constructor(
    worker: Worker,
    takeTask: () => Promise<Task>,
    eventProcessors?: EventProcessor[],
    terminateOnError: boolean = true,
  ) {
    this._takeTask = takeTask
    this._worker = worker
    if (eventProcessors) {
      this._worker.onmessage = receiveEvent(eventProcessors)
    }
    this._terminateOnError = terminateOnError
    this._logger.info('创建了新的线程')
  }

  // 获取当前线程运行状态
  get status(): Status {
    return this._status
  }

  /**
   * 调用时传一个data，transfer，然后就会向Worker发送事件，
   * 调用main并传参，接下来会吸收这个main的结果或者异常，
   * 并且包装到promise里作为run()的返回值
   *
   * @param data 传递的数据
   * @param transfer 可转移对象
   * @return Promise<any> 任务的执行结果
   */
  private run(data: any, transfer: Transferable[]) {
    // 1. 确认目标 Worker 是一个可以被 Thread 接管的 Worker
    let runnable: boolean = false
    const defineWorkerHandler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'has-defined' && e.data.defineFlag) {
        runnable = true
        this._worker.removeEventListener('message', defineWorkerHandler)
      }
    }
    this._worker.addEventListener('message', defineWorkerHandler)
    this._worker.postMessage({
      type: 'require-define',
      defineFlag: true,
    })
    setTimeout(() => {
      if (!runnable) {
        const msg = '目标 Worker 不是一个可被 Thread 管理的 Worker！\n'
          + '请使用 defineWorker() 函数指定 Worker 的入口函数'
        this._logger.error(msg)
        throw new Error(msg)
      }
    }, 1000)
    // 2. 注册 requestTerminate 回调函数，Worker 可以申请在这次任务完成后关闭它
    const requestTerminateHandler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'request-terminate' && e.data.terminateFlag) {
        this._worker.removeEventListener('message', requestTerminateHandler)
        // 如果已经存在 requestTerminate，忽略本次
        if (this._requestTerminatePromise) return
        this._logger.warn(`Worker 申请在本次任务执行完后关闭此线程${e.data.message ? `，原因是：${e.data.message}` : '！'}`)
        this.requestTerminate().then(() => {
          this._logger.info('Worker 申请的关闭线程已成功执行！')
        })
      }
    }
    this._worker.addEventListener('message', requestTerminateHandler)
    return new Promise<any>((resolve, reject) => {
      // 3. 定义处理任务结果的回调函数
      const resultHandler = (e: MessageEvent) => {
        const isEndTypeMsg
          = e.data && e.data.endFlag
            && (e.data.type === 'worker-return' || e.data.type === 'worker-catch')
        if (isEndTypeMsg) {
          if (e.data.type === 'worker-return') {
            // 完成任务
            resolve(e.data.data)
          }
          else {
            // 异常
            reject(e.data.data)
          }
          this._worker.removeEventListener('message', resultHandler)
        }
      }
      // 4. 注册获取结果的监听器
      this._worker.addEventListener('message', resultHandler)
      // 5. 发送任务
      this._worker.postMessage({
        type: 'run-main',
        startFlag: true,
        data,
      }, transfer)
    })
  }

  /**
   * 一旦启动了，开始while(this._runFlag)循环，
   * 不停的取任务然后run任务，获得run的返回值，
   * 如果是正常退出，那就把Task给resolve
   * 如果是异常退出，那就把Task给reject，并且this._runFlag=false，结束这个线程
   */
  async start() {
    if (this.status !== 'NEW') {
      this._logger.error('线程已经启动或销毁，不可以启动！')
      return
    }
    this._logger.info('线程开始运行...')
    while (this._runFlag) {
      // 1. 阻塞队列取任务
      this._status = 'BLOCKED'
      const task = await this._takeTask()
      // 2. 运行这个任务
      try {
        this._status = 'RUNNING'
        this._logger.info('开始执行！获取到任务 Task:', task)
        const res = await this.run(task.data, task.transfer)
        // 正常退出
        this._logger.info('执行结束！Task:', task)
        task.result.resolve(res)
        // 继续任务循环...
      }
      catch (e) {
        // 异常退出
        task.result.promise.catch(() => {})
        task.result.reject(e)
        // 结束此线程
        if (this._terminateOnError) {
          this._logger.warn('（此线程将销毁）执行异常！Task:', task)
          this._runFlag = false
        }
      }
    }
    this._logger.info('线程已结束运行')
    this.terminate()
    this._requestTerminateResolve?.()
  }

  /**
   * 立刻结束并销毁线程
   */
  terminate() {
    if (this._status !== 'TERMINATED') {
      this._status = 'TERMINATED'
      this._worker.terminate()
      this._logger.info('线程已销毁')
    }
    else {
      this._logger.info('已销毁的线程，不需要再次销毁')
    }
  }

  /**
   * 请求在当前任务完成后销毁线程
   *
   * @return Promise<void> 销毁是否完成
   */
  requestTerminate() {
    if (this._requestTerminatePromise) {
      this._logger.warn('外部重复请求关闭此线程')
      return this._requestTerminatePromise
    }
    else {
      const promise = new Promise<void>((resolve) => {
        this._logger.info('外部请求关闭此线程')
        this._runFlag = false
        this._requestTerminateResolve = resolve
      })
      this._requestTerminatePromise = promise
      return promise
    }
  }
}
