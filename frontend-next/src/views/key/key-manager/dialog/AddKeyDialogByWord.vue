<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 400px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          使用密钥口令生成哈基密钥
        </n-h3>
      </template>

      <n-steps vertical>
        <n-step title="输入你的密钥口令">
          <n-flex :size="4">
            随意长度，随意字符，也可以
            <n-button
              type="primary"
              size="tiny"
              ghost
              style="margin-bottom: 10px;"
              @click="handleRandomWord"
            >
              <template #icon>
                <n-icon>
                  <vi-antd-thunderbolt-outlined />
                </n-icon>
              </template>
              随机来一个
            </n-button>
          </n-flex>
          <n-input v-model:value="word" placeholder="最好没那么容易猜出来" />
        </n-step>
        <n-step title="设置密钥名称">
          <n-input
            v-model:value="name"
            :maxlength="8"
            show-count
            placeholder="名称用来让你方便区分，不能超过8字"
          />
        </n-step>
      </n-steps>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" :disabled="!canSubmit" @click="handleSubmit">
            加入密钥库
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { sha256 } from '@hayalib/hajihash'
import { NButton, NInput, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import { writeClipboard } from '@/utils/clipboard.ts'

const contactStore = useContactStore()
const message = useMessage()
const showModal = ref(false)
const word = ref<string>('')
const name = ref<string>('')

const canSubmit = computed(() => {
  return word.value && word.value.trim().length > 0 && name.value && name.value.trim().length > 0
})

function handleSubmit() {
  if (contactStore.contactList.includes(name.value)) {
    message.warning('此名称已存在，请重试...')
    return
  }
  contactStore.setSecretKey(name.value.trim(), sha256(word.value.trim()))
  hide()
}

// 安全地随机生成字符串，避免易混淆字符：0 O o 1 l I 2 Z 5 S 8 B
function randomCode(length: number = 4): string {
  const chars = 'ACDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrstuvwxyz34679'
  let result = ''

  const randomValues = new Uint8Array(length)
  crypto.getRandomValues(randomValues)

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length]
  }

  return result
}

function handleRandomWord() {
  word.value = randomCode()
  writeClipboard(word.value).then(() => message.success('密钥口令已复制到剪贴板！'))
}

function show() {
  word.value = ''
  name.value = ''
  showModal.value = true
}

function hide() {
  showModal.value = false
}

defineExpose({
  show,
  hide,
})
</script>
