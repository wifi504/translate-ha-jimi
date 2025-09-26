import { defineStore } from 'pinia'
import { ref } from 'vue'

// 最少等待时间(ms)
const minWaitingTime = 1000
// 多少时间的加载忽略(ms)
const ignoreWaitingTime = 20

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)

  let showTime = 0
  let loadingTimer: ReturnType<typeof setTimeout> | null = null
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function show() {
    clearTimers()
    showTime = Date.now()

    // 等待 ignoreWaitingTime 后才决定是否真正显示 loading
    loadingTimer = setTimeout(() => {
      isLoading.value = true
      loadingTimer = null
    }, ignoreWaitingTime)
  }

  function hide() {
    const elapsed = Date.now() - showTime

    // 如果在 ignoreWaitingTime 内就 hide 了 → 直接取消，不显示 loading
    if (elapsed < ignoreWaitingTime) {
      clearTimers()
      isLoading.value = false
      return
    }

    // 如果已经显示 loading，就遵循最小展示时长
    const visibleElapsed = elapsed - ignoreWaitingTime
    const delay = Math.max(0, minWaitingTime - visibleElapsed)

    if (delay === 0) {
      isLoading.value = false
    }
    else {
      hideTimer = setTimeout(() => {
        isLoading.value = false
        hideTimer = null
      }, delay)
    }
  }

  function clearTimers() {
    if (loadingTimer) {
      clearTimeout(loadingTimer)
      loadingTimer = null
    }
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  return {
    isLoading,
    show,
    hide,
  }
})
