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
        <n-button :disabled="!contactStore.hasAuth">
          <template #icon>
            <n-icon>
              <vi-fluent-arrow-download24-regular />
            </n-icon>
          </template>
          导入
        </n-button>
        <n-button :disabled="!contactStore.hasAuth">
          <template #icon>
            <n-icon>
              <vi-fluent-arrow-upload24-regular />
            </n-icon>
          </template>
          导出
        </n-button>
      </n-button-group>
    </template>
    <key-table />
  </n-card>
</template>

<script setup lang="ts">
import { useContactStore } from '@/stores/contactStore.ts'
import KeyTable from '@/views/key/key-manager/KeyTable.vue'

const contactStore = useContactStore()

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
