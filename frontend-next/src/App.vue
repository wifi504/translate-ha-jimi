<template>
  <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <header-bar />
      <n-scrollbar style="max-height: calc(100vh - 90px);">
        <content />
        <foot-note />
      </n-scrollbar>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui'
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
