<!-- 超链接组件 -->
<template>
  <a :href="href" target="_blank">
    <span v-if="iconSvg" class="icon" :style="`margin-right: ${gap}px;`" v-html="iconSvg" />
    <span class="text"><slot /></span>
  </a>
</template>

<script setup lang="ts">
defineProps<{
  href: string
  iconSvg?: string
  gap?: number
}>()
</script>

<style scoped lang="less">
a {
  text-decoration: none;
  color: var(--background-color);
  font-size: var(--font-size-normal);

  &:hover, &:active {
    color: var(--background-color-light);
    text-decoration: underline dashed;

    .icon::v-deep(svg) {
      path {
        fill: var(--background-color-light);
      }
    }
  }

  .icon {
    width: var(--font-size-large);
    height: var(--font-size-large);
    display: inline-block;
    position: relative;
    top: calc(var(--font-size-normal) * 0.2);

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
