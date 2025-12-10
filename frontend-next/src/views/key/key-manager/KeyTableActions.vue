<!-- 对指定名字的哈基密钥进行操作 -->
<template>
  <n-flex :size="6">
    <n-popconfirm
      negative-text="取消"
      positive-text="修改"
      :show-icon="false"
      @positive-click="() => contactStore.rename(name, newName)"
    >
      <n-card :bordered="false" title="修改密钥名称" header-style="padding: 0px;" content-style="padding: 0px;">
        <n-input
          v-model:value="newName"
          maxlength="8"
          placeholder="请输入新名称"
          show-count
        />
      </n-card>
      <template #trigger>
        <n-button size="small">
          <template #icon>
            <vi-antd-edit-outlined />
          </template>
          改名
        </n-button>
      </template>
    </n-popconfirm>
    <n-popconfirm
      negative-text="取消"
      positive-text="删除"
      :show-icon="false"
      @positive-click="() => contactStore.remove(name)"
    >
      <n-card :bordered="false" title="删除哈基密钥" header-style="padding: 0px;" content-style="padding: 0px;" />
      <template #trigger>
        <n-button size="small">
          <template #icon>
            <vi-antd-user-delete-outlined />
          </template>
          删除
        </n-button>
      </template>
    </n-popconfirm>
  </n-flex>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

defineProps<{
  name: string
}>()

const contactStore = useContactStore()
const newName = ref<string>('')
</script>
