/**
 * 哈基密语文本转换服务
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
const BASE_WORDS = '一十人入八儿九刀力又小了厂卜几丁七乃万才寸下上口土士大女子也己已巳干工弋三于亏丈夫天无元云专扎艺木五支厅不太犬区历尤友匹车巨牙屯比互切瓦止少日中冈贝内水见午牛手毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿欠风丹匀乌凤勾文六方火为斗忆订计户认心尺引丑巴孔队办以允予劝双你我他这里外前后东来去有是非对错好坏高矮胖瘦短远近快慢早晚明昨年时地图和同跟与或及在再就还更最很极常都全总只单独特每各别另其怎因果间旁边关张合收存放给拿送接交换买卖钱财物品用具衣服帽鞋袜裤衫裙被枕床椅桌凳柜箱门窗墙房屋家园校场道街巷桥'

export class HaJimiEncodeService {
  static dictionary: string[] = BASE_WORDS.split('')

  static charToIndexMap: Map<string, number> = new Map(
    HaJimiEncodeService.dictionary.map((ch, i) => [ch, i]),
  )

  /**
   * Uint8Array 编码成“哈基密语”字符串
   */
  static encode(bytes: Uint8Array): string {
    let result = ''
    for (const b of bytes) {
      result += HaJimiEncodeService.dictionary[b]
    }
    return result
  }

  /**
   * “哈基密语”字符串解码成 Uint8Array
   */
  static decode(text: string): Uint8Array {
    const arr = []
    for (const ch of text) {
      const index = HaJimiEncodeService.charToIndexMap.get(ch)
      if (index === undefined) {
        throw new Error(`未知字符: ${ch}`)
      }
      arr.push(index)
    }
    return new Uint8Array(arr)
  }
}
