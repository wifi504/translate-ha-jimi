<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 400px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          基于端到端加密生成哈基密钥
        </n-h3>
      </template>
      <n-steps vertical>
        <n-step title="你签名一个哈基密钥给对方">
          <n-tabs animated>
            <n-tab-pane name="qrcode" tab="通过扫描二维码">
              <!-- TODO -->
            </n-tab-pane>
            <n-tab-pane name="link" tab="通过分享链接">
              <!-- TODO -->
            </n-tab-pane>
          </n-tabs>
        </n-step>
      </n-steps>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" @click="handleSubmit">
            加入密钥库
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)

function handleSubmit() {
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
