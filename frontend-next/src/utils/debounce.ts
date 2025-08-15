/**
 * 防抖函数
 * @param fn 需要防抖执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的新函数
 */
export default function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}
