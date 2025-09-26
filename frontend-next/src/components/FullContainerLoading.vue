<template>
  <transition name="full-loading">
    <div v-show="loadingStore.isLoading" class="loading-overlay">
      <div class="spinner">
        <svg
          xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid" width="200" height="200"
          style="shape-rendering: auto; display: block; background: rgb(255, 255, 255);"
        >
          <g class="rotate-group-outer">
            <circle
              stroke-linecap="round" fill="none" stroke-dasharray="50.26548245743669 50.26548245743669"
              stroke="#af635f" stroke-width="8" r="32" cy="50" cx="50"
            />
          </g>
          <g class="rotate-group-inner">
            <circle
              stroke-linecap="round" fill="none" stroke-dashoffset="36.12831551628262"
              stroke-dasharray="36.12831551628262 36.12831551628262" stroke="#dcaf6a" stroke-width="8" r="23"
              cy="50" cx="50"
            />
          </g>
        </svg>
      </div>
      <div class="text">
        <div>本程序在浏览器本地运行</div>
        <div>依赖加载中，请稍等...</div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useLoadingStore } from '@/stores/loadingStore.ts'

const loadingStore = useLoadingStore()
</script>

<style scoped lang="less">
.loading-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255);
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 50px;

  .text {
    user-select: none;
    font-size: 20px;
    color: #333;
    align-items: center;
    text-align: center;
    line-height: 1.5;
  }
}

.full-loading-enter-active {
  transition: none;
}

.full-loading-leave-active {
  transition: all 0.4s ease;
}

.full-loading-leave-to {
  opacity: 0;
}

.spinner, .text {
  transition: all 0.4s ease;
}

.full-loading-leave-to .spinner,
.full-loading-leave-to .text {
  transform: scale(0);
}

.rotate-group-outer {
  animation: rotate-clockwise 1s linear infinite;
}
.rotate-group-inner {
  animation: rotate-counter 1s linear infinite;
}

@keyframes rotate-clockwise {
  0% { transform: rotate(0deg); transform-origin: 50% 50%; }
  100% { transform: rotate(360deg); transform-origin: 50% 50%; }
}
@keyframes rotate-counter {
  0% { transform: rotate(0deg); transform-origin: 50% 50%; }
  100% { transform: rotate(-360deg); transform-origin: 50% 50%; }
}
</style>
