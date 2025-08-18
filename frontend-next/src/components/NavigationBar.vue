<template>
  <div>
    导航栏
  </div>
</template>

<script setup lang="ts">
import { encoder } from 'hayalib'

console.log(encoder.encode(new TextEncoder().encode('你好呀'), '窝勒个豆'))

console.log(new TextDecoder().decode(encoder.decode('哈基米服都瘦帽慢都帽前引哦吗吉利')))
</script>

<style scoped lang="less">

</style>
