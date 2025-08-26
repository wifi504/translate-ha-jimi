import Logger from './logger'

// Worker的配置工具，配置了defineWorker()才可以让Thread管理

// 日志输出
const logger = new Logger('Worker')
logger.setLevel('INFO')

/**
 * 为当前 Worker 注册一系列属性，这样Thread才能管理
 *
 * @param main Worker运行的main函数，可以是异步函数，返回Worker的执行结果
 */
export function defineWorker(main: (data: any) => (any | Promise<any>)) {
  // 注册监听器
  globalThis.addEventListener('message', async (event: MessageEvent) => {
    // 确认此 Worker 已经执行过 defineWorker()
    if (event.data && event.data.type === 'require-define' && event.data.defineFlag) {
      postMessage({
        type: 'has-defined',
        defineFlag: true,
      })
    }
    // 获取任务，任务做完了就把结果发送过去，如果结果是个可转移对象，则直接转移
    if (event.data && event.data.type === 'run-main' && event.data.startFlag) {
      try {
        logger.info('开始执行任务...\nfunction ', main, '\n传递参数：', event.data.data)
        const res = await main(event.data.data)
        logger.info('任务执行结束！获取到返回值：', res, '\n任务是 function', main, '\n传递参数：', event.data.data)
        postMessage({
          type: 'worker-return',
          endFlag: true,
          data: res,
        }, isTransferable(res) ? [res] : [])
      }
      catch (e) {
        logger.warn('任务执行结束！捕获到异常\n', e, '\n任务是\nfunction', main, '\n传递参数：', event.data.data)
        postMessage({
          type: 'worker-catch',
          endFlag: true,
          data: e,
        })
      }
    }
  })
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

/**
 * 向主线程发送事件
 *
 * @param type 事件名称
 * @param data 数据
 * @param transfer 可转移数据
 */
export function postToMain(
  type: string,
  data: any,
  transfer?: Transferable[],
): void {
  logger.info(globalThis, `向主线程发送了事件${type}：`, data)
  postMessage({
    type,
    data,
  }, transfer || [])
}

/**
 * 申请在本次任务执行完毕后关闭当前线程
 *
 * @param message 可选，关闭线程的原因
 */
export function requestTerminate(message: string) {
  postMessage({
    type: 'request-terminate',
    terminateFlag: true,
    message,
  })
}

/**
 * 主线程接收自定义事件
 *
 * @param eventProcessors 事件处理器
 */
export function receiveEvent(
  eventProcessors: EventProcessor[],
): (event: MessageEvent) => void {
  return function (event: MessageEvent) {
  // 处理自定义事件
    for (const processor of eventProcessors) {
      if (processor.type === event.data.type) {
        logger.info('处理自定义事件：', event)
        processor.processor(event.data.data)
        return
      }
    }
    if (!event.data.endFlag && !event.data.defineFlag && !event.data.terminateFlag) {
      logger.warn('接收到未声明处理的事件：', event)
    }
  }
}

// 判断对象是不是 Transferable
function isTransferable(obj: any) {
  if (obj === null || typeof obj !== 'object') {
    return false
  }
  return Object.prototype.toString.call(obj) === '[object Transferable]'
}
