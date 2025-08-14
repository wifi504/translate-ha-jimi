<!-- 全局脚注组件 -->
<template>
  <div class="foot-container">
    <!-- 第一行块：带图标的超链接 -->
    <div class="block">
      <foot-a-link href="aaa" :icon-svg="footNotes.iconLinks[1].iconSVG">
        123
      </foot-a-link>
    </div>
    <!-- 第二行块：纯文本超链接， “|” 分隔 -->
    <div class="block">
      456
    </div>
    <!-- 第三行块：版权信息、版本信息 -->
    <div class="block">
      789
    </div>
    <!-- 第四行块：备案信息、额外信息 -->
    <div class="block">
      {{ footNotes.textLinks[0].title }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { footNotes } from '@/data/data-manager.ts'
</script>

<style scoped lang="less">
.foot-container {
  color: var(--background-color);
  background-color: var(--primary-color-dark);
  font-size: var(--font-size-normal);
  padding: 25px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;

  .block {
    text-align: center;
  }
}
</style>
