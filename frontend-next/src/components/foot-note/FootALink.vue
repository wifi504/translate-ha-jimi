<!-- 超链接组件 -->
<template>
  <a :href="href" target="_blank">
    <span v-if="iconSvg" class="icon" v-html="iconSvg" />
    <span class="text"><slot /></span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  iconSvg?: string
}>()
</script>

<style scoped lang="less">
a {
  text-decoration: none;
  color: var(--background-color);
  font-size: var(--font-size-normal);
  height: var(--font-size-large);
  display: inline-flex;
  align-items: center;
  gap: 5px;

  &:hover, &:active {
    color: var(--background-color-light);
    text-decoration: underline dashed;
  }

  .text {
    position: relative;
    top: 1px;
  }

  .icon {
    width: var(--font-size-large);
    height: var(--font-size-large);
    display: inline-block;

    &::v-deep(svg) {
      display: block;
      width: 100%;
      height: 100%;

      path {
        fill: var(--background-color);
      }
    }
  }
}
</style>
