<template>
  <textarea
    :value="modelValue"
    class="input"
    :class="mode"
    :placeholder="props.placeholder"
    :rows="props.rows"
    :disabled="props.disabled"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  rows?: number
  placeholder?: string
  modelValue?: string
  disabled?: boolean
  mode?: 'pc' | 'phone'
}>(), {
  rows: 2,
  placeholder: '请在此输入内容...',
  disabled: false,
  mode: 'pc',
})

// eslint-disable-next-line unused-imports/no-unused-vars
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped lang="less">
.input {
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
  cursor: text;

  &:hover {
    border-color: #999;
  }

  &:focus {
    border-color: #8a4845;
    box-shadow: 0 0 0 2px rgba(138, 72, 69, 0.2);
    outline: none;
  }

  /* 自定义滚动条（WebKit） */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(100, 100, 100, 0.3);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(100, 100, 100, 0.6);
  }

  &::-webkit-scrollbar-button {
    display: none;
    height: 0;
    width: 0;
  }

  /* Firefox 滚动条兼容 */
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 100, 100, 0.3) transparent;
}

.phone {
  width: 100%;
  border-radius: 0;
  border-left: none;
  border-right: none;
}
</style>
