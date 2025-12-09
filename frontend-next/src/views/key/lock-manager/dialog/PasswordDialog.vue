<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card
      style="width: 400px;"
    >
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          {{ mode === 'set-password' ? '设置密码' : '输入密码' }}
        </n-h3>
      </template>
      <n-form ref="formRef" :model="formData" :rules="formRules">
        <n-form-item label="输入密码" path="password">
          <n-input v-model:value="formData.password" type="password" show-password-on="mousedown" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item v-if="mode === 'set-password'" label="确认密码" path="confirmPassword">
          <n-input v-model:value="formData.confirmPassword" type="password" show-password-on="mousedown" placeholder="请再次输入一遍" />
        </n-form-item>
      </n-form>
      <template #footer>
        <div>
          {{ mode === 'set-password'
            ? '要安全地使用哈基密文相关功能，需要一个密码来为你的哈基密钥进行加密保存'
            : '请输入密码以加载你的哈基密钥'
          }}
        </div>
      </template>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button type="primary" @click="handleSubmit">
            确认
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import type { FormItemRule, FormRules } from 'naive-ui'
import { NForm, useMessage } from 'naive-ui'
import { ref } from 'vue'
import { useContactStore } from '@/stores/contactStore.ts'

export type PasswordDialogMode = 'set-password' | 'type-password'
export interface FormDataType {
  password: string
  confirmPassword: string
}

const message = useMessage()
const contactStore = useContactStore()
const showModal = ref(false)
const mode = ref<PasswordDialogMode>('set-password')
const formRef = ref<InstanceType<typeof NForm>>()
const formData = ref<FormDataType>({
  password: '',
  confirmPassword: '',
})
const formRules: FormRules = {
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: ['blur'],
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: '请再次输入密码',
      trigger: ['input', 'blur'],
    },
    {
      validator: validatePasswordSame,
      message: '两次密码输入不一致',
      trigger: ['blur', 'password-input'],
    },
  ],
}

function validatePasswordSame(_rule: FormItemRule, value: string): boolean {
  return value === formData.value.password
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  }
  catch (err: any) {
    message.error(err?.[0][0]?.message ?? '请检查输入')
    return
  }
  // 设置密码
  if (mode.value === 'set-password') {
    const res = await contactStore.setPassword(formData.value.password, formData.value.confirmPassword)
    // 'success' | 'fail' | 'access_denied'
    if (res === 'success') {
      message.success('设置成功！')
      hide()
    }
    else if (res === 'fail') {
      message.error('设置失败！')
    }
    else {
      message.error('没有解锁，不能设置！')
    }
    return
  }
  // 输入密码
  if (mode.value === 'type-password') {
    const res = await contactStore.auth(formData.value.password)
    // 'success' | 'fail'
    if (res === 'success') {
      message.success('解锁成功！')
      hide()
    }
    else {
      message.error('解锁失败！')
    }
  }
}

function show(dialogMode: PasswordDialogMode) {
  mode.value = dialogMode
  formData.value.password = ''
  formData.value.confirmPassword = ''
  showModal.value = true
}

function hide() {
  showModal.value = false
}

defineExpose({
  show,
  hide,
})
</script>
