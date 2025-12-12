<template>
  <n-card>
    <template #header>
      密钥管理
    </template>
    <template #header-extra>
      <n-button-group>
        <n-button :disabled="!contactStore.hasAuth" @click="handleAddOne">
          <template #icon>
            <n-icon>
              <vi-fluent-add24-regular />
            </n-icon>
          </template>
          新增
        </n-button>
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
    <!-- 导入导出模态框 -->
    <import-key-dialog ref="importKeyDialogRef" />
    <export-key-dialog ref="exportKeyDialogRef" />
  </n-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import ExportKeyDialog from '@/views/key/key-manager/dialog/ExportKeyDialog.vue'
import ImportKeyDialog from '@/views/key/key-manager/dialog/ImportKeyDialog.vue'
import KeyTable from '@/views/key/key-manager/KeyTable.vue'

const contactStore = useContactStore()
const exportKeyDialogRef = ref<InstanceType<typeof ExportKeyDialog>>()
const importKeyDialogRef = ref<InstanceType<typeof ImportKeyDialog>>()

function handleAddOne() {
  function generateRandomData() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let str = ''
    for (let i = 0; i < 8; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const arr = new Uint8Array(32)
    crypto.getRandomValues(arr)
    return { str, arr }
  }
  const { str, arr } = generateRandomData()
  contactStore.setSecretKey(str, arr)
}
</script>

<style scoped lang="less">

</style>
