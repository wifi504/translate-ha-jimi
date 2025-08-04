<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 400px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          清空哈基友密钥
        </n-h3>
      </template>
      你真的确认要清空本地浏览器缓存吗？此操作
      <high-light-text>
        不可恢复
      </high-light-text>
      ，接下来你需要重设密码和重新添加联系人！
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" @click="handleSubmit">
            确认
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import {
  NButton,
  NCard,
  NFlex,
  NH3,
  NModal,
} from 'naive-ui'
import { ref } from 'vue'
import HighLightText from '@/components/common/HighLightText.vue'
import { useContactStore } from '@/stores/contactStore.ts'

const showModal = ref(false)
const contactStore = useContactStore()

function handleSubmit() {
  contactStore.clear()
  hide()
}

function show() {
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

<style scoped lang="less">

</style>
