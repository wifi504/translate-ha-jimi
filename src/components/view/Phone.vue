<template>
  <head-bar mode="phone" />
  <div class="container">
    <div class="main">
      <div class="text">
        <div class="title">
          <div>{{ isToHaJimi ? '人儿语' : `${haJimiSeed}语` }}</div>
          <div class="title-item">
            <div class="text-button" @click="inputTextCopyRef?.handleClick">
              <copy-button ref="inputTextCopyRef" :size="18" color="#8a4845" :copy-text="inputText" />
              <span>复制</span>
            </div>
            <div class="text-button" @click="handlePasteOnInput">
              <icon-button :size="18" color="#8a4845" icon="paste" />
              <span>粘贴</span>
            </div>
            <div class="text-button" @click="handleClearInput">
              <icon-button :size="18" color="#8a4845" icon="close" />
              <span>清空</span>
            </div>
          </div>
        </div>
        <text-block v-model="inputText" class="input" :rows="7" :placeholder="placeholder" />
      </div>
      <div class="text-button" @click="handleSwitch">
        <icon-button :size="18" color="#8a4845" icon="switch" :rotate="90" />
        <span>切换</span>
      </div>
      <div class="text">
        <div class="title">
          <div>{{ isToHaJimi ? `${haJimiSeed}语` : '人儿语' }}</div>
          <div class="text-button" @click="outputTextCopyRef?.handleClick">
            <copy-button ref="outputTextCopyRef" :size="18" color="#8a4845" :copy-text="translated" />
            <span>复制</span>
          </div>
        </div>
        <text-block
          v-model="translated" class="input" :rows="7" :placeholder="translated ? '' : '吉米语法错误 ~ 哈气！'"
          disabled
        />
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
      <text-block v-model="seed" :rows="1" style="width: 200px; padding: 4px;" />
    </div>
    <div class="ha-jimi-text" style="color: #4d4d4d;">
      被{{ t5 }}入侵的人儿类网站会开始曼波，
      {{ t6 }}们的名字往往会一直变化，
      快来数数网站里有多少只{{ t7 }}。
    </div>
  </div>
  <foot-info mode="phone" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CopyButton from '@/components/common/CopyButton.vue'
import FootInfo from '@/components/common/FootInfo.vue'
import HeadBar from '@/components/common/HeadBar.vue'
import IconButton from '@/components/common/IconButton.vue'
import TextBlock from '@/components/common/TextBlock.vue'
import { autoUpdate, getHaJimiTitle } from '@/utils/randomTitle.ts'
import { getHaJimiWords, haJimiToHuman, humanToHaJimi } from '@/utils/translate.ts'

const inputText = ref('')
const isToHaJimi = ref(true)
const seed = ref('')
const t1 = getHaJimiTitle()
const t2 = getHaJimiTitle()
const t3 = getHaJimiTitle()
const t4 = getHaJimiTitle()
const t5 = getHaJimiTitle()
const t6 = getHaJimiTitle()
const t7 = getHaJimiTitle()
const inputTextCopyRef = ref<InstanceType<typeof CopyButton>>()
const outputTextCopyRef = ref<InstanceType<typeof CopyButton>>()

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

  .main {
    margin: 0 auto;
    padding-top: 15px;
    width: 100%;
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .text {
      width: 100%;
      color: #333333;

      .title {
        margin-bottom: 3px;
        padding: 5px 14px;
        font-size: 24px;
        color: #8a4845;
        font-weight: bold;
        user-select: none;
        display: flex;
        justify-content: space-between;
        align-items: baseline;

        .title-item {
          display: flex;
          gap: 5px;
        }
      }

      .input {
        width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
      }
    }
  }

  .ha-jimi-text {
    width: calc(100% - 28px);
    padding: 0;
    margin: 20px auto;
    display: flex;
    align-items: baseline;
    color: #8a4845;
    user-select: none;
  }

  .text-button {
    display: flex;
    color: #8a4845;
    align-items: center;
    gap: 5px;
    background-color: #fff5f5;
    box-shadow: 0 0 10px rgba(0, 0, 0, .1);
    border-radius: 15px;
    padding: 8px;

    span {
      font-size: 16px;
      font-weight: normal;
    }

    * {
      pointer-events: none;
    }
  }
}
</style>
