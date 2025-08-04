<template>
  <div class="link-button" :style="`--my-btn-text-size: ${size}px;`">
    <n-button text :type="type" size="small" @click="handleNavigate">
      <template #icon>
        <n-icon>
          <share16-regular />
        </n-icon>
      </template>
      <template #default>
        <span class="text"><slot /></span>
      </template>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import type { Type } from 'naive-ui/es/button/src/interface'
import { Share16Regular } from '@vicons/fluent'
import { NButton, NIcon } from 'naive-ui'

const props = withDefaults(defineProps<{
  href?: string
  size?: number
  type?: Type
}>(), {
  size: 14,
  type: 'primary',
})

function handleNavigate() {
  if (props.href) {
    window.open(props.href, '_blank')
  }
}
</script>

<style scoped lang="less">
.link-button {
  display: inline-block;
  position: relative;
  top: 4px;
  .text {
    font-size: var(--my-btn-text-size);
    padding-bottom: 2px;
    border-bottom: 1px #8a4845 dashed;
  }
}
</style>
