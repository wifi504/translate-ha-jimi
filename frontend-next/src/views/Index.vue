<template>
  <n-card>
    <notice-renderer :notice="homeNotice" />
    <n-h3 prefix="bar">
      这个哈基站迄今为止存活了
    </n-h3>
    <time-passed :from="new Date('2025-07-19 12:53')" />
  </n-card>
</template>

<script setup lang="ts">
import { homeNotice } from '@/data/data-manager.ts'
</script>
