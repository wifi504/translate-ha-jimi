<template>
  <div>
    导航栏
  </div>
</template>

<script setup lang="ts">
import { compressor, encoder, hajihash } from 'hayalib'

const test = '这是一段测试的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的很长的文本'
console.log(test)

let temp: any = compressor.compress(test)
temp = encoder.encode(temp, '哈基密语')
console.log('编码后：', temp)

temp = '哈基密语椰奶龙斗坏计与尺鞋及库路曼波士被胖枕仓斗就丹被及图钱艺拿手阿西噶压认牙时帽衫全这是长屋丁女椰奶龙别及月床关鞋地十一道袜晚亏哦吗吉利贝上'
temp = encoder.decode(temp)
temp = compressor.decompress(temp)
console.log('解码后：', temp)

console.log('sha256: ', hajihash.sha256(temp))
console.log('checkWord: ', hajihash.checkWord(temp))
</script>

<style scoped lang="less">

</style>
