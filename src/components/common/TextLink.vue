<template>
  <span class="link" @click="handleNavigate">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    href?: string;
  }>(),
  {
    href: "",
  }
);

function handleNavigate() {
  if (props.href) {
    window.open(props.href, "_blank", "noopener,noreferrer");
  }
}
</script>

<style scoped lang="less">
.link {
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  &:active {
    text-decoration: underline;
    color: #e1817c;
  }
}
</style>
