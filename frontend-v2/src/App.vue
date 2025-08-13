<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
  <full-screen-loading />
</template>

<script setup lang="ts">
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import themeOverrides from '@/assets/style/naive-ui-theme-overrides.json'
import FullScreenLoading from '@/components/common/FullScreenLoading.vue'
</script>
