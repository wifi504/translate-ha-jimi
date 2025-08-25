<template>
  <n-upload
    ref="uploadRef"
    v-model:file-list="fileList"
    :custom-request="handleUpload"
    :custom-download="handleDownload"
    show-download-button
    multiple
  >
    <n-upload-dragger>
      上传
    </n-upload-dragger>
  </n-upload>
  <h3>线程池的工作线程数：{{ poolSize }}</h3>
  <h3>线程池阻塞的任务数量：{{ taskQueueSize }}</h3>
  <hr>
  <n-button @click="handleShutdown">
    关闭线程池
  </n-button>
  <n-button @click="handleRestart">
    重启线程池
  </n-button>
  <n-button @click="handleSetThreadNum(Number.parseInt(targetThreadNum))">
    设置线程池线程数
  </n-button>
  <n-input v-model:value="targetThreadNum" placeholder="输入目标活动线程数量" />
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions, UploadFileInfo } from 'naive-ui'
import { ref } from 'vue'
import { getFileExtension, processFile } from '@/utils/file/file-utils.ts'

import { newFileWorker } from '@/utils/file/file-worker-builder.ts'
import ThreadPool from '@/utils/thread-pool'

const uploadRef = ref()
const fileList = ref<UploadFileInfo[]>([])

const poolSize = ref()
const taskQueueSize = ref()
const targetThreadNum = ref()
const pool = new ThreadPool(newFileWorker, [
  {
    type: 'on-progress',
    processor(data: any) {
      console.log('线程池的onProgress', data)
      fileList.value.forEach((file) => {
        if (file.id === data.id) {
          const percentage = Number.parseFloat(data.percent)
          if (percentage > 0 && percentage < 100) {
            file.status = 'uploading'
          }
          file.percentage = percentage
        }
      })
    },
  },
], 1, false)
pool.subscribePoolSize((size: number) => poolSize.value = size)
pool.subscribeTaskQueueSize((size: number) => taskQueueSize.value = size)

async function handleUpload(options: UploadCustomRequestOptions) {
  if (options.file.file) {
    processFile(options.file.id, options.file.file, pool, new Uint8Array(32)).then((newFileName: string) => {
      fileList.value.forEach((file) => {
        if (file.id === options.file.id) {
          file.name = `${file.name} 已经成功${getFileExtension(newFileName) === 'hjm' ? '加密成' : '解密回'} ${newFileName}`
          file.status = 'finished'
        }
      })
    })
  }
}

function handleShutdown() {
  pool.shutdown()
}

function handleRestart() {
  pool.restart()
}

function handleSetThreadNum(num: number) {
  pool.targetPoolSize = num
}

function handleDownload(file: UploadFileInfo) {
  console.log('下载', file)
}
</script>

<style scoped lang="less">

</style>
