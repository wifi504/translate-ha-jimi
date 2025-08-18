import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 视口Store，目前根据屏幕宽度判断是不是移动端
 */
export const useViewportStore = defineStore('viewport', () => {
  const isSmallScreen = ref<boolean>(window.innerWidth < 1200)

  function updateScreenSize() {
    isSmallScreen.value = window.innerWidth < 1200
  }

  return { isSmallScreen, updateScreenSize }
})
