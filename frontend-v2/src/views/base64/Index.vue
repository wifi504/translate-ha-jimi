<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { autoUpdate, getHaJimiTitle } from '@/utils/random-title.ts'

import { updatePage } from '@/utils/user-agent.ts'
import PC from '@/views/base64/Base64PC.vue'
import Phone from '@/views/base64/Base64Phone.vue'

const currentPage = shallowRef()
const titleRunFlag = ref(true)

document.title = '哈基米语翻译'
onMounted(() => {
  updatePage(Phone, PC, currentPage)
  const title = getHaJimiTitle()
  autoUpdate(title, () => {
    document.title = `${title.value}语翻译`
  }, titleRunFlag)
})

onBeforeUnmount(() => {
  titleRunFlag.value = false
})
</script>
