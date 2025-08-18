<template>
  <div>
    导航栏
  </div>
</template>

<script setup lang="ts">
import { compressor, encoder } from 'hayalib'

const test = '这是一段测试的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的文本'
console.log(test)

let temp: any = compressor.compress(test)
temp = encoder.encode(temp, '哈基密语')
console.log('编码后：', temp)

temp = encoder.decode(temp)
temp = compressor.decompress(temp)
console.log('解码后：', temp)
</script>

<style scoped lang="less">

</style>
