<template>
  <div v-if="props.mode === 'pc'" class="foot-container-pc">
    <p>
      哈基密语加密器 | 一款离线的端到端加密聊天工具 |
      <text-link href="https://app.xiaobaozi.cn/">
        友情链接：一只小包子哈基米加密器
      </text-link>
    </p>
    <p>
      使用 GPL-3.0 license 开放源代码 |
      <text-link href="https://github.com/wifi504/translate-ha-jimi">
        Copyright © 2025 哈基密语加密器 (v2.3) All Rights Reserved.
      </text-link>
    </p>
    <p>
      <text-link href="https://space.bilibili.com/335320968">
        Powered By WIFI连接超时
      </text-link>
      |
      <text-link href="https://beian.miit.gov.cn/">
        蜀ICP备2022004197号
      </text-link>
    </p>
  </div>
  <div v-else class="foot-container-phone">
    <p>
      哈基密语加密器
    </p>
    <p>
      一款离线的端到端加密聊天工具
    </p>
    <p>
      <text-link href="https://app.xiaobaozi.cn/">
        友情链接：一只小包子丶哈基米加密器
      </text-link>
    </p>
    <p>
      使用 GPL-3.0 license 开放源代码
    </p>
    <p>
      <text-link href="https://github.com/wifi504/translate-ha-jimi">
        Copyright © 2025 哈基密语加密器 All Rights Reserved.
      </text-link>
    </p>
    <p>
      <text-link href="https://space.bilibili.com/335320968">
        Powered By WIFI连接超时
      </text-link>
    </p>
    <p>
      <text-link href="https://beian.miit.gov.cn/">
        蜀ICP备2022004197号
      </text-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import TextLink from '@/components/common/TextLink.vue'

const props = withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})
</script>

<style scoped lang="less">
* {
  user-select: none;
  color: #ffffff;
  font-size: 14px;
  font-weight: lighter;
}

.foot-container-pc {
  background-color: #8a4845;
  width: 100%;
  text-align: center;
  padding: 15px 0;

  p {
    margin: 0;
    padding: 5px 0;
  }
}

.foot-container-phone {
  background-color: #8a4845;
  width: 100%;
  text-align: center;
  padding: 15px 0 50px 0;

  p {
    margin: 0;
    padding: 5px 0;
  }
}
</style>
