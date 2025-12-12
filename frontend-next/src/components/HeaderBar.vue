<template>
  <div>
    <div
      class="header-container"
      :class="{
        'header-container-phone': viewportStore.isSmallScreen,
      }"
    >
      <div
        v-if="viewportStore.isSmallScreen"
        style="color: var(--primary-color-dark);
               cursor: pointer;
               display: flex;
               flex-direction: column;
               align-items: center;"
        @click="() => showMenuDrawer = true"
      >
        <n-icon class="menu-icon" :size="30">
          <vi-antd-menu-unfold-outlined />
        </n-icon>
        <span style="font-size: var(--font-size-small)">菜单</span>
      </div>
      <img class="avatar" src="@/assets/image/hjm.png" alt="LOGO">
      <div class="title">
        <span class="main">哈基密文加密器</span>
        <span class="sub">
          一款开源且可离线使用的<br v-if="viewportStore.isSmallScreen"> 端到端加密 & 编码工具
        </span>
      </div>
      <span
        v-if="!viewportStore.isSmallScreen"
        class="navigate-link" @click="navigateBiliBili"
      >
        →<span>哈</span>观看<span>基密</span>演示视频，曼波~
      </span>
    </div>
    <div class="header-placeholder" />
    <n-drawer v-model:show="showMenuDrawer" placement="left" width="75vw">
      <page-menu @click="() => showMenuDrawer = false" />
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useViewportStore } from '@/stores/viewportStore.ts'

const viewportStore = useViewportStore()

function navigateBiliBili() {
  window.open('https://www.bilibili.com/video/BV1UctVzTEGv/', '_blank', 'noopener,noreferrer')
}

const showMenuDrawer = ref<boolean>(false)

watch(() => viewportStore.isSmallScreen, (newVal: boolean) => {
  if (!newVal) {
    showMenuDrawer.value = false
  }
})
</script>

<style scoped lang="less">
.header-container {
  user-select: none;
  background: var(--background-color-light);
  padding: 0 20%;
  height: 90px;
  line-height: 1.2;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  transition: all 0.3s ease;

  .avatar {
    width: 50px;
    height: 50px;
  }

  .title {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;

    .main {
      color: var(--text-color-normal);
      font-size: var(--font-size-super);
      font-weight: bold;
    }

    .sub {
      color: var(--text-color-normal);
      font-size: var(--font-size-normal);
      font-weight: normal;
    }
  }

  .navigate-link {
    font-size: var(--font-size-large);
    color: var(--text-color-light);
    border-bottom: var(--text-color-light) 2px dashed;
    position: relative;
    left: 20px;
    transition: all 0.3s;

    span {
      display: inline-block;
      transition: transform 0.3s;
      transform: scale(1);
    }

    &:hover {
      border-bottom: var(--primary-color) 2px dashed;
      cursor: pointer;
      transform: scale(0.9);
      letter-spacing: -0.7px;

      span {
        transform: scale(2.3);
        color: var(--primary-color);
      }
    }

    &:active {
      transform: scale(10);
      letter-spacing: -10px;
    }
  }
}

.header-container-phone {
  padding: 0 20px;

  .title {
    .main {
      font-size: var(--font-size-large);
    }

    .sub {
      font-size: var(--font-size-small);
    }
  }
}

.header-placeholder {
  height: 90px;
}
</style>
