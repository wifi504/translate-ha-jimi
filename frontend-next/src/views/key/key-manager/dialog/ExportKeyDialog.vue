<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 600px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          导出哈基密钥
        </n-h3>
      </template>
      <n-spin :show="isLoading">
        <n-transfer v-model:value="transferData" :options="options" />
      </n-spin>
      <div style="height: 12px;" />
      <n-checkbox v-model:checked="doesUseHaJimi">
        使用哈基密文导出
      </n-checkbox>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" @click="handleExport">
            立即导出
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import type { TransferKeys } from '@/views/key/key-manager/dialog/transfer-keys-type.ts'
import { encode } from '@hayalib/encoder'
import { uint8ArrayToHex } from '@hayalib/utils'
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import { downloadJsonFile, getRandomSuffix } from '@/utils/file/file-utils.ts'

const showModal = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const doesUseHaJimi = ref<boolean>(true)
const contactStore = useContactStore()
const message = useMessage()
const transferData = ref<string[]>([])
const options = ref<{ label: string, value: string }[]>([])

let selectTimer: ReturnType<typeof setTimeout>

function selectAllKeysName() {
  // 这一步可能造成卡顿，等对话框打开后再执行加载
  selectTimer = setTimeout(() => {
    options.value = contactStore.contactList.map(name => ({
      label: name,
      value: name,
    }))
    isLoading.value = false
    selectTimer = null
  }, 500)
}

function handleExport() {
  if (transferData.value.length === 0) {
    message.error('请选择要导出的密钥！')
    return
  }

  const keys: TransferKeys = []
  transferData.value.forEach((name) => {
    const key = contactStore.getSecretKey(name)
    if (typeof key !== 'string') {
      if (doesUseHaJimi.value) {
        keys.push({
          name,
          key: encode(key, '哈基密钥'),
        })
      }
      else {
        keys.push({
          name,
          key: uint8ArrayToHex(key),
        })
      }
    }
  })
  downloadJsonFile(keys, `哈基密钥_${getRandomSuffix()}.json`, true)
  message.success(`成功导出 ${keys.length} 条哈基密钥！`)
  hide()
}

function show() {
  options.value = []
  isLoading.value = true
  showModal.value = true
  selectAllKeysName()
}

function hide() {
  clearTimeout(selectTimer)
  showModal.value = false
}

defineExpose({
  show,
  hide,
})
</script>
