import { SecureChatService } from '@/service/SecureChatService.ts'
import { TextCompressService } from '@/service/TextCompressService.ts'
import { HaJimiEncodeUtil } from '@/utils/HaJimiEncodeUtil.ts'

export default async function test() {
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

  console.warn('装饰成哈基米语')
  const s = HaJimiEncodeUtil.decorateHaJimiKey('这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本这是一段文本')
  console.log(s)
  console.log(HaJimiEncodeUtil.stripHaJimi(s))
}
