// 平滑的进度
export default class SmoothProgress {
  private animationFrameId: number | null = null
  private current = 0
  public onProgress: ((percent: number) => void) | undefined

  constructor(onProgress?: (percent: number) => void) {
    this.onProgress = onProgress
  }

  set(target: number, duration: number = 1000) {
    const targetPercent = Math.min(target, 100)
    const start = this.current
    const change = targetPercent - start
    const startTime = performance.now()

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(progress)

      this.current = start + change * eased
      this.onProgress?.(this.current)

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(animate)
      }
      else {
        this.current = targetPercent
        this.onProgress?.(this.current)
        this.animationFrameId = null
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  get value() {
    return this.current
  }
}
