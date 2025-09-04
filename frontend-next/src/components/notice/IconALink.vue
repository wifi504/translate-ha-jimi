<!-- 带图标的超链接 -->
<template>
  <a
    :href="href" target="_blank" class="a-link-container" :style="{
      '--flex-gap': `${gap}px`,
    }"
  >
    <n-icon :size="iconSize">
      <slot name="icon">
        <vi-fluent-share16-regular />
      </slot>
    </n-icon>
    <div class="content"><slot /></div>
  </a>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  href: string
  iconSize?: number
  gap?: number
}>(), {
  iconSize: 18,
  gap: 2,
})
</script>

<style scoped lang="less">
.a-link-container {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  gap: var(--flex-gap);
  text-decoration: none;
  color: var(--primary-color);
  position: relative;
  top: -1px;

  &:hover {
    color: var(--primary-color-light);

    .content {
      text-decoration: underline dashed;
    }
  }

  &:active {
    color: var(--primary-color-dark);
  }
}
</style>
