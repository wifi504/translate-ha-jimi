// 线程返回结果
export interface Result {
  promise: Promise<unknown> | undefined
  resolve: ((value: unknown) => void) | undefined
}

/**
 * 工作线程
 */
export class WorkerThread {
  // 工作线程的 Worker
  private readonly _worker: Worker
  // 线程返回结果
  private readonly _result: Result

  constructor(worker: Worker, eventProcessors: EventProcessor[]) {
    this._result = { promise: undefined, resolve: undefined }
    this._worker = worker
    this._worker.onmessage = receiveWorkerEvent(eventProcessors, this._result)
  }

  get worker(): Worker {
    return this._worker
  }

  get result(): Result {
    return this._result
  }

  set result(result: {
    promise: Promise<any>
    resolve: ((value: unknown) => void)
  }) {
    this._result.promise = result.promise
    this._result.resolve = result.resolve
  }
}

/**
 * 事件处理器
 *
 *  - type 事件名称
 *  - processor 处理钩子（发送的事件如果携带数据，会传一个data）
 */
export interface EventProcessor {
  type: string
  processor: (data: any) => void
}

// 接收工作线程的事件（主线程配置）
export function receiveWorkerEvent(
  eventProcessors: EventProcessor[],
  result: Result,
):
(event: MessageEvent) => void {
  return (event: MessageEvent) => {
    for (const processor of eventProcessors) {
      // 处理结束事件
      if (event.data.type === 'returnToMain' && event.data.endFlag) {
        if (result.resolve) {
          result.resolve(event.data.data)
        }
        else {
          throw new Error('未启动的线程，不可以提前返回和退出！')
        }
        return
      }
      // 处理自定义事件
      if (processor.type === event.data.type) {
        processor.processor(event.data.data)
        return
      }
    }
    console.warn('接收到未声明处理的事件：', event)
  }
}

// 接收主线程的事件（工作线程配置）
export function receiveMainEvent(
  eventProcessors: EventProcessor[],
  main?: (data: any) => void,
):
(event: MessageEvent) => void {
  return (event: MessageEvent) => {
    for (const processor of eventProcessors) {
      // 处理启动事件
      if (event.data.type === 'startWorker' && event.data.startFlag) {
        if (main) {
          main(event.data.data)
        }
        else {
          throw new Error('无法启动线程，入口函数未定义！')
        }
        return
      }
      // 处理自定义事件
      if (processor.type === event.data.type) {
        processor.processor(event.data.data)
        return
      }
    }
    console.warn('接收到未声明处理的事件：', event)
  }
}

/**
 * 向主线程发送事件
 *
 * @param type 事件名称
 * @param data 数据
 * @param transfer 可转移数据
 */
export function postToMain(type: string, data: any, transfer?: Transferable[]): void {
  postMessage({
    type,
    data,
  }, transfer || [])
}

/**
 * 向主线程返回运行结果（发送结束事件）
 *
 * @param data 数据
 * @param transfer 可转移数据
 */
export function returnToMain(data: any, transfer?: Transferable[]): void {
  postMessage({
    type: 'returnToMain',
    endFlag: true,
    data,
  }, transfer || [])
}

/**
 * 向工作线程发送事件
 *
 * @param to 工作线程
 * @param type 事件名称
 * @param data 数据
 * @param transfer 可转移数据
 */
export function postToWorker(to: Worker, type: string, data: any, transfer?: Transferable[]): void {
  to.postMessage({
    type,
    data,
  }, transfer || [])
}

// TODO promise的处理问题
/**
 * 启动工作线程
 *
 * @param workerThread 工作线程
 * @param data 数据
 * @param transfer 可转移数据
 */
export function startWorkerThread(workerThread: WorkerThread, data: any, transfer?: Transferable[]): void {
  if (workerThread.result) {
    throw new Error('不能启动正在运行的工作线程！')
  }
  let tempResolve = (value: unknown) => {}
  const promise = new Promise((resolve) => {
    // ...
    resolve(111)
  })
  workerThread.result = {
    promise,
    resolve: tempResolve,
  }
  workerThread.worker.postMessage({
    type: 'startWorker',
    startFlag: true,
    data,
  }, transfer || [])
}
