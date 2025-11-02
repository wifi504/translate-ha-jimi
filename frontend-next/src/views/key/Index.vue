<template>
  <div>
    <n-card>
      <template #header>
        <n-flex v-if="!contactStore.hasClear" align="center" :size="4">
          <n-icon>
            <vi-antd-unlock-twotone v-if="contactStore.hasAuth" />
            <vi-antd-lock-twotone v-else />
          </n-icon>
          {{ contactStore.hasAuth ? '密钥库已解锁' : '密钥库已锁定' }}
        </n-flex>
        <n-flex v-else align="center" :size="4">
          <n-icon>
            <vi-antd-inbox-outlined />
          </n-icon>
          没有哈基密钥
        </n-flex>
      </template>
      <template #header-extra>
        <n-flex>
          <n-button type="primary">
            解锁
          </n-button>
          <n-button type="primary" ghost>
            重置密钥库
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { useContactStore } from '@/stores/contactStore.ts'

const contactStore = useContactStore()
</script>

<style scoped lang="less">

</style>
