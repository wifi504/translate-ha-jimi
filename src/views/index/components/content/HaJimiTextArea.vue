<template>
  <n-flex :wrap="false">
    <n-card title="自动检测" hoverable>
      <template #header-extra>
        <n-button-group size="small">
          <n-button ghost type="primary">
            <template #icon>
              <n-icon>
                <clipboard-paste16-filled />
              </n-icon>
            </template>
            粘贴
          </n-button>
          <n-button ghost type="primary">
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
        :autosize="{
          minRows: 13,
          maxRows: 13,
        }"
        placeholder="请输入任意内容..."
        :disabled="!contactStore.hasAuth"
      />
    </n-card>
    <n-card title="动态标题" hoverable>
      <template #header-extra>
        <n-button ghost type="primary" size="small">
          <template #icon>
            <n-icon>
              <document-copy16-regular />
            </n-icon>
          </template>
          复制
        </n-button>
      </template>
      <n-input
        v-model:value="outputText"
        type="textarea"
        :autosize="{
          minRows: 13,
          maxRows: 13,
        }"
        size="large"
        placeholder="哦马吉里，曼波~"
        :disabled="!contactStore.hasAuth"
        readonly
      />
    </n-card>
  </n-flex>
</template>

<script setup lang="ts">
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
} from 'naive-ui'
import { ref, watch } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import { debounce } from '@/utils/debounce.ts'

const contactStore = useContactStore()

const inputText = ref<string>('')
const outputText = ref<string>('')

function updateText() {
  outputText.value = inputText.value
}

const debounceUpdateText = debounce(updateText, 100)

watch(() => inputText.value, () => {
  debounceUpdateText()
})

watch(() => contactStore.currentContact, () => {
  debounceUpdateText()
})
</script>

<style scoped lang="less">

</style>
