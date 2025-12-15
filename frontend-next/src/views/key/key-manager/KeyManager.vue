<template>
  <n-card>
    <template #header>
      密钥管理
    </template>
    <template #header-extra>
      <n-button-group>
        <n-dropdown
          :options="addKeyOptions"
          placement="bottom"
          trigger="click"
          show-arrow
          @select="handleSelect"
        >
          <n-button :disabled="!contactStore.hasAuth">
            <template #icon>
              <n-icon>
                <vi-fluent-add24-regular />
              </n-icon>
            </template>
            新增
          </n-button>
        </n-dropdown>
        <n-button :disabled="!contactStore.hasAuth" @click="() => importKeyDialogRef?.show()">
          <template #icon>
            <n-icon>
              <vi-fluent-arrow-download24-regular />
            </n-icon>
          </template>
          导入
        </n-button>
        <n-button :disabled="!contactStore.hasAuth" @click="() => exportKeyDialogRef?.show()">
          <template #icon>
            <n-icon>
              <vi-fluent-arrow-upload24-regular />
            </n-icon>
          </template>
          导出
        </n-button>
      </n-button-group>
    </template>
    <!-- 密钥管理数据表 -->
    <key-table />
    <!-- 新增密钥模态框 -->
    <add-key-dialog-by-word ref="addKeyDialogByWordRef" />
    <add-key-dialog-by-e2-e ref="addKeyDialogByE2ERef" />
    <!-- 导入导出模态框 -->
    <import-key-dialog ref="importKeyDialogRef" />
    <export-key-dialog ref="exportKeyDialogRef" />
  </n-card>
</template>

<script setup lang="ts">
import type { DropdownOption } from 'naive-ui'
import { ApiOutlined, KeyOutlined } from '@vicons/antd'
import { NIcon } from 'naive-ui'
import { h, shallowRef } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import AddKeyDialogByE2E from '@/views/key/key-manager/dialog/AddKeyDialogByE2E.vue'
import AddKeyDialogByWord from '@/views/key/key-manager/dialog/AddKeyDialogByWord.vue'
import ExportKeyDialog from '@/views/key/key-manager/dialog/ExportKeyDialog.vue'
import ImportKeyDialog from '@/views/key/key-manager/dialog/ImportKeyDialog.vue'
import KeyTable from '@/views/key/key-manager/KeyTable.vue'

const contactStore = useContactStore()
const addKeyDialogByE2ERef = shallowRef<InstanceType<typeof AddKeyDialogByE2E>>()
const addKeyDialogByWordRef = shallowRef<InstanceType<typeof AddKeyDialogByWord>>()
const exportKeyDialogRef = shallowRef<InstanceType<typeof ExportKeyDialog>>()
const importKeyDialogRef = shallowRef<InstanceType<typeof ImportKeyDialog>>()

const addKeyOptions: DropdownOption[] = [
  {
    label: '密钥口令生成',
    key: 'word',
    icon: () => h(
      NIcon,
      () => h(KeyOutlined),
    ),
  },
  {
    label: '端到端加密',
    key: 'e2e',
    icon: () => h(
      NIcon,
      () => h(ApiOutlined),
    ),
  },
]

function handleSelect(key: string, _option: DropdownOption) {
  if (key === 'word') {
    addKeyDialogByWordRef.value?.show()
    return
  }
  if (key === 'e2e') {
    addKeyDialogByE2ERef.value?.show()
    return
  }
  console.warn('没有匹配的选项')
}
</script>

<style scoped lang="less">

</style>
