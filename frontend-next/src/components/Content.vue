<template>
  <div
    class="content" :style="{
      padding: viewportStore.isSmallScreen ? '0' : '20px',
      gap: viewportStore.isSmallScreen ? '0' : '20px',
    }"
  >
    <page-menu />
    <router-view class="router-view" />
  </div>
</template>

<script setup lang="ts">
import { useViewportStore } from '@/stores/viewportStore.ts'

const viewportStore = useViewportStore()
</script>

<style scoped lang="less">
.content {
  display: flex;
  transition: all 0.3s ease;
}

.router-view {
  flex: 1;
}
</style>
