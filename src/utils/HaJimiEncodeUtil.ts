/**
 * 哈基密语文本转换工具类
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
const BASE_WORDS = '一十人入八儿九刀力又小了厂卜几丁七乃万才寸下上口土士大女子也己已巳干工弋三于亏丈夫天无元云专扎艺木五支厅不太犬区历尤友匹车巨牙屯比互切瓦止少日中冈贝内水见午牛手毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿欠风丹匀乌凤勾文六方火为斗忆订计户认心尺引丑巴孔队办以允予劝双你我他这里外前后东来去有是非对错好坏高矮胖瘦短远近快慢早晚明昨年时地图和同跟与或及在再就还更最很极常都全总只单独特每各别另其怎因果间旁边关张合收存放给拿送接交换买卖钱财物品用具衣服帽鞋袜裤衫裙被枕床椅桌凳柜箱门窗墙房屋家园校场道街巷桥'
const DECORATION_WORDS = '哈基米|那没撸多|阿西噶压|库路曼波|哦吗吉利|南北绿豆|椰奶龙'

export class HaJimiEncodeUtil {
  static dictionary: string[] = BASE_WORDS.split('')
  static decoration: string[] = DECORATION_WORDS.split('|')

  static charToIndexMap: Map<string, number> = new Map(
    this.dictionary.map((ch, i) => [ch, i]),
  )

  /**
   * Uint8Array 编码成“哈基密语”字符串
   */
  static encode(bytes: Uint8Array): string {
    let result = ''
    for (const b of bytes) {
      result += this.dictionary[b]
    }
    return result
  }

  /**
   * “哈基密语”字符串解码成 Uint8Array
   */
  static decode(text: string): Uint8Array {
    const arr = []
    for (const ch of text) {
      const index = this.charToIndexMap.get(ch)
      if (index === undefined) {
        throw new Error(`未知字符: ${ch}`)
      }
      arr.push(index)
    }
    return new Uint8Array(arr)
  }

  /**
   * 把“哈基密语”装饰一下
   */
  static decorateHaJimi(text: string): string {
    const chars = text.split('')
    const insertions: { pos: number, fragment: string }[] = []
    // 插入开头
    insertions.push({
      pos: 0,
      fragment: this.decoration[Math.floor(Math.random() * this.decoration.length)],
    })
    // 中间插入，按间隔 5~15 插入
    let i = 0
    while (i + 5 < chars.length) {
      const step = Math.floor(Math.random() * 11) + 5 // [5, 15]
      i += step
      if (i >= chars.length - 5)
        break // 剩下不足5个就不插
      insertions.push({
        pos: i,
        fragment: this.decoration[Math.floor(Math.random() * this.decoration.length)],
      })
    }
    // 插入结尾
    insertions.push({
      pos: chars.length,
      fragment: this.decoration[Math.floor(Math.random() * this.decoration.length)],
    })
    // 从后往前插，避免位置错乱
    insertions.sort((a, b) => b.pos - a.pos)
    for (const { pos, fragment } of insertions) {
      chars.splice(pos, 0, fragment)
    }
    return chars.join('')
  }

  /**
   * 装饰：哈基密钥
   */
  static decorateHaJimiKey(text: string): string {
    return `哈基密钥${this.decorateHaJimi(text)}`
  }

  /**
   * 装饰：哈基密语
   */
  static decorateHaJimiText(text: string): string {
    return `哈基密语${this.decorateHaJimi(text)}`
  }

  /**
   * 装饰：哈基密密语
   */
  static decorateHaJimiTextCompress(text: string): string {
    return `哈基密密语${this.decorateHaJimi(text)}`
  }

  /**
   * 把装饰过的“哈基密语”给还原
   */
  static stripHaJimi(text: string): string {
    const set = new Set(`哈基密钥语${this.decoration.join('')}`)
    let result = ''
    for (const ch of text) {
      if (!set.has(ch)) {
        result += ch
      }
    }
    return result
  }
}
