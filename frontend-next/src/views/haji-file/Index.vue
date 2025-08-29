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
  <div>
    <div v-for="(item, key) in fileMap" :key="key" style="display: flex; gap: 20px">
      <div>{{ item[1].id }}</div>
      <div>{{ item[1].progress }}</div>
      <div>{{ item[1].status }}</div>
      <div style="color: #7a7a7a">
        {{ item[1].inputFileName }} --> {{ item[1].outPutFileName }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import type { FileProcessInfo } from '@/utils/file/jimi-file-processor.ts'
import { ref } from 'vue'
import JimiFileProcessor from '@/utils/file/jimi-file-processor.ts'

let filePrimaryId: number = 1
const fileMap = ref(new Map<number, FileProcessInfo>())
const jimiFileProcessor = new JimiFileProcessor()
jimiFileProcessor.setTargetPoolSize(4)
jimiFileProcessor.subscribeProcessInfo((info: FileProcessInfo) => {
  fileMap.value.set(info.id, info)
  fileMap.value = new Map(fileMap.value)
})

async function handleUpload(options: UploadCustomRequestOptions) {
  const sharedKey = new Uint8Array(32)
  // sharedKey.set([1])
  console.log('密钥：', sharedKey)
  if (options.file.file) {
    await jimiFileProcessor.submit(filePrimaryId++, options.file.file, sharedKey)
  }
}
</script>

<style scoped lang="less">

</style>
