<template>
  <n-card>
    <template #header>
      密钥管理
    </template>
    <template #header-extra>
      <n-button-group>
        <n-button :disabled="!contactStore.hasAuth">
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
    <n-empty v-if="contactStore.hasAuth || contactStore.contactList.length === 0" description="无数据" />
  </n-card>
</template>

<script setup lang="ts">
import { useContactStore } from '@/stores/contactStore.ts'

const contactStore = useContactStore()
</script>

<style scoped lang="less">

</style>
