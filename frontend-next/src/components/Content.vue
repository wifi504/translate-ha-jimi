<template>
  <div
    class="content" :style="{
      width: viewportStore.isSmallScreen ? '100%' : '85%',
      padding: viewportStore.isSmallScreen ? '0' : '20px',
      gap: viewportStore.isSmallScreen ? '0' : '20px',
    }"
  >
    <transition name="menu-transition">
      <page-menu v-if="!viewportStore.isSmallScreen" style="max-width: 250px" />
    </transition>
    <router-view v-slot="{ Component }" class="router-view">
      <transition name="router-view" mode="out-in">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import { useViewportStore } from '@/stores/viewportStore.ts'

const viewportStore = useViewportStore()
</script>

<style scoped lang="less">
.content {
  margin: auto;
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  transition: all 0.3s ease;
}

.router-view {
  flex: 1;
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

.router-view-enter-active {
  transition: all 0.5s cubic-bezier(0, 0.5, 0.5, 1);
}

.router-view-leave-active {
  transition: all 0.5s cubic-bezier(0.5, 0, 1, 0.5);
}

.router-view-enter-from {
  opacity: 0;
  transform: translateY(200%);
}

.router-view-leave-to {
  opacity: 0;
  transform: translateY(-200%);
}
</style>
