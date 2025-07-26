<!-- eslint-disable style/semi -->
<template>
  <option :selected="props.selected" :disabled="props.disabled" :value="props.value">
    <slot />
  </option>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  selected?: boolean
  value: any
}>(), {
  disabled: false,
  selected: false,
})
</script>

<style lang="less" scoped>
</style>
