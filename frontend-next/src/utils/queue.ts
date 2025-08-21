export class Queue<T> {
  private items: T[]

  constructor() {
    this.items = []
  }

  /**
   * 向队列尾部添加一个元素
   * @param element 要添加的元素
   */
  enqueue(element: T): void {
    this.items.push(element)
  }

  /**
   * 移除并返回队列头部的元素
   * @returns 队列头部的元素，如果队列为空则返回 undefined
   */
  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    return this.items.shift()
  }

  /**
   * 返回队列头部的元素（不移除）
   * @returns 队列头部的元素，如果队列为空则返回 undefined
   */
  peek(): T | undefined {
    if (this.isEmpty()) {
      return undefined
    }
    return this.items[0]
  }

  /**
   * 检查队列是否为空
   * @returns 如果队列为空则返回 true，否则返回 false
   */
  isEmpty(): boolean {
    return this.items.length === 0
  }

  /**
   * 返回队列中元素的数量
   * @returns 队列的长度
   */
  size(): number {
    return this.items.length
  }

  /**
   * 清空队列中的所有元素
   */
  clear(): void {
    this.items = []
  }

  /**
   * 将队列转换成字符串
   * @returns 队列元素的字符串表示
   */
  toString(): string {
    if (this.isEmpty()) {
      return ''
    }
    return this.items.join(', ')
  }

  /**
   * 转换为数组
   * @returns 包含队列所有元素的数组
   */
  toArray(): T[] {
    return [...this.items]
  }
}
