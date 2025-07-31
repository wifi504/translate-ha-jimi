<template>
  <component :is="currentComponent" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import PC from '@/components/view/PC.vue'
import Phone from '@/components/view/Phone.vue'
import { TextCompressService } from '@/service/TextCompressService.ts'
import { HaJimiEncodeUtil } from '@/utils/HaJimiEncodeUtil.ts'
import { autoUpdate, getHaJimiTitle } from '@/utils/randomTitle.ts'
import { SecureChatService } from './service/SecureChatService'

const currentComponent = shallowRef()

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
  const title = getHaJimiTitle()
  autoUpdate(title, () => {
    document.title = `${title.value}语翻译`
  })
  test()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

async function test() {
  const boy = new SecureChatService()
  await boy.init()
  console.log('初始化Boy', boy)
  const girl = new SecureChatService()
  await girl.init()
  console.log('初始化Girl', girl)

  const boyIdentity = boy.exportPublicIdentity()
  console.log('Boy生成签名公钥', boyIdentity)
  console.log('Girl拿到Boy的公钥，先验证：', SecureChatService.verifyDHSignature(
    boyIdentity.dhPublicKey,
    boyIdentity.dhSignature,
    boyIdentity.ed25519PublicKey,
  ))
  console.log('Girl确认了Boy的公钥没被篡改，得到了', SecureChatService.uint8ArrayToHex(boyIdentity.dhPublicKey))
  const girlIdentity = girl.exportPublicIdentity()
  console.log('Girl生成签名公钥', girlIdentity)
  console.log('Boy拿到Girl的公钥，先验证：', SecureChatService.verifyDHSignature(
    girlIdentity.dhPublicKey,
    girlIdentity.dhSignature,
    girlIdentity.ed25519PublicKey,
  ))
  console.log('Boy确认了Girl的公钥没被篡改，得到了', SecureChatService.uint8ArrayToHex(girlIdentity.dhPublicKey))

  console.warn('此时，Boy和Girl已经公开交换完DH公钥，且经过验证，不会被篡改')

  console.log('Boy计算DH私钥', boy.computeSharedKey(girlIdentity.dhPublicKey))
  console.log('Girl计算DH私钥', girl.computeSharedKey(boyIdentity.dhPublicKey))

  const boyEncrypt = boy.encryptAEAD('Hello World')
  console.log('B加密"Hello World"', boyEncrypt)
  // console.log('A解密', girl.decryptRawFixedNonce(boyEncrypt.ciphertext, boyEncrypt.nonce))
  console.log('A解密', girl.decryptAEAD(boyEncrypt.ciphertext, boyEncrypt.nonce))

  console.warn('文本压缩服务测试')

  const str = '哈基米窝那没撸多阿西噶压库路曼波哦吗吉利咋酷友达喔哪买奈诺娜美嘎呀菇啊自一漫步耶哒我找咕马子砸不南北绿豆椰奶龙瓦塔尼莫欧季里得喵'
  // const str = 'Hello World'
  const compressed = TextCompressService.a(str)
  console.log(`压缩："${str}"；结果为：`, compressed)
  console.log('原文To哈基密语', HaJimiEncodeUtil.encode(new TextEncoder().encode(str)))
  console.log('压缩结果To哈基密语', HaJimiEncodeUtil.encode(compressed))

  console.warn('凑哈基密语Words')
  const haJimiWords = '一十人入八儿九刀力又小了厂卜几丁七乃万才寸下上口土士大女子也己已巳干工弋三于亏丈夫天无元云专扎艺木五支厅不太犬区历尤友匹车巨牙屯比互切瓦止少日中冈贝内水见午牛手毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿欠风丹匀乌凤勾文六方火为斗忆订计户认心尺引丑巴孔队办以允予劝双你我他这里外前后东来去有是非对错好坏高矮胖瘦短远近快慢早晚明昨年时地图和同跟与或及在再就还更最很极常都全总只单独特每各别另其怎因果间旁边关张合收存放给拿送接交换买卖钱财物品用具衣服帽鞋袜裤衫裙被枕床椅桌凳柜箱门窗墙房屋家园校场道街巷桥河湖海江山石草花叶实种粮面油盐酱醋茶糖肉蛋鱼菜瓜电雷雨雪光白红冷热温凉湿软硬轻重厚薄宽窄深浅春夏秋星朋邻爸妈爷孙兄弟姐妹姑姨舅叔妻学事民众个位条块粒角两次回件样些点半吃喝拉撒睡起坐站走跑跳爬躺靠抓握扔丢捡拾推搬举抬背抱摸按拍打敲击砸撕扯挖割剪缝补织洗擦扫拖涂画读写看听说讲谈论问答叫喊哭笑唱舞玩乐喜怒哀爱恨想念思虑忘记识知懂会教做搞成完毕停开发取寄传递'
  console.log('长度', haJimiWords.length)
  const seen = new Set<string>()
  let result = ''
  for (const ch of haJimiWords) {
    if (!seen.has(ch)) {
      seen.add(ch)
      result += ch
    }
  }
  result = removeCharsFromString(result, '哈基米|那没撸多|阿西噶压|库路曼波|哦吗吉利|南北绿豆|椰奶龙')
  console.log('去重后', result.length)
  console.log(result)
  console.log('取前256')
  console.log(result.substring(0, 256))
  console.warn('装饰成哈基米语')
  const s = HaJimiEncodeUtil.decorateHaJimiKey('这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本')
  console.log(s)
  console.log(HaJimiEncodeUtil.stripHaJimi(s))
}

function removeCharsFromString(remove: string, from: string): string {
  const setB = new Set(from)
  let result = ''
  for (const ch of remove) {
    if (!setB.has(ch)) {
      result += ch
    }
  }
  return result
}
</script>
