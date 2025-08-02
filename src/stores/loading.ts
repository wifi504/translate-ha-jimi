import { defineStore } from 'pinia'
import { ref } from 'vue'

// 最少等待时间(ms)
const minWaitingTime = 1000

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  let showTime = 0
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function show() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    showTime = Date.now()
    isLoading.value = true
  }

  function hide() {
    const elapsed = Date.now() - showTime
    const delay = Math.max(0, minWaitingTime - elapsed)
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

  return {
    isLoading,
    show,
    hide,
  }
})
