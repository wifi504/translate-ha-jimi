<template>
  <div>
    导航栏
    <n-upload
      ref="uploadRef"
      :max="1"
      :custom-request="handleUpload"
      file-list-style="display: none;"
    >
      <n-upload-dragger>
        上传
        <n-progress :percentage="progress" />
      </n-upload-dragger>
    </n-upload>
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import { files } from 'hayalib'
import { ref } from 'vue'

const uploadRef = ref()
const progress = ref<number>(0)

async function handleUpload(options: UploadCustomRequestOptions) {
  if (options.file.file) {
    await files.handleFileUpload(options.file.file, new Uint8Array(32), p => progress.value = p)
    uploadRef.value.clear()
  }
}
</script>

<style scoped lang="less">

</style>
