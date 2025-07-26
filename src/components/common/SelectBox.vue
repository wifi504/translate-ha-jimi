<template>
  <select class="select" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)">
    <slot />
  </select>
</template>

<script setup lang="ts">
// eslint-disable-next-line unused-imports/no-unused-vars
const props = withDefaults(defineProps<{
  modelValue: any
}>(), {

})

// eslint-disable-next-line unused-imports/no-unused-vars
const emit = defineEmits(['update:modelValue'])
</script>

<style lang="less" scoped>
.select {
  vertical-align: top;
  padding: 10px 14px;
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  background-color: #fff;
  border: 2px solid #ccc;
  border-radius: 6px;
  resize: none;
  box-sizing: border-box;
  transition: border-color 0.3s, box-shadow 0.3s;

  &:hover {
    border-color: #999;
  }

  &:focus {
    border-color: #8a4845;
    box-shadow: 0 0 0 2px rgba(138, 72, 69, 0.2);
    outline: none;
  }
}
</style>
