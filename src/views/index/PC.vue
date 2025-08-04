<template>
  <head-bar mode="pc" />
  <div class="container">
    <n-flex :wrap="false">
      <n-flex vertical>
        <contact-settings
          @set-pwd="() => {
            passwordMode = 'set-password'
            passwordDialogRef?.show()
          }"
          @type-pwd="() => {
            passwordMode = 'type-password'
            passwordDialogRef?.show()
          }"
          @clear="() => {
            clearHaJimiCacheDialogRef?.show()
          }"
        />
        <contact-list
          ref="contactListRef"
          :list="contactStore.getContactList"
          :active="contactStore.currentContact"
          style="max-height: 600px;"
          @add-one="handleAddOne"
        />
      </n-flex>
      <n-flex vertical style="width: 100%;">
        <ha-jimi-text-area @has-changed-current-contact="() => contactListRef?.autoScroll()" />
        <notice />
      </n-flex>
    </n-flex>
  </div>
  <foot-info />
  <password-dialog
    ref="passwordDialogRef"
    :mode="passwordMode"
    @set-password="handleSetPassword"
    @type-password="handleTypePassword"
  />
  <send-ha-jimi-invitation-dialog ref="sendHaJimiInvitationDialogRef" />
  <accept-ha-jimi-invitation-dialog
    @set-pwd="() => {
      passwordMode = 'set-password'
      passwordDialogRef?.show()
    }"
    @type-pwd="() => {
      passwordMode = 'type-password'
      passwordDialogRef?.show()
    }"
  />
  <clear-ha-jimi-cache-dialog ref="clearHaJimiCacheDialogRef" />
</template>

<script setup lang="ts">
import type { FormDataType } from '@/views/index/components/dialog/PasswordDialog.vue'
import {
  NFlex,
  useMessage,
} from 'naive-ui'
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'
import ContactList from '@/views/index/components/content/ContactList.vue'
import ContactSettings from '@/views/index/components/content/ContactSettings.vue'
import FootInfo from '@/views/index/components/content/FootInfo.vue'
import HaJimiTextArea from '@/views/index/components/content/HaJimiTextArea.vue'
import HeadBar from '@/views/index/components/content/HeadBar.vue'
import Notice from '@/views/index/components/content/Notice.vue'
import AcceptHaJimiInvitationDialog from '@/views/index/components/dialog/AcceptHaJimiInvitationDialog.vue'
import ClearHaJimiCacheDialog from '@/views/index/components/dialog/ClearHaJimiCacheDialog.vue'
import PasswordDialog from '@/views/index/components/dialog/PasswordDialog.vue'
import SendHaJimiInvitationDialog from '@/views/index/components/dialog/SendHaJimiInvitationDialog.vue'

const passwordDialogRef = ref<InstanceType<typeof PasswordDialog>>()
const contactListRef = ref<InstanceType<typeof ContactList>>()
const sendHaJimiInvitationDialogRef = ref<InstanceType<typeof SendHaJimiInvitationDialog>>()
const clearHaJimiCacheDialogRef = ref<InstanceType<typeof ClearHaJimiCacheDialog>>()
const passwordMode = ref<'set-password' | 'type-password'>('set-password')
const message = useMessage()
const contactStore = useContactStore()

function handleAddOne() {
  sendHaJimiInvitationDialogRef.value?.show()
}

async function handleSetPassword(data: FormDataType) {
  const res = await contactStore.setPassword(data.password, data.confirmPassword)
  // 'success' | 'fail' | 'access_denied'
  if (res === 'success') {
    message.success('设置成功！')
  }
  else if (res === 'fail') {
    message.error('设置失败！')
  }
  else {
    message.error('没有解锁，不能设置！')
  }
}

async function handleTypePassword(password: string) {
  const res = await contactStore.auth(password)
  // 'success' | 'fail'
  if (res === 'success') {
    message.success('解锁成功！')
  }
  else {
    message.error('解锁失败！')
  }
}
</script>

<style scoped lang="less">
.layout {
  background: rgba(0, 0, 0, 0);
}

.container {
  padding-top: calc(90px + 25px);
  margin: auto;
  width: 80%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
