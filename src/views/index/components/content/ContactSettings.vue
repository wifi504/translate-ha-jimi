<template>
  <n-card hoverable :style="mode === 'pc' ? 'width: 290px;' : ''" :size="mode === 'phone' ? 'small' : 'medium'">
    <template #header>
      <n-flex v-if="!contactStore.hasClear" align="center" :size="4">
        <n-icon>
          <unlock-twotone v-if="contactStore.hasAuth" />
          <lock-twotone v-else />
        </n-icon>
        {{ contactStore.hasAuth ? '已解锁' : '已锁定' }}
      </n-flex>
      <n-flex v-else align="center" :size="4">
        <n-icon>
          <inbox-outlined />
        </n-icon>
        没有哈基友密钥
      </n-flex>
    </template>
    <div v-if="!contactStore.hasClear">
      <div v-if="contactStore.hasAuth">
        你的哈基友密钥已经解锁，当前一共有 {{ contactStore.getContactList.length }} 个哈基友。
      </div>
      <div v-else>
        已经从你的浏览器缓存加载出你之前的哈基友密钥，只需要你输入密码解锁后即可继续与他们聊天，或者你也可以清空缓存重新开始。
      </div>
    </div>
    <div v-else>
      你的浏览器本地目前没有缓存任何数据，你需要先设置一个密码才可以继续使用，或者导入哈基友密钥（暂未实现）
    </div>
    <template #footer>
      <n-flex v-if="!contactStore.hasClear">
        <template v-if="contactStore.hasAuth">
          <n-button type="primary" @click="$emit('setPwd')">
            修改密码
          </n-button>
          <n-button ghost type="info" @click="reloadPage">
            上锁
          </n-button>
        </template>
        <template v-else>
          <n-button type="primary" @click="$emit('typePwd')">
            解锁
          </n-button>
          <n-button ghost type="info" @click="$emit('clear')">
            清空哈基友密钥
          </n-button>
        </template>
      </n-flex>
      <n-flex v-else>
        <n-button ghost type="primary" @click="$emit('setPwd')">
          设置密码
        </n-button>
        <!-- <n-button ghost type="info"> -->
        <!--   导入哈基友密钥 -->
        <!-- </n-button> -->
      </n-flex>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import {
  InboxOutlined,
  LockTwotone,
  UnlockTwotone,
} from '@vicons/antd'
import {
  NButton,
  NCard,
  NFlex,
  NIcon,
} from 'naive-ui'
import { useContactStore } from '@/stores/contactStore.ts'

withDefaults(defineProps<{
  mode?: 'pc' | 'phone'
}>(), {
  mode: 'pc',
})

defineEmits<{
  (e: 'setPwd'): void
  (e: 'typePwd'): void
  (e: 'clear'): void
}>()

const contactStore = useContactStore()

function reloadPage() {
  window.location.reload()
}
</script>

<style scoped lang="less">

</style>
