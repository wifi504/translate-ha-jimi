<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PC from './components/view/PC.vue'
import Phone from './components/view/Phone.vue'

const currentComponent = ref()

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
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
