<template>
  <n-card hoverable style="margin-bottom: 25px" :size="mode === 'phone' ? 'small' : 'medium'">
    <n-h3 prefix="bar">
      哈基提示
    </n-h3>
    <n-ul>
      <n-li>
        哈基密语加密器是一款在本地实现的端到端加密聊天工具，密钥交换采用ECDH协议，
        加密采用ChaCha20算法，且“交换哈基密钥”和“加密哈基密语”背后都有随机盐加数字签名，
        在量子计算机问世前，
        <high-light-text>
          天王老子来了也没法破解、篡改、撞库、中间人劫持！
        </high-light-text>
      </n-li>
      <n-li>
        本网站的所有功能完全基于前端浏览器
        <high-light-text>
          本地实现
        </high-light-text>
        ，主要使用 Vue3 + TypeScript
        ，项目开放源代码，可以
        <link-button href="https://github.com/wifi504/translate-ha-jimi">
          点击前往Github
        </link-button>
        查看，求Star。
      </n-li>
      <n-li>
        你需要注意访问网站时是否是
        <high-light-text>https</high-light-text>
        访问且
        <high-light-text>证书有效</high-light-text>
        ！
      </n-li>
      <n-li>
        你当然可以根据源码自己本地构建部署，这肯定是最安全的！
      </n-li>
      <n-li>
        如果你感兴趣更多内容，可以前往作者主要活跃平台点个关注：
        <link-button href="https://space.bilibili.com/335320968">
          B站 WIFI连接超时
        </link-button>
      </n-li>
    </n-ul>
    <n-h3 prefix="bar">
      为什么要使用哈基密语？
    </n-h3>
    <n-ul>
      <n-li>
        使用此工具，你可以在互联网上自由的与任何人保持
        <high-light-text>
          绝对私密
        </high-light-text>
        地聊天，
        无论你使用什么通讯软件，也不可能再因为聊到了吃而马上为你精准推送团购、外卖；
        刚说完手机好烫啊马上刷到XX手机国补立减499；
        刚说完周末出去整点啥马上刷到“专享特惠”XXX欢乐聚会X人餐……
      </n-li>
      <n-li>
        如果你想聊点什么不太能见光（我说的一定是密码）的东西，哈基密语一定是当之无愧的完美工具~
      </n-li>
    </n-ul>
    <n-h3 prefix="bar">
      没有这么高的加密需求？
    </n-h3>
    <n-ul>
      <n-li>
        如果你没有这么高的加密需求，可以继续使用1.0版本，哈吉米语翻译器，
        它是基于自定义（加盐）的Base64编码，开箱即用，
        <link-button href="/hajimi/base64">
          点击前往
        </link-button>
        ，不需要繁琐的先添加好友才能开始聊天
        （添加好友本质上就是安全地交换密钥，在哈吉米1.0版本的“哈吉米方言”
        也可以理解为密钥，但是你需要明文发给对方，如果中间人想看你们聊什么又恰好知道哈吉米翻译这个工具，那就寄）
      </n-li>
    </n-ul>
  </n-card>
</template>

<script setup lang="ts">
import {
  NCard,
  NH3,
  NLi,
  NUl,
} from 'naive-ui'
import HighLightText from '@/components/common/HighLightText.vue'
import LinkButton from '@/components/common/LinkButton.vue'

withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})
</script>

<style scoped lang="less">

</style>
