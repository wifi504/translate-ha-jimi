<template>
  <head-bar mode="pc" />
  <div class="container" :style="`--foot-height: ${footInfoHeight}px;`">
    <div class="a-link-text">
      【哈基密语2.0】已经上线，<span class="btn" @click="handleGoNew"> 立即前往 </span>体验新版！
    </div>
    <div class="main">
      <div class="text">
        <div class="title">
          <div>{{ isToHaJimi ? '人儿语' : `${haJimiSeed}语` }}</div>
          <div class="title-item">
            <copy-button :size="18" color="#8a4845" :copy-text="inputText" />
            <icon-button :size="18" color="#8a4845" icon="paste" @click="handlePasteOnInput" />
            <icon-button :size="18" color="#8a4845" icon="close" @click="handleClearInput" />
          </div>
        </div>
        <text-block v-model="inputText" class="input" :rows="15" :placeholder="placeholder" />
      </div>
      <icon-button :size="40" color="#8a4845" icon="switch" @click="handleSwitch" />
      <div class="text">
        <div class="title">
          <div>{{ isToHaJimi ? `${haJimiSeed}语` : '人儿语' }}</div>
          <div><copy-button :size="18" color="#8a4845" :copy-text="translated" /></div>
        </div>
        <text-block v-model="translated" class="input" :rows="15" :placeholder="translated ? '' : '吉米语法错误 ~ 哈气！'" disabled />
      </div>
    </div>
    <div class="ha-jimi-text">
      <strong style="width: 80px !important;">重要提示： </strong>
      <span style="width: calc(100% - 80px)">
        {{ t1 }}们实在是太多了，但是它们往往不能互相听懂对方在说什么，
        人儿语翻译出来的{{ t2 }}语虽然看起来都是一样的，
        但是只有方言一样的{{ t3 }}才能互译！默认方言是哈吉米，你可以在下方自定义。
      </span>
    </div>
    <div class="ha-jimi-text">
      <strong style="width: 128px;">设置{{ t4 }}方言：</strong>
      <text-block v-model="seed" :rows="1" style="width: 300px; padding: 4px;" />
    </div>
    <div class="ha-jimi-text" style="color: #4d4d4d;">
      被{{ t5 }}入侵的人儿类网站会开始曼波，
      {{ t6 }}们的名字往往会一直变化，
      快来数数网站里有多少只{{ t7 }}。
    </div>
  </div>
  <foot-info ref="footInfoRef" mode="pc" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CopyButton from '@/components/common/CopyButton.vue'
import IconButton from '@/components/common/IconButton.vue'
import TextBlock from '@/components/common/TextBlock.vue'
import { autoUpdate, getHaJimiTitle } from '@/utils/random-title.ts'
import { getHaJimiWords, haJimiToHuman, humanToHaJimi } from '@/utils/translate.ts'
import FootInfo from '@/views/base64/components/FootInfo.vue'
import HeadBar from '@/views/base64/components/HeadBar.vue'

const inputText = ref('')
const isToHaJimi = ref(true)
const seed = ref('')
const footInfoRef = ref()
const t1 = getHaJimiTitle()
const t2 = getHaJimiTitle()
const t3 = getHaJimiTitle()
const t4 = getHaJimiTitle()
const t5 = getHaJimiTitle()
const t6 = getHaJimiTitle()
const t7 = getHaJimiTitle()
const router = useRouter()

const placeholder = computed(() => isToHaJimi.value ? '请输入要翻译成哈吉米语的内容...' : '请输入要翻译成人儿语的内容...')
const translated = computed((): string => {
  if (isToHaJimi.value) {
    return humanToHaJimi(inputText.value, getHaJimiWords(seed.value || '哈吉米'))
  }
  else {
    return haJimiToHuman(inputText.value, getHaJimiWords(seed.value || '哈吉米'))
  }
})

const haJimiSeed = computed(() => {
  if (seed.value.length <= 10) {
    return seed.value || '哈吉米'
  }
  return `${seed.value.substring(0, 10)}...`
})

const footInfoHeight = computed(() => {
  if (footInfoRef.value) {
    return footInfoRef.value.$el.offsetHeight
  }
  return 0
})

function handleSwitch() {
  inputText.value = ''
  isToHaJimi.value = !isToHaJimi.value
}

async function handlePasteOnInput() {
  inputText.value += await navigator.clipboard.readText()
}

function handleClearInput() {
  inputText.value = ''
}

function handleGoNew() {
  router.push('/')
}

onMounted(() => {
  autoUpdate(t1)
  autoUpdate(t2)
  autoUpdate(t3)
  autoUpdate(t4)
  autoUpdate(t5)
  autoUpdate(t6)
  autoUpdate(t7)
})
</script>

<style scoped lang="less">
.container {
  margin-top: 70px;
  height: calc(100vh - 70px - var(--foot-height));
  overflow: auto;
  padding-right: 10px;

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
    &:hover {
      background-color: #555;
    }
  }

  // 火狐浏览器
  scrollbar-width: thin;
  scrollbar-color: #888 transparent;

  .main {
    margin: 15px auto 0 auto;
    width: 75%;
    align-items: center;
    display: flex;
    gap: 8px;

    .text {
      width: 100%;
      color: #333333;

      .title {
        margin-bottom: 3px;
        padding: 5px 0;
        font-size: 18px;
        color: #8a4845;
        font-weight: bold;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;

        .title-item {
          display: flex;
          gap: 5px;
        }
      }

      .input {
        width: 100%;
        min-width: 300px;
      }
    }
  }

  .ha-jimi-text {
    width: 75%;
    margin: 20px auto;
    display: flex;
    align-items: baseline;
    color: #8a4845;
    user-select: none;
  }

  .a-link-text {
    margin: 15px auto 0 auto;
    width: 75%;
    user-select: none;
    align-items: center;
    color: #8a4845;

    .btn {
      cursor: pointer;
      text-decoration: underline;
      font-weight: bold;

      &:hover {
        color: #e1817c;
      }

      &:active {
        color: #542220;
      }
    }
  }
}
</style>
