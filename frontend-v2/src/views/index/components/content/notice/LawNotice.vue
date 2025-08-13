<template>
  <n-h3 prefix="bar">
    如果您继续停留在本网站，必须完全阅读且同意如下用户条款
  </n-h3>
  <n-ul>
    <n-li>
      哈基密语的设计是本着
      <high-light-text>
        娱乐
      </high-light-text>
      为目的，并借此进一步用作
      <high-light-text>
        学习交流
      </high-light-text>
      ，科普计算机程序的设计与算法实现。
    </n-li>
    <n-li>
      本程序基于现有开源加密技术实现，仅提供加密算法功能，不保存用户通信内容、
      <high-light-text>
        不参与用户通信行为
      </high-light-text>
      。
    </n-li>
    <n-li>
      您在使用哈基密语网站、使用源码二次构建项目等场景时，需要承诺不使用本软件从事以下行为，包括但不限于：
      <br>
      1. 发布、传播、存储违反中国法律法规的信息；<br>
      2. 组织、策划或实施电信诈骗、洗钱、非法集会、黄赌毒等违法犯罪活动；<br>
      3. 利用加密机制逃避国家监管或阻碍执法；<br>
      4. 其他违反社会公共秩序、伦理道德的行为。<br>
      如您违反上述承诺，您应
      <high-light-text>
        独立承担
      </high-light-text>
      一切法律责任。
    </n-li>
    <n-li>
      哈基密语网站无法、也不承担对用户传输内容的审查义务，但保留依法向有关部门报告可疑行为的权利，
      如因您使用本网站导致任何第三方或国家机关的调查、起诉或处罚，您应独立承担责任，网站不承担任何连带或赔偿责任。
    </n-li>
  </n-ul>
</template>

<script setup lang="ts">
import { NH3, NLi, NUl } from 'naive-ui'
import HighLightText from '@/components/common/HighLightText.vue'
</script>

<style scoped lang="less">

</style>
