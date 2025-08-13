<template>
  <div>hello world!</div>
  <div>读取 Git SHA 环境变量：{{ gitSha }}</div>
  <div>读取 Version 环境变量：{{ version }}</div>
  <a :href="`https://github.com/wifi504/translate-ha-jimi/commit/${gitSha}`">前往 {{ gitSha.substring(0, 7) }}</a>
</template>

<script setup lang="ts">
const gitSha = import.meta.env.VITE_GIT_SHA
const version = import.meta.env.VITE_VERSION
</script>
