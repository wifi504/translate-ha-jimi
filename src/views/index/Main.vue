<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { useLoadingStore } from '@/stores/loading.ts'
import { updatePage } from '@/utils/user-agent.ts'
import PC from '@/views/index/PC.vue'
import Phone from '@/views/index/Phone.vue'

const currentPage = shallowRef()

document.title = '哈基密语加密器'
onMounted(() => {
  updatePage(Phone, PC, currentPage)
  useLoadingStore().hide()
})
</script>
