<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 600px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          导入哈基密钥
        </n-h3>
      </template>
      <n-spin :show="isLoading" style="--n-opacity-spinning: 0;">
        <n-transfer
          v-model:value="transferData"
          :options="options"
          :render-target-label="renderTargetLabel"
        />
        <template #description>
          <div style="min-width: 200px;">
            <b>请选择哈基密钥 JSON 文件</b>
            <br>
            没有打开选择文件窗口？
            <br>
            <n-button type="primary" size="tiny" @click="handleSelectFile">
              尝试重新选择
            </n-button>
            <br>
            <span style="color: var(--text-color-light);">
              如果仍然看不到文件选择窗口，<br>请尝试更换浏览器，如 Chrome
            </span>
          </div>
        </template>
      </n-spin>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" @click="handleImport">
            立即导入
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import type { TransferRenderTargetLabel } from 'naive-ui'
import type { TransferKey } from '@/views/key/key-manager/dialog/TransferKeysType.ts'
import { decode } from '@hayalib/encoder'
import { hexToUint8Array } from '@hayalib/utils'
import { useMessage } from 'naive-ui'
import { h, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

interface HaJimiKeyOption {
  label: string
  value: string
  key: Uint8Array
}

const showModal = ref(false)
const isLoading = ref<boolean>(false)
const contactStore = useContactStore()
const message = useMessage()
const transferData = ref<string[]>([])
const options = ref<HaJimiKeyOption[]>([])

const renderTargetLabel: TransferRenderTargetLabel = ({ option }) => {
  const hasKey = contactStore.contactList.includes(option.label)
  if (hasKey) {
    return h(
      'span',
      {
        style: {
          color: 'var(--error-color)',
        },
      },
      {
        default: () => `${option.label} (覆盖)`,
      },
    )
  }
  else {
    return h(
      'span',
      {
        style: {
          color: 'var(--success-color)',
        },
      },
      {
        default: () => `${option.label} (新增)`,
      },
    )
  }
}

// 选择文件
function handleSelectFile() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async (e) => {
    const file = (e.target as HTMLInputElement)?.files?.[0]
    if (!file) return
    const text = await file.text()
    const haJimiKeys = parseHaJimiKeys(text)
    if (haJimiKeys.length <= 0) {
      message.error('解析哈基密钥文件失败！')
      return
    }
    message.success(`成功解析 ${haJimiKeys.length} 条哈基密钥！`)
    options.value = haJimiKeys
    isLoading.value = false
  }
  input.click()
}

// 解析密钥文件
function parseHaJimiKeys(text: string): HaJimiKeyOption[] {
  try {
    const errorMsg = '不是合法的哈基密文格式'
    const res: HaJimiKeyOption[] = []
    // 转换成对象
    const jsonObj = JSON.parse(text)
    // 必须是数组
    if (!Array.isArray(jsonObj)) {
      message.error(errorMsg)
      throw new TypeError(errorMsg)
    }
    // 判断每一项是否是 TransferKey，追加
    jsonObj.forEach((item: any) => {
      const { name, key } = item
      if (name && typeof name === 'string' && key && typeof key === 'string') {
        const transferKey: TransferKey = { name, key }
        // 判断此密钥是否重复
        if (res.find(item => item.label === transferKey.name)) {
          return
        }
        let uint8ArrayKey: Uint8Array
        // 判断密钥是否合法，并解析回 Uint8Array
        try {
          if (transferKey.key.startsWith('哈基密钥')) {
            uint8ArrayKey = decode(transferKey.key)
          }
          else {
            uint8ArrayKey = hexToUint8Array(transferKey.key)
          }
        }
        catch {
          return
        }
        if (uint8ArrayKey.length !== 32) return
        // 结果集中追加
        res.push({
          label: transferKey.name,
          value: transferKey.name,
          key: uint8ArrayKey,
        })
      }
    })
    return res
  }
  catch {
    return []
  }
}

function handleImport() {
  if (transferData.value.length === 0) {
    message.error('请选择要导入的密钥！')
    return
  }
  hide()
  // 延迟执行，避免关闭对话框的动画受性能影响
  setTimeout(() => {
    const keys: Record<string, Uint8Array> = {}
    options.value.forEach((item) => {
      keys[item.label] = item.key
    })
    transferData.value.forEach((item) => {
      contactStore.setSecretKey(item, keys[item])
    })
    message.success(`成功导入了 ${transferData.value.length} 条哈基密钥！`)
  }, 500)
}

function show() {
  options.value = []
  transferData.value = []
  isLoading.value = true
  showModal.value = true
  handleSelectFile()
}

function hide() {
  showModal.value = false
}

defineExpose({
  show,
  hide,
})
</script>
