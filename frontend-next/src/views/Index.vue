<template>
  <n-card>
    <notice-renderer :notice="homeNotice" />
  </n-card>
</template>

<script setup lang="ts">
import { homeNotice } from '@/data/data-manager.ts'
</script>

<style scoped lang="less">
</style>
