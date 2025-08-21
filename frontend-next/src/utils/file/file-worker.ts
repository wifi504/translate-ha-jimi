import { receiveMainEvent } from '@/utils/worker/thread-util.ts'

globalThis.onmessage = receiveMainEvent([], hello)

function hello(msg: string) {
  console.log(`hello ${msg} ...`)
}
