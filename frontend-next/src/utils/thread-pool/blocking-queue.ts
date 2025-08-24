export default class BlockingQueue<T> {
  private items: T[]
  private waitingResolvers: ((value: T) => void)[]
  private updateSizeCallback: ((size: number) => void) | undefined

  constructor() {
    this.items = []
    this.waitingResolvers = []
  }

  /**
   * 放入元素
   * @param element 要放入的元素
   */
  put(element: T): void {
    if (this.waitingResolvers.length > 0) {
      // 有消费者在等待，直接交付
      const resolver = this.waitingResolvers.shift()!
      resolver(element)
    }
    else {
      // 否则入队
      this.items.push(element)
      this.updateSizeCallback?.(this.size())
    }
  }

  /**
   * 取出元素，如果队列为空会阻塞等待
   * @returns Promise（resolve 为取出的元素）
   */
  async take(): Promise<T> {
    if (this.items.length > 0) {
      const item = this.items.shift()!
      this.updateSizeCallback?.(this.size())
      return item
    }
    return new Promise<T>((resolve) => {
      this.waitingResolvers.push(resolve)
    })
  }

  /**
   * 当前队列长度
   */
  size(): number {
    return this.items.length
  }

  /**
   * 订阅当前队列的长度
   *
   * @param callback 长度变化时会通知
   */
  subscribeSize(callback: (size: number) => void): void {
    this.updateSizeCallback = callback
    callback(this.size())
  }

  /**
   * 队列是否为空
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = []
    this.waitingResolvers = []
    this.updateSizeCallback?.(this.size())
  }
}
