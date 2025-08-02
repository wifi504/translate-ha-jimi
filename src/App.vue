<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <router-view />
  </n-config-provider>
  <full-screen-loading />
</template>

<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import themeOverrides from '@/assets/style/naive-ui-theme-overrides.json'
import FullScreenLoading from '@/components/common/FullScreenLoading.vue'
</script>
