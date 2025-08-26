<template>
  <n-upload
    :custom-request="handleUpload"
    file-list-style="display: none;"
    multiple
  >
    <n-upload-dragger>
      上传
    </n-upload-dragger>
  </n-upload>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import JimiFileProcessor from '@/utils/file/jimi-file-processor.ts'

const jimiFileProcessor = new JimiFileProcessor()
jimiFileProcessor.subscribeProcessInfo(info => console.log(info))

async function handleUpload(options: UploadCustomRequestOptions) {
  const sharedKey = new Uint8Array(32)
  // sharedKey.set([1])
  console.log('密钥：', sharedKey)
  if (options.file.file) {
    jimiFileProcessor.submit(1, options.file.file, sharedKey)
  }
}
</script>

<style scoped lang="less">

</style>
