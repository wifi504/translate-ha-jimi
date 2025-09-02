<template>
  <div class="menu-card">
    <menu-item route-path="/">
      <template #icon>
        <vi-fluent-home20-filled />
      </template>
      简介
    </menu-item>
    <menu-item route-path="/translate">
      <template #icon>
        <vi-fluent-draw-text24-filled />
      </template>
      哈基密语
      <template #sub-title>
        人儿语和哈基密语互译
      </template>
    </menu-item>
    <menu-item route-path="/key">
      <template #icon>
        <vi-fluent-key32-filled />
      </template>
      哈基密钥
      <template #sub-title>
        端到端生成双方对称密钥
      </template>
    </menu-item>
    <menu-item route-path="/file">
      <template #icon>
        <vi-antd-file-zip-twotone />
      </template>
      基密文件
      <template #sub-title>
        人儿类文件加密成基密文件
      </template>
    </menu-item>
    <menu-item>
      没有图标的Menu
      <template #sub-title>
        这是小小的描述啊啊啊啊啊啊啊啊啊
      </template>
    </menu-item>
    <menu-item>
      <template #icon>
        <vi-antd-menu-outlined />
      </template>
      没有详情的Menu
    </menu-item>
    <menu-item>
      纯粹的Menu
    </menu-item>
    <menu-item a-link-path="sdk-docs">
      <template #icon>
        <vi-fluent-code-circle20-filled />
      </template>
      SDK文档
      <template #sub-title>
        在其他应用集成此加密器
      </template>
    </menu-item>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped lang="less">
.menu-card {
  box-sizing: border-box;
  border-radius: 3px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--background-color-light);
  padding: 15px;
}
</style>
