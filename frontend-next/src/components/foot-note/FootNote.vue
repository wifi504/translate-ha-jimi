<!-- 全局脚注组件 -->
<template>
  <div ref="footNotesRef" class="foot-container" :class="isSticky ? 'sticky-bottom' : ''">
    <!-- 第一行块：带图标的超链接 -->
    <div class="block divider">
      <span v-for="(item, index) in footNotes.iconLinks" :key="index">
        <foot-a-link :icon-svg="item.iconSVG" :href="item.href" :gap="5">
          {{ item.title }}
        </foot-a-link>
      </span>
    </div>
    <!-- 第二行块：友情链接， “|” 分隔 -->
    <div class="block divider">
      友情链接：
      <span v-for="(item, index) in footNotes.textLinks" :key="index">
        <foot-a-link :href="item.href">
          {{ item.title }}
        </foot-a-link>
      </span>
    </div>
    <!-- 第三行块：版权信息、版本信息 -->
    <div class="block">
      <span>
        Copyleft 🄯 {{ getYearSince() }} 哈基密文加密器 v{{ version }}
      </span>
      <span class="git-commit">
        <span>(</span>
        <foot-a-link :icon-svg="commitSvg" :href="`https://github.com/wifi504/translate-ha-jimi/commit/${gitSha}`">
          {{ gitSha.substring(0, 7) }}
        </foot-a-link>
        <span>)</span>
      </span>
      <span>
        保留自由权利 All Freedom reserved.
      </span>
    </div>
    <!-- 第四行块：备案信息、额外信息 -->
    <div class="block divider">
      <span>本网页使用 CI/CD 自动化部署上云</span>
      <span v-if="beianName">
        <foot-a-link href="https://beian.miit.gov.cn/">
          {{ beianName }}
        </foot-a-link>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { footNotes } from '@/data/data-manager.ts'

function getYearSince(): string {
  const since = 2025
  const currentYear = new Date().getFullYear()
  return currentYear === since ? String(since) : `${since}-${currentYear}`
}

const version = import.meta.env.VITE_VERSION
const gitSha = import.meta.env.VITE_GIT_SHA
const beianName = import.meta.env.VITE_BEIAN_NAME

const commitSvg = '<svg t="1755223842782" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15954" width="200" height="200"><path d="M853.344 213.344c0-70.4-57.6-128-128-128s-128 57.6-128 128c0 55.456 34.144 102.4 83.2 119.456-14.944 61.856-121.6 108.8-211.2 147.2-38.4 17.056-76.8 34.144-106.656 51.2v-198.4c49.056-17.056 85.344-64 85.344-119.456 0-70.4-57.6-128-128-128s-128 57.6-128 128c0 55.456 36.256 102.4 85.344 119.456v356.256c-49.056 17.056-85.344 64-85.344 119.456 0 70.4 57.6 128 128 128s128-57.6 128-128c0-55.456-36.256-102.4-85.344-119.456V640c4.256-21.344 93.856-59.744 140.8-81.056 119.456-51.2 253.856-110.944 264.544-224 49.056-17.056 85.344-66.144 85.344-121.6zM320 170.656c23.456 0 42.656 19.2 42.656 42.656s-19.2 42.656-42.656 42.656-42.656-19.2-42.656-42.656 19.2-42.656 42.656-42.656z m0 682.688c-23.456 0-42.656-19.2-42.656-42.656s19.2-42.656 42.656-42.656 42.656 19.2 42.656 42.656-19.2 42.656-42.656 42.656zM725.344 256c-23.456 0-42.656-19.2-42.656-42.656s19.2-42.656 42.656-42.656S768 189.888 768 213.344 748.8 256 725.344 256z" p-id="15955"></path></svg>'

const footNotesRef = ref<HTMLDivElement | null>(null)
const isSticky = ref<boolean>(false)
let rafId: number

function updatePosition() {
  if (footNotesRef.value) {
    const rect = footNotesRef.value.getBoundingClientRect()
    const height = window.innerHeight
    const pageHeight = document.body.scrollHeight
    const footHeight = isSticky.value ? 0 : rect.height
    const shouldStick = pageHeight - footHeight < height - rect.height
    if (isSticky.value !== shouldStick) {
      isSticky.value = shouldStick
    }
  }
  rafId = requestAnimationFrame(updatePosition)
}

onMounted(() => {
  updatePosition()
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
})
</script>

<style scoped lang="less">
.foot-container {
  color: var(--background-color);
  background-color: var(--primary-color-dark);
  font-size: var(--font-size-small);
  padding: 25px 50px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .block {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    align-items: baseline;
    text-align: center;
    line-height: 1.2;

    .git-commit {
      span {
        position: relative;
        top: calc(var(--font-size-small) * -0.1);
      }
    }
  }

  .divider span:not(:last-child)::after {
    content: "|";
    margin-left: 5px;
  }
}

.sticky-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
