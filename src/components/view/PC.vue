<template>
  <head-bar mode="pc" />
  <div class="container">
    <div class="text">
      <div class="title">
        <div>{{ isToHaJimi ? '人儿语' : '哈吉米语' }}</div>
        <div>
          <copy-button :size="18" color="#8a4845" :copy-text="inputText" />
        </div>
      </div>
      <text-block v-model="inputText" class="input" :rows="15" :placeholder="placeholder" />
    </div>
    <svg
      t="1752860313763"
      class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4465"
      width="200" height="200" @click="handleSwitch"
    >
      <path
        d="M922.048 593.536H102.016c-3.072 0-6.08 0-7.616 1.664h-3.008c-1.536 0-3.072 1.6-4.544 1.6-1.6 1.792-1.6 1.792-3.072 1.792-1.536 1.6-3.008 1.6-3.008 1.6-3.072 1.664-4.608 3.328-6.144 4.992-1.472 1.664-3.008 4.992-4.544 6.656 0 0 0 1.664-1.472 3.328 0 1.664-1.472 1.664-1.472 3.328s0 3.392-1.472 4.992v3.328c-1.664 3.264-1.664 9.92-0.128 14.848v3.328c1.472 1.664 1.472 3.392 1.472 4.992 1.472 1.664 1.472 1.664 1.472 3.328 1.472 1.664 1.472 3.328 1.472 3.328 1.536 3.328 3.072 4.992 4.544 6.656l261.248 285.504a37.12 37.12 0 0 0 53.12 0 42.816 42.816 0 0 0 0-58.112l-197.44-215.744h730.496c21.248 0 37.952-16.64 37.952-39.872s-16.576-41.536-37.824-41.536zM102.016 430.848h827.712c1.472 0 1.472-1.664 3.008-1.664s1.472 0 3.072-1.6c1.472 0 1.472-1.664 3.008-1.664 1.536-1.6 3.072-1.6 3.072-1.6 3.072-1.664 4.544-3.328 6.08-4.992s3.072-4.992 4.544-6.656c0 0 0-1.664 1.472-3.328 0-1.664 1.536-1.664 1.536-3.392 0-1.6 0-3.328 1.472-4.928v-3.328a25.728 25.728 0 0 0 0-14.912v-3.392c-1.472-1.664-1.472-3.328-1.472-4.928-1.536-1.664-1.536-1.664-1.536-3.328-1.472-1.664-1.472-3.328-1.472-3.328-1.472-3.392-3.072-4.992-4.544-6.656l-261.184-285.504c-7.744-8.32-16.768-11.648-25.92-11.648s-19.776 3.328-27.392 11.648a46.4 46.4 0 0 0 0 58.112l198.912 215.744H102.016c-21.248 0-38.016 18.304-38.016 39.872 0 23.232 16.768 41.472 38.016 41.472z"
        p-id="4466" fill="#707070"
      />
    </svg>
    <div class="text">
      <div class="title">
        <div>{{ isToHaJimi ? '哈吉米语' : '人儿语' }}</div>
        <div><copy-button :size="18" color="#8a4845" :copy-text="translated" /></div>
      </div>
      <text-block v-model="translated" class="input" :rows="15" :placeholder="translated ? '' : '吉米语法错误 ~ 哈气！'" disabled />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from '@/components/common/CopyButton.vue'
import HeadBar from '@/components/common/HeadBar.vue'
import TextBlock from '@/components/common/TextBlock.vue'
import { getHaJimiWords, haJimiToHuman, humanToHaJimi } from '@/utils/translate.ts'

const inputText = ref('')
const isToHaJimi = ref(true)
const seed = ref('')

const placeholder = computed(() => isToHaJimi.value ? '请输入要翻译成哈吉米语的内容...' : '请输入要翻译成人儿语的内容...')
const translated = computed((): string => {
  if (isToHaJimi.value) {
    return humanToHaJimi(inputText.value, getHaJimiWords(seed.value))
  }
  else {
    return haJimiToHuman(inputText.value, getHaJimiWords(seed.value))
  }
})

function handleSwitch() {
  inputText.value = ''
  isToHaJimi.value = !isToHaJimi.value
}
</script>

<style scoped lang="less">
.container {
  margin: 70px auto 0 auto;
  width: 75%;
  align-items: center;
  display: flex;
  gap: 8px;

  .text {
    width: 100%;
    color: #333333;

    .title {
      margin: 10px 0 3px 0;
      padding: 15px 0 5px 0;
      font-size: 18px;
      color: #8a4845;
      font-weight: bold;
      user-select: none;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .input {
      width: 100%;
      min-width: 300px;
    }
  }

  .icon {
    width: 40px;
    height: 40px;

    &:hover {
      cursor: pointer;

      path {
        fill: #8a4845;
      }
    }
  }
}
</style>
