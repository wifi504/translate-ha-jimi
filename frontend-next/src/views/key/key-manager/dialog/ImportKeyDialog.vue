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
import { useMessage } from 'naive-ui'
import { h, ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

const showModal = ref(false)
const isLoading = ref<boolean>(false)
const contactStore = useContactStore()
const message = useMessage()
const transferData = ref<string[]>([])
const options = ref<{ label: string, value: string, key: string }[]>([])

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
    const json = JSON.parse(text)
    if (!verifyHaJimiKey(json)) return
    message.success(`成功解析 ${json.length} 条哈基密钥！`)
    options.value = json.map((item: any) => ({
      label: item.name,
      value: item.name,
      key: item.key,
    }))

    isLoading.value = false
  }
  input.click()
}

// 验证密钥文件
function verifyHaJimiKey(json: any): boolean {
  // TODO 验证密钥文件...
  return true
}

function handleImport() {
  if (transferData.value.length === 0) {
    message.error('请选择要导入的密钥！')
    return
  }
  // TODO 导入密钥的逻辑...

  message.success(`成功导入了 ${0} 条哈基密钥！`)
  hide()
}

function show() {
  options.value = []
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
