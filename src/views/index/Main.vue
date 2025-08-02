<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import test from '@/service/test.ts'
import { useLoadingStore } from '@/stores/loading.ts'
import { autoUpdate, getHaJimiTitle } from '@/utils/random-title.ts'
import { updatePage } from '@/utils/user-agent.ts'
import PC from '@/views/index/PC.vue'
import Phone from '@/views/index/Phone.vue'

const currentPage = shallowRef()
const titleRunFlag = ref(true)

document.title = '哈基密语加密器'
onMounted(() => {
  updatePage(Phone, PC, currentPage)
  test()
  const title = getHaJimiTitle()
  autoUpdate(title, () => {
    document.title = `${title.value.substring(0, 2)}密语加密器`
  }, titleRunFlag)
  useLoadingStore().hide()
})

onBeforeUnmount(() => {
  titleRunFlag.value = false
})
</script>
