import { defineWorker, requestTerminate } from '@/utils/thread-pool'

defineWorker(main)

let memoryUsed: number = 0
// 利用 Transfer 机制的垃圾回收
function main(data: any) {
  if (Array.isArray(data)) {
    let count: number = 0
    data.forEach((d: ArrayBuffer) => {
      memoryUsed += d.byteLength ?? 0
      count += d.byteLength ?? 0
    })
    console.log('回收垃圾：', (count / 1024 / 1024).toFixed(2), 'MB')
  }
  else {
    console.log('没有可回收的垃圾')
  }
  if (memoryUsed >= 300 * 1024 * 1024) {
    requestTerminate(`利用 Transfer 机制回收内存，GC线程释放了内存 ${(memoryUsed / 1024 / 1024).toFixed(2)} MB`)
  }
}
