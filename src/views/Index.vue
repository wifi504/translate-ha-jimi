<template>
  <button @click="handleGoBase64">
    前往旧版
  </button>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function handleGoBase64() {
  router.push('/base64')
}
</script>

<style scoped lang="less">

</style>
