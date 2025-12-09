<template>
  <n-card>
    <template #header>
      <n-flex v-if="!contactStore.hasClear" align="center" :size="4">
        <n-icon>
          <vi-antd-unlock-twotone v-if="contactStore.hasAuth" />
          <vi-antd-lock-twotone v-else />
        </n-icon>
        {{ contactStore.hasAuth ? '密钥库已解锁' : '密钥库已锁定' }}
      </n-flex>
      <n-flex v-else align="center" :size="4">
        <n-icon>
          <vi-antd-inbox-outlined />
        </n-icon>
        没有哈基密钥
      </n-flex>
    </template>
    <template #header-extra>
      <n-flex v-if="contactStore.hasClear">
        <n-button type="primary" ghost @click="passwordDialogRef?.show('set-password')">
          设置密码
        </n-button>
      </n-flex>
      <n-flex v-if="!contactStore.hasClear && !contactStore.hasAuth">
        <n-button type="primary" @click="passwordDialogRef?.show('type-password')">
          解锁
        </n-button>
        <n-button type="primary" ghost @click="clearCacheDialogRef?.show()">
          重置密钥库
        </n-button>
      </n-flex>
      <n-flex v-if="!contactStore.hasClear && contactStore.hasAuth">
        <n-button type="primary" @click="passwordDialogRef?.show('set-password')">
          修改密码
        </n-button>
        <n-button type="primary" ghost @click="handleLock">
          上锁
        </n-button>
      </n-flex>
    </template>
    <div v-if="!contactStore.hasClear">
      {{
        contactStore.hasAuth
          ? `您当前有 ${contactStore.contactList.length} 个哈基密钥！`
          : '已经从浏览器缓存加载出哈基密钥，只需要输入密码解锁后即可继续使用，或者清空缓存重新开始。'
      }}
    </div>
    <div v-else>
      你的浏览器本地目前没有缓存任何数据，你需要先设置一个密码才可以继续使用！
    </div>
    <password-dialog ref="passwordDialogRef" />
    <clear-cache-dialog ref="clearCacheDialogRef" />
  </n-card>
</template>

<script setup lang="ts">
import { shallowRef } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import ClearCacheDialog from '@/views/key/lock-manager/dialog/ClearCacheDialog.vue'
import PasswordDialog from '@/views/key/lock-manager/dialog/PasswordDialog.vue'

const contactStore = useContactStore()
const passwordDialogRef = shallowRef<InstanceType<typeof PasswordDialog>>()
const clearCacheDialogRef = shallowRef<InstanceType<typeof ClearCacheDialog>>()

function handleLock() {
  window.location.reload()
}
</script>
