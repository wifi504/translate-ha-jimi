<template>
  <div>
    导航栏
    <n-upload
      ref="uploadRef"
      :max="1"
      :custom-request="customUpload"
      file-list-style="display: none;"
    >
      <n-upload-dragger>
        上传
      </n-upload-dragger>
    </n-upload>
    <n-button @click="down()">
      下载
    </n-button>
  </div>
</template>

<script setup lang="ts">
import type { UploadCustomRequestOptions } from 'naive-ui'
import { compressor, encoder, utils } from 'hayalib'
import { ref } from 'vue'

function down() {
  const text = utils.stringToUint8Array('123456我喜欢你')
  const comp = compressor.compress(text)
  utils.downloadFile(comp, '测试.txt')
}

const uploadRef = ref()

async function customUpload(options: UploadCustomRequestOptions) {
  const file = options.file.file as File
  console.log(file)
  const buf = await file.arrayBuffer()
  console.log(buf)

  uploadRef.value.clear()

  if (file.name !== '基密文件.txt') {
    utils.downloadFile(
      utils.stringToUint8Array(
        encoder.encode(compressor.compress(new Uint8Array(buf)), '基密文件'),
      ),
      '基密文件.txt',
      { filename: file.name },
    )
  }
  else {
    const unpack = utils.unpackFile(new Uint8Array(buf))
    utils.downloadFile(
      compressor.decompress(encoder.decode(utils.uint8ArrayToString(unpack.payload))),
      unpack.metadata.filename,
    )
  }
}
</script>

<style scoped lang="less">

</style>
