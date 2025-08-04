<template>
  <n-flex
    :wrap="false"
    :vertical="mode === 'phone'"
    :size="mode === 'phone' ? 0 : 10"
    class="wrapper"
  >
    <n-card :title="inputTitle" hoverable :size="mode === 'phone' ? 'small' : 'medium'">
      <template #header-extra>
        <n-button-group size="small">
          <n-button
            ghost
            type="primary"
            :disabled="!contactStore.hasAuth"
            @click="async () => inputText += await readClipboard()"
          >
            <template #icon>
              <n-icon>
                <clipboard-paste16-filled />
              </n-icon>
            </template>
            粘贴
          </n-button>
          <n-button
            ghost
            type="primary"
            :disabled="!contactStore.hasAuth"
            @click="() => inputText = ''"
          >
            <template #icon>
              <n-icon>
                <calendar-cancel20-regular />
              </n-icon>
            </template>
            清空
          </n-button>
        </n-button-group>
      </template>
      <n-input
        v-model:value="inputText"
        type="textarea"
        size="large"
        show-count
        :autosize="{
          minRows: textLineNumber,
          maxRows: textLineNumber,
        }"
        placeholder="请输入任意内容..."
        :disabled="!contactStore.hasAuth"
      />
    </n-card>
    <n-card :title="outputTitle" hoverable :size="mode === 'phone' ? 'small' : 'medium'">
      <template #header-extra>
        <n-button
          ghost
          type="primary"
          size="small"
          :disabled="!contactStore.hasAuth"
          @click="writeClipboard(outputText)"
        >
          <template #icon>
            <n-icon>
              <document-copy16-regular />
            </n-icon>
          </template>
          复制
        </n-button>
      </template>
      <div v-if="isCompressed" class="compress-info-text">
        <n-icon style="position: relative; top: 2px">
          <check-circle-twotone />
        </n-icon>
        <span v-if="compressRate">
          已自动启用文本压缩（{{ (compressRate * 100).toFixed(1) }}%）
        </span>
        <span v-else>
          已自动从压缩文本解压
        </span>
      </div>
      <n-input
        v-model:value="outputText"
        :style="mode === 'phone' ? 'margin-bottom: 14px' : ''"
        type="textarea"
        :autosize="{
          minRows: textLineNumber,
          maxRows: textLineNumber,
        }"
        show-count
        size="large"
        placeholder="哦马吉里，曼波~"
        :disabled="!contactStore.hasAuth"
        readonly
      />
    </n-card>
    <div
      v-if="!contactStore.hasAuth"
      class="overlay"
      @click="unAuthMessage"
    />
  </n-flex>
</template>

<script setup lang="ts">
import { CheckCircleTwotone } from '@vicons/antd'
import {
  CalendarCancel20Regular,
  ClipboardPaste16Filled,
  DocumentCopy16Regular,
} from '@vicons/fluent'
import {
  NButton,
  NButtonGroup,
  NCard,
  NFlex,
  NIcon,
  NInput,
  useMessage,
} from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { SecureChatService } from '@/service/SecureChatService.ts'
import { TextCompressService } from '@/service/TextCompressService.ts'
import { useContactStore } from '@/stores/contactStore.ts'
import { readClipboard, writeClipboard } from '@/utils/clipboard.ts'
import { debounce } from '@/utils/debounce.ts'
import { HaJimiEncodeUtil } from '@/utils/HaJimiEncodeUtil.ts'

const props = withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})

const emits = defineEmits<{
  (e: 'hasChangedCurrentContact'): void
}>()

const contactStore = useContactStore()
const message = useMessage()

const isCompressed = ref<boolean>(false)
const compressRate = ref<number | null>(0)
const textLineNumber = computed(() => props.mode === 'pc' ? 13 : 7)

const inputText = ref<string>('')
const outputText = ref<string>('')

const inputTitle = ref<string>('自动检测')
const outputTitle = ref<string>('输出结果')

function unAuthMessage() {
  if (contactStore.hasClear) {
    message.warning('需要先设置密码！')
    return
  }
  if (!contactStore.hasAuth) {
    message.warning('需要先解锁！')
  }
}

// 加密：原文str -> 压缩uint8 -> 盐uint8 + 密文uint8 -> 哈基字符串 -> 哈基密语
// 解密：哈基密语 -> 哈基字符串 -> 盐uint8 + 密文uint8 -> 解压uint8 -> 原文str
function updateText() {
  // 加密人儿语成哈基密语
  function encryptToHaJimi(compress: boolean): string {
    const privateKey = contactStore.getSecretKey(contactStore.currentContact)
    if (!(privateKey instanceof Uint8Array)) {
      return '私钥不存在，加密失败！'
    }
    let input: string | Uint8Array = inputText.value
    if (compress) {
      input = TextCompressService.a(input)
    }
    const encrypt = SecureChatService.encryptByKeyAEAD(input, privateKey)
    const nonce = HaJimiEncodeUtil.encode(encrypt.nonce) // 固定12位
    const ciphertext = HaJimiEncodeUtil.encode(encrypt.ciphertext)
    if (compress) {
      return HaJimiEncodeUtil.decorateHaJimiTextCompress(nonce + ciphertext)
    }
    return HaJimiEncodeUtil.decorateHaJimiText(nonce + ciphertext)
  }
  // 用密钥解密哈基密语成人儿语
  function decryptFromHaJimi(privateKey: Uint8Array | 'access_denied' | 'null_user', compress: boolean): string | '' {
    if (!(privateKey instanceof Uint8Array)) {
      return ''
    }
    const decrypt = HaJimiEncodeUtil.stripHaJimi(inputText.value)
    const nonce = decrypt.substring(0, 12)
    const ciphertext = decrypt.substring(12)
    try {
      if (compress) {
        return TextCompressService.x(SecureChatService.decryptByKeyAEAD(
          HaJimiEncodeUtil.decode(ciphertext),
          HaJimiEncodeUtil.decode(nonce),
          privateKey,
          true,
        ) as Uint8Array) as string
      }
      return SecureChatService.decryptByKeyAEAD(
        HaJimiEncodeUtil.decode(ciphertext),
        HaJimiEncodeUtil.decode(nonce),
        privateKey,
      ) as string
    }
    catch {
      return ''
    }
  }

  // 为空的情况，复位
  if (!inputText.value || inputText.value === '') {
    inputTitle.value = '自动检测'
    outputTitle.value = '输出结果'
    outputText.value = ''
    isCompressed.value = false
    compressRate.value = null
    return
  }
  // 不是哈基密语，直接加密
  if (!(inputText.value.startsWith('哈基密语') || inputText.value.startsWith('哈基密密语'))) {
    const compress = encryptToHaJimi(true)
    const normal = encryptToHaJimi(false)
    isCompressed.value = (normal.length > compress.length)
    compressRate.value = compress.length / normal.length
    outputText.value = isCompressed.value ? compress : normal
    inputTitle.value = '人儿语'
    outputTitle.value = `哈基密语（${contactStore.currentContact || '你还没有联系人'}）`
    return
  }
  // 是哈基密语，用当前密钥尝试解密
  // 先判断是压缩还是不压缩
  if (inputText.value.startsWith('哈基密语')) {
    isCompressed.value = false
  }
  if (inputText.value.startsWith('哈基密密语')) {
    isCompressed.value = true
  }
  compressRate.value = null
  let privateKey = contactStore.getSecretKey(contactStore.currentContact)
  let decryptText = decryptFromHaJimi(privateKey, isCompressed.value)
  if (privateKey instanceof Uint8Array && decryptText) {
    outputText.value = decryptText
    inputTitle.value = `哈基密语（${contactStore.currentContact}）`
    outputTitle.value = '人儿语'
    return
  }
  // 到这里说明当前联系人的密钥没对，准备把所有联系人拿出来遍历再尝试
  const list = contactStore.getContactList
  if (list === 'access_denied' || list.length === 0) {
    // 没有联系人，那寄了，引导用户添加
    outputText.value = '没有密钥无法解密，快去添加一个联系人！'
    inputTitle.value = '哈基密语（不知道这是谁说的）'
    outputTitle.value = '解密失败'
    return
  }
  for (const contact of list) {
    privateKey = contactStore.getSecretKey(contact)
    decryptText = decryptFromHaJimi(privateKey, isCompressed.value)
    if (privateKey instanceof Uint8Array && decryptText) {
      // 非常好，找到这个联系人了，切换，并且通知父组件可以滚动到那个人
      contactStore.currentContact = contact
      emits('hasChangedCurrentContact')
      message.success('已自动帮你切换联系人')
      return
    }
  }
  // 那我们雀食拿这个密文没办法了
  outputText.value = '哈基密语在传输途中遭受篡改导致的签名失效或者没有密钥、密钥错误等原因，解密失败了阿嘎西'
  inputTitle.value = '哈基密语（不知道这是谁说的）'
  outputTitle.value = '解密失败'
}

// 本来以为会很卡，但是事实上现代计算机的性能根部不需要给这玩意儿上防抖，1ms意思一下吧
const debounceUpdateText = debounce(updateText, 1)

watch(() => inputText.value, () => {
  debounceUpdateText()
})

watch(() => contactStore.currentContact, () => {
  debounceUpdateText()
})
</script>

<style scoped lang="less">
.compress-info-text {
  color: #18A058;
  position: absolute;
  z-index: 99;
  bottom: 0;
  right: 24px;
}

.wrapper {
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 99;
  cursor: not-allowed;
}
</style>
