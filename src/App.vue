<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import PC from '@/components/view/PC.vue'
import Phone from '@/components/view/Phone.vue'
import {autoUpdate, getHaJimiTitle} from '@/utils/randomTitle.ts'

const currentComponent = shallowRef()

function isMobileUA(ua: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

function handleResize() {
  updateUA()
}

function updateUA() {
  const ua = navigator.userAgent
  if (isMobileUA(ua)) {
    currentComponent.value = Phone
  }
  else {
    currentComponent.value = PC
  }
}

onMounted(() => {
  updateUA()
  window.addEventListener('resize', handleResize)
  const title = getHaJimiTitle()
  autoUpdate(title, () => {
    document.title = `${title.value}语翻译`
  })
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
