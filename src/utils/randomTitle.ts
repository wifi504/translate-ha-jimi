import type { Ref } from 'vue'
import { ref } from 'vue'

const arr: string[] = [
  '哈吉米',
  '哈吉咪',
  '哈基米',
  '哈基咪',
  '哈集米',
  '哈集咪',
  '蛤吉米',
  '蛤吉咪',
  '蛤基米',
  '蛤基咪',
  '蛤集米',
  '蛤集咪',
]

function autoUpdate(titleRef: Ref<string>, updateCallback?: () => void): void {
  setTimeout(() => {
    const idx = Math.floor(Math.random() * arr.length)
    titleRef.value = arr[idx]
    if (updateCallback) {
      updateCallback()
    }
    autoUpdate(titleRef, updateCallback)
  }, Math.floor(2000 + Math.random() * 4000))
}

function getHaJimiTitle(): Ref<string> {
  const title = ref()
  title.value = '哈吉米'
  return title as Ref<string>
}

export { autoUpdate, getHaJimiTitle }
