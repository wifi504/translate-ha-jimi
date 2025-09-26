<template>
  <div
    class="content" :style="{
      'width': viewportStore.isSmallScreen ? '100%' : '85%',
      'padding': viewportStore.isSmallScreen ? '0' : '20px',
      'gap': viewportStore.isSmallScreen ? '0' : '20px',
      'min-height': viewportStore.isSmallScreen && loadingStore.isLoading ? 'calc(100vh - 90px)' : '',
    }"
  >
    <transition name="menu-transition">
      <page-menu v-if="!viewportStore.isSmallScreen" style="max-width: 250px" />
    </transition>
    <div class="router-view">
      <full-container-loading />
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loadingStore.ts'
import { useViewportStore } from '@/stores/viewportStore.ts'

const viewportStore = useViewportStore()
const loadingStore = useLoadingStore()
</script>

<style scoped lang="less">
.content {
  margin: auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  transition: all 0.3s ease;
}

.router-view {
  flex: 1;
  position: relative;
}

.menu-transition-enter-active,
.menu-transition-leave-active {
  transition: all 0.3s ease;
}

.menu-transition-enter-from,
.menu-transition-leave-to {
  width: 0;
  padding: 0;
}

.menu-transition-enter-to,
.menu-transition-leave-from {
  width: 250px;
}
</style>
