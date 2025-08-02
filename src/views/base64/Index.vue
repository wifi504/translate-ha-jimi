<template>
  <component :is="currentPage" />
</template>

<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import { autoUpdate, getHaJimiTitle } from '@/utils/randomTitle.ts'

import PC from '@/views/base64/Base64PC.vue'
import Phone from '@/views/base64/Base64Phone.vue'

const currentPage = shallowRef(PC)

function isMobileUA(ua: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

function updatePage() {
  const ua = navigator.userAgent
  if (isMobileUA(ua)) {
    currentPage.value = Phone
  }
  else {
    currentPage.value = PC
  }
}

onMounted(() => {
  updatePage()
  const title = getHaJimiTitle()
  autoUpdate(title, () => {
    document.title = `${title.value}语翻译`
  })
})
</script>
