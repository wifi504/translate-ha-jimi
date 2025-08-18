<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <header-bar />
      <navigation-bar />
      <router-view />
      <foot-note />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onBeforeMount, onMounted, onUnmounted } from 'vue'
import themeOverrides from '@/assets/style/naive-ui-theme-overrides.json'
import { useViewportStore } from '@/stores/viewportStore.ts'
import { injectAllTheme } from '@/utils/global-theme.ts'

const viewportStore = useViewportStore()

// 全局注入CSS变量
onBeforeMount(() => {
  injectAllTheme()
})

onMounted(() => {
  window.addEventListener('resize', viewportStore.updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', viewportStore.updateScreenSize)
})
</script>
