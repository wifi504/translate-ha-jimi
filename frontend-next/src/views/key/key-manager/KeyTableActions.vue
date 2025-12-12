<!-- 对指定名字的哈基密钥进行操作 -->
<template>
  <n-flex :size="6">
    <n-popconfirm
      negative-text="取消"
      positive-text="修改"
      :show-icon="false"
      @positive-click="handleUpdateName"
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
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

const props = defineProps<{
  name: string
}>()

const message = useMessage()
const contactStore = useContactStore()
const newName = ref<string>('')

function handleUpdateName() {
  if (!newName.value) {
    message.error('请输入新名称')
    return
  }
  if (props.name === newName.value) {
    message.warning('请勿修改为原名称')
    return
  }
  if (contactStore.contactList.includes(newName.value)) {
    message.error('已存在同名密钥，修改失败')
    return
  }
  contactStore.rename(props.name, newName.value)
  message.success('修改成功，已重新排序')
}
</script>
