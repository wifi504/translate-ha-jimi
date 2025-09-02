<!-- 渲染 Notice 类型的数据 -->
<template>
  <div>
    <template v-for="item in notice" :key="item">
      <n-h3 prefix="bar">
        {{ item.title }}
      </n-h3>
      <template v-if="item.textList.length > 1">
        <n-ul>
          <template v-for="row in item.textList" :key="row">
            <n-li>
              <markdown-renderer :text="row" />
            </n-li>
          </template>
        </n-ul>
      </template>
      <template v-else>
        <markdown-renderer :text="item.textList[0]" />
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Notice } from '@/data/data-manager.ts'
import MarkdownRenderer from '@/components/notice/MarkdownRenderer.vue'

defineProps<{
  notice: Notice
}>()
</script>

<style scoped lang="less">

</style>
