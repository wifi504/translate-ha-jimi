<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <header-bar />
      <router-view />
      <foot-note />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue'
import themeOverrides from '@/assets/style/naive-ui-theme-overrides.json'

// 全局注入CSS变量
onBeforeMount(() => {
  const root = document.documentElement
  const colors = themeOverrides.common as any
  root.style.setProperty('--primary-color', colors.primaryColor)
  root.style.setProperty('--primary-color-light', colors.primaryColorHover)
  root.style.setProperty('--primary-color-dark', colors.primaryColorPressed)
  root.style.setProperty('--background-color', '#EFEFEF')
  root.style.setProperty('--background-color-light', '#FFFFFF')
  root.style.setProperty('--background-color-dark', '#CFCFCF')
  root.style.setProperty('--font-size-normal', '14px')
  root.style.setProperty('--font-size-small', '12px')
  root.style.setProperty('--font-size-large', '18px')
})
</script>
