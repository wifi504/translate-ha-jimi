import type { Task } from './thread'
import type { EventProcessor } from './worker'
import BlockingQueue from './blocking-queue'
import Logger from './logger'
import Thread, { newResult } from './thread'

export default class ThreadPool {
  // 线程的 Worker Builder
  private readonly _buildWorker: () => Worker
  // 线程的自定义事件处理器
  private readonly _eventProcessors: EventProcessor[]
  // 线程在遇到异常的时候是否结束
  private readonly _terminateOnError: boolean

  // 线程池
  private readonly _threadPool: Set<Thread> = new Set()
  // 线程池目标工作线程数量
  private _targetPoolSize: number
  // 活动线程数变化回调函数
  private _poolSizeUpdateCallback: ((size: number) => void) | undefined
  // 线程池状态（启用或者关闭）
  private _poolStatus: 'ENABLED' | 'DISABLED' = 'DISABLED'
  // 线程池调度器运行状态
  private _initFlag: boolean = false

  // 任务唯一自增主键
  private _taskPrimaryKey: number = 0
  // 任务阻塞队列
  private readonly _taskBlockingQueue: BlockingQueue<Task> = new BlockingQueue()

  // 日志
  private readonly _logger = new Logger('ThreadPool').setLevel('INFO')

  /**
   * 线程池构造函数
   *
   * @param workerBuilder Worker 的工厂函数
   * @param eventProcessors 线程的自定义事件处理器
   * @param targetPoolSize 可选设置目标工作线程数量，默认为2
   * @param terminateOnError 遇到异常时终止线程吗，默认为 true
   */
  constructor(
    workerBuilder: () => Worker,
    eventProcessors: EventProcessor[],
    targetPoolSize?: number,
    terminateOnError: boolean = true,
  ) {
    this._logger.info('构造了新的线程池，Worker 的工厂是：\n', workerBuilder)
    this._buildWorker = workerBuilder
    this._eventProcessors = eventProcessors
    this._targetPoolSize = targetPoolSize || 2
    this._terminateOnError = terminateOnError
    this.initPool()
  }

  /**
   * 获取目标活动线程数
   */
  get targetPoolSize(): number {
    return this._targetPoolSize
  }

  /**
   * 设置目标活动线程数
   *
   * @param size 目标活动线程数
   */
  set targetPoolSize(size: number) {
    this._targetPoolSize = size
    this._logger.info('线程池的目标活动线程数已被更改为', size)
    if (this._poolStatus === 'ENABLED') {
      this.initPool()
    }
  }

  /**
   * 获取实际工作中的线程数
   */
  get poolSize(): number {
    return this._threadPool.size
  }

  /**
   * 可以订阅实际工作的线程数，发生改变时会回调通知
   *
   * @param callback 回调函数
   */
  subscribePoolSize(callback: (size: number) => void) {
    this._poolSizeUpdateCallback = callback
    callback(this.poolSize)
  }

  /**
   * 获取线程池的状态（启用或者关闭）
   */
  get poolStatus(): 'ENABLED' | 'DISABLED' {
    return this._poolStatus
  }

  /**
   * 线程池加入线程
   * @return Set 可以继续链式调用
   */
  private threadPoolAdd(thread: Thread) {
    const result = this._threadPool.add(thread)
    this._poolSizeUpdateCallback?.(this.poolSize)
    this._logger.info('池中增加了线程：', thread)
    this.initPool()
    return result
  }

  /**
   * 线程池删除线程
   *
   * @param thread Thread
   * @return 是否成功删除
   */
  private threadPoolDelete(thread: Thread) {
    const result = this._threadPool.delete(thread)
    this._poolSizeUpdateCallback?.(this.poolSize)
    this._logger.info('池中删除了线程：', thread)
    this.initPool()
    return result
  }

  /**
   * 线程池清空线程
   */
  private threadPoolClear() {
    this._threadPool.clear()
    this._poolSizeUpdateCallback?.(this.poolSize)
    this._logger.info('池已被清空')
  }

  /**
   * 获取阻塞队列等待的任务数
   */
  get taskQueueSize(): number {
    return this._taskBlockingQueue.size()
  }

  /**
   * 可以订阅阻塞队列的任务数，发生改变时会回调通知
   *
   * @param callback 回调函数
   */
  subscribeTaskQueueSize(callback: (size: number) => void) {
    this._taskBlockingQueue.subscribeSize(callback)
  }

  /**
   * 返回任务的唯一自增主键
   */
  private get taskPrimaryKey(): number {
    return this._taskPrimaryKey++
  }

  // 初始化/调度线程池
  private initPool() {
    // 如果已经在初始化/调度线程池，忽略本次
    if (this._initFlag) return
    this._initFlag = true
    this._poolStatus = 'ENABLED'
    this._logger.info('开始初始化/调度线程池...')
    // 1. 删除已销毁的线程
    this._threadPool.forEach((thread) => {
      if (thread.status === 'TERMINATED') {
        this.threadPoolDelete(thread)
      }
    })
    // 2. 补齐到目标数量的线程
    while (this._threadPool.size < this._targetPoolSize) {
      const thread = new Thread(
        this._buildWorker(),
        () => this._taskBlockingQueue.take(),
        this._eventProcessors,
        this._terminateOnError,
      )
      this.threadPoolAdd(thread)
      // 启动线程（线程去阻塞队列找任务）
      thread.start()
        .catch(e => this._logger.error('线程池在启动线程阶段捕获到了意料之外的线程异常！\n', e))
        .finally(() => {
          thread.terminate()
          this.initPool()
        })
    }
    // 3. 通知超出目标数量的线程销毁自己
    const overflow = this._threadPool.size - this._targetPoolSize
    if (overflow > 0) {
      let count: number = 0
      for (const thread of this._threadPool) {
        if (count >= overflow) break
        this._logger.warn('线程池将请求如下线程正常销毁：\n', thread)
        thread.requestTerminate().catch((e) => {
          this._logger.error('线程池在关闭线程阶段捕获到了意料之外的线程异常！\n', e)
        })
        count++
      }
    }
    this._initFlag = false
  }

  /**
   * 向线程池提交任务
   *
   * @param data 会交给 Worker 的 main 函数的数据
   * @param transfer 可选参数，data的可转移对象列表
   * @return Promise<any> Worker 的 main 函数的执行结果（包括正常退出和异常捕获）
   */
  submit(data?: any, transfer?: Transferable[]) {
    // 1. 构造一个任务对象
    const task: Task = {
      id: this.taskPrimaryKey,
      data: data || undefined,
      transfer: transfer || [],
      result: newResult(),
    }
    // 2. 把任务放到阻塞队列
    this._taskBlockingQueue.put(task)
    // 3. 返回这个任务对象的结果
    return task.result.promise
  }

  /**
   * 重新启动线程池，如果已关闭则开启，如果已开启则重启
   */
  restart() {
    if (this._poolStatus === 'ENABLED') {
      this._logger.info('重启线程池')
      this.shutdown()
      this.initPool()
    }
    else {
      this._logger.info('启动线程池')
      this.initPool()
    }
  }

  /**
   * 关闭这个线程池（会清空所有任务、关闭线程）
   */
  shutdown() {
    if (this._poolStatus === 'ENABLED') {
      this._logger.info('线程池将关闭！')
      this._taskBlockingQueue.clear()
      this._threadPool.forEach(thread => thread.terminate())
      this.threadPoolClear()
      this._poolStatus = 'DISABLED'
      this._logger.info('线程池已关闭！')
    }
    else {
      this._logger.info('线程池已经关闭，不需要再次关闭！')
    }
  }
}
