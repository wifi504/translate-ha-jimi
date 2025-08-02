<template>
  <suspense>
    <async-main />
  </suspense>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useLoadingStore } from '@/stores/loading.ts'

useLoadingStore().show()

const AsyncMain = defineAsyncComponent({
  loader: () => import('@/views/index/Main.vue'),
})
</script>
