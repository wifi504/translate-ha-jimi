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
import { ref } from 'vue'

import WorkerPool from '@/utils/worker/worker-pool.ts'
import WorkerThread from '@/utils/worker/worker-thread.ts'
import { newFileWorker } from '@/utils/worker/workers.ts'

const uploadRef = ref()
const progress = ref<number>(0)

async function handleUpload(options: UploadCustomRequestOptions) {
  if (options.file.file) {
    console.log('上传文件')
    const pool = new WorkerPool()
    const uint8arr = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
    const tList: Promise<any>[] = []

    for (let i = 0; i < 20; i++) {
      const t = new WorkerThread(newFileWorker(), [], {
        uint8arr,
      })
      tList.push(pool.submit(t))
    }

    Promise.all(tList).then((results) => {
      console.log('所有结果:', results)
    }).catch((err) => {
      console.error('有任务失败:', err)
    })
    uploadRef.value.clear()
  }
}
</script>

<style scoped lang="less">

</style>
