<template>
  <n-flex vertical :size="20">
    <!-- 锁定管理器 -->
    <lock-manager />
    <!-- 密钥管理 -->
    <key-manager />
    <!-- 底部的公告区域 -->
    <n-card>
      <notice-renderer :notice="keyNotice" />
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
import { keyNotice } from '@/data/data-manager.ts'
import KeyManager from '@/views/key/key-manager/KeyManager.vue'
import LockManager from '@/views/key/lock-manager/LockManager.vue'
</script>

<style scoped lang="less">

</style>
