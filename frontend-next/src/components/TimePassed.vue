<template>
  <span class="time-passed">
    <template v-if="timePassed.y">
      <span class="number">{{ timePassed.y }}</span>
      <span class="text">年</span>
    </template>
    <span class="number">{{ timePassed.m }}</span>
    <span class="text">个月</span>
    <span class="number">{{ timePassed.d }}</span>
    <span class="text">天</span>
    <span class="number">{{ timePassed.h }}</span>
    <span class="text">小时</span>
    <span class="number">{{ timePassed.i }}</span>
    <span class="text">分钟</span>
    <span class="number">{{ timePassed.s }}</span>
    <span class="text">秒</span>
  </span>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  from: Date
}>()

const timePassed = ref({} as any)

function calcNaturalDiff(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear()
  let m = to.getMonth() - from.getMonth()
  let d = to.getDate() - from.getDate()
  let h = to.getHours() - from.getHours()
  let i = to.getMinutes() - from.getMinutes()
  let s = to.getSeconds() - from.getSeconds()

  if (s < 0) {
    s += 60
    i -= 1
  }
  if (i < 0) {
    i += 60
    h -= 1
  }
  if (h < 0) {
    h += 24
    d -= 1
  }
  if (d < 0) {
    const daysInPrevMonth = new Date(to.getFullYear(), to.getMonth(), 0).getDate()
    d += daysInPrevMonth
    m -= 1
  }
  if (m < 0) {
    m += 12
    y -= 1
  }

  return { y, m, d, h, i, s }
}

let timer: ReturnType<typeof setTimeout>

onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    timePassed.value = calcNaturalDiff(props.from, now)
  }, 1000)
})

onUnmounted(() => clearInterval(timer))
</script>

<style scoped lang="less">
.time-passed {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;

  .number {
    font-size: var(--font-size-super);
    color: var(--primary-color);
    font-weight: bold;
  }

  .text {
    font-size: var(--font-size-normal);
  }
}
</style>
