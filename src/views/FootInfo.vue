<template>
  <div v-if="props.mode === 'pc'" class="foot-container-pc">
    <p>
      <text-link href="https://lhlnb.top/hajimi">
        {{ t1 }}语翻译器
      </text-link>
      <span> | 项目基于 Vue3 + TypeScript + Vite 构建</span>
    </p>
    <p>
      <text-link href="https://github.com/wifi504/translate-ha-jimi">
        使用 GPL-3.0 license 开放源代码
      </text-link> | Copyright © 2025
      <text-link href="https://space.bilibili.com/335320968">
        WIFI连接超时
      </text-link> All Rights Reserved.
    </p>
    <p>
      <text-link href="https://beian.miit.gov.cn/">
        蜀ICP备2022004197号
      </text-link>
    </p>
  </div>
  <div v-else class="foot-container-phone">
    <p>
      <text-link href="https://lhlnb.top/hajimi">
        {{ t1 }}语翻译器
      </text-link>
    </p>
    <p>项目基于 Vue3 + TypeScript + Vite 构建</p>
    <p>
      <text-link href="https://github.com/wifi504/translate-ha-jimi">
        使用 GPL-3.0 license 开放源代码
      </text-link>
    </p>
    <p>
      Copyright © 2025
      <text-link href="https://space.bilibili.com/335320968">
        WIFI连接超时
      </text-link> All Rights Reserved.
    </p>
    <p>
      <text-link href="https://beian.miit.gov.cn/">
        蜀ICP备2022004197号
      </text-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TextLink from '@/components/common/TextLink.vue'
import { autoUpdate, getHaJimiTitle } from '@/utils/randomTitle.ts'

const props = withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})

const t1 = getHaJimiTitle()

onMounted(() => {
  autoUpdate(t1)
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
  position: fixed;
  bottom: 0;
  z-index: 999;
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
