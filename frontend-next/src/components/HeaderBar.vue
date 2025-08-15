<template>
  <div class="header-container">
    <img class="avatar" src="@/assets/image/hjm.png" alt="LOGO">
    <div class="title">
      <span class="main">哈基密文加密器</span>
      <span class="sub">一款离线的端到端加密聊天工具</span>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.header-container {
  background: var(--background-color-light);
  width: 100vw;
  height: 90px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .1);
  position: fixed;
  z-index: 999;

  .avatar {
    width: 50px;
    height: 50px;
    margin-right: 20px;
  }
}
</style>
