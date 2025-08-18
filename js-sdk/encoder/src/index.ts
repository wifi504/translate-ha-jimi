/**
 * 哈基编解码器
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/8/18_21:25
 */

const BASE_WORDS = '一十人入八儿九刀力又小了厂卜几丁七乃万才寸下上口土士大女子也己已巳干工弋三于亏丈夫天无元云专扎艺木五支厅不太犬区历尤友匹车巨牙屯比互切瓦止少日中冈贝内水见午牛手毛气升长仁什片仆化仇币仍仅斤爪反介父从今凶分乏公仓月氏勿欠风丹匀乌凤勾文六方火为斗忆订计户认心尺引丑巴孔队办以允予劝双你我他这里外前后东来去有是非对错好坏高矮胖瘦短远近快慢早晚明昨年时地图和同跟与或及在再就还更最很极常都全总只单独特每各别另其怎因果间旁边关张合收存放给拿送接交换买卖钱财物品用具衣服帽鞋袜裤衫裙被枕床椅桌凳柜箱门窗墙房屋家园校场道街巷桥'
const DECORATION_WORDS = '哈基米|那没撸多|阿西噶压|库路曼波|哦吗吉利|南北绿豆|椰奶龙'

// 编码对照字典
let encodeDictionary: string[] = BASE_WORDS.split('')
// 解码对照字典
let decodeDictionary: Map<string, number> = new Map(
  encodeDictionary.map((ch, i) => [ch, i]),
)
// 哈基米装饰符
let decoration: string[] = DECORATION_WORDS.split('|')

/**
 * 判断 str 中是否存在 target 中的字符
 * @param str 要判断的字符串
 * @param target 目标字符串
 */
function hasCommonChar(str: string, target: string): string | null {
  const targetSet = new Set(target)
  for (const char of str) {
    if (targetSet.has(char)) return char
  }
  return null
}

/**
 * 从 str 中过滤出所有的 target 字符
 *
 * @param str 要过滤的字符串
 * @param target 目标字符串
 */
function filterCommonChar(str: string, target: string): string {
  const targetSet = new Set(target)
  const arr = str.split('')
  return arr.filter(char => targetSet.has(char)).join('')
}

/**
 * 把“哈基密文”装饰一下
 *
 * @param text 被装饰的文本
 */
function decorateHaJimi(text: string): string {
  const chars = text.split('')
  const insertions: { pos: number, fragment: string }[] = []
  // 插入开头
  insertions.push({
    pos: 0,
    fragment: decoration[Math.floor(Math.random() * decoration.length)],
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
      fragment: decoration[Math.floor(Math.random() * decoration.length)],
    })
  }
  // 插入结尾
  insertions.push({
    pos: chars.length,
    fragment: decoration[Math.floor(Math.random() * decoration.length)],
  })
  // 从后往前插，避免位置错乱
  insertions.sort((a, b) => b.pos - a.pos)
  for (const { pos, fragment } of insertions) {
    chars.splice(pos, 0, fragment)
  }
  return chars.join('')
}

/**
 * 自定义对照字典
 *
 * @param dictionary 一串不重复的字符串，长度必须为256位
 */
export function customDictionary(dictionary: string): void {
  if (!dictionary || dictionary.length !== 256) {
    throw new Error('字典长度必须为256位！')
  }
  if (new Set(dictionary).size !== 256) {
    throw new Error('字典不能有重复字符！')
  }
  if (hasCommonChar(dictionary, DECORATION_WORDS)) {
    throw new Error('字典不能存在哈基米装饰符出现过的字符！')
  }
  encodeDictionary = dictionary.split('')
  decodeDictionary = new Map(
    encodeDictionary.map((ch, i) => [ch, i]),
  )
}

/**
 * 自定义哈基米装饰符
 * @param newDecoration
 */
export function customDecoration(newDecoration: string): void {
  if (hasCommonChar(newDecoration, encodeDictionary.join(''))) {
    throw new Error('装饰符不能存在对照字典中出现过的字符！')
  }
  decoration = newDecoration.split('|')
}

/**
 * 将原始数据编码成“哈基密文”字符串
 *
 * @param bytes Uint8Array 数据
 * @param prefix 可选的结果前缀
 */
export function encode(bytes: Uint8Array, prefix?: string): string {
  // 1. 整合前缀
  let pf = ''
  if (prefix) {
    const char = hasCommonChar(prefix, encodeDictionary.join(''))
    if (char) {
      throw new Error(`前缀字符"${char}"不能在字典中存在！`)
    }
    pf = prefix
  }
  // 2. 编码
  let result = ''
  for (const b of bytes) {
    result += encodeDictionary[b]
  }
  // 3. 装饰
  result = decorateHaJimi(result)
  // 4. 拼接前缀
  return pf + result
}

/**
 * 将“哈基密文”字符串解码成原始数据
 *
 * @param text 哈基密文
 */
export function decode(text: string): Uint8Array {
  // 1. 摘掉装饰
  const rawText = filterCommonChar(text, encodeDictionary.join(''))
  // 2. 解码
  const arr: number[] = []
  for (const char of rawText) {
    const index = decodeDictionary.get(char)
    if (index === undefined) {
      throw new Error(`无法解码字符"${char}"，请确保配置了正确的编解码对照字典！`)
    }
    arr.push(index)
  }
  return new Uint8Array(arr)
}
