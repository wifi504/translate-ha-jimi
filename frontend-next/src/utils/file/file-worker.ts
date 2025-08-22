import { catchToMain, receiveMainEvent, returnToMain } from '@/utils/worker/event-util.ts'

globalThis.onmessage = receiveMainEvent([], hello)

async function hello(msg: any) {
  console.log(msg)

  await new Promise(resolve => setTimeout(resolve, Math.random() * 5))

  if (Math.random() < 0.5) {
    setTimeout(() => returnToMain({
      msg: '我完成了我的工作！',
    }), 1000)
  }
  else {
    setTimeout(() => catchToMain({
      msg: '我拒绝完成我的工作！',
    }), 1000)
  }
}
