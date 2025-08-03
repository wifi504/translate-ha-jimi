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
      <div>
        {{ mode === 'set-password'
          ? '要安全地使用哈基密语交流，需要一个密码来为你的联系人密钥进行加密保存'
          : '需要加载你的哈基联系人，输入你的查看密码'
        }}
      </div>
      <n-blockquote>
        <n-collapse style="margin: 10px auto">
          <n-collapse-item title="查看详情">
            <n-ul>
              <n-li>
                你的联系人和对应的哈基友密钥都会加密存储在你的浏览器本地，
                并且每次浏览器打开时你都需要输入一次密码解锁才可以继续使用。
              </n-li>
              <n-li>
                如果你忘记了密码，可以选择 清空哈基友密钥 ，然后设置新密码再去新建联系人。
              </n-li>
              <n-li>
                当然，这些数据是跟随你的浏览器的，如果你要更换设备或者是更换浏览器，
                可以选择 导出哈基友密钥 和 导入哈基友密钥 ！（不过导入导出暂未实现）
              </n-li>
            </n-ul>
          </n-collapse-item>
        </n-collapse>
      </n-blockquote>
      <n-form ref="formRef" :model="formData" :rules="formRules">
        <n-form-item label="输入密码" path="password">
          <n-input v-model:value="formData.password" type="password" show-password-on="mousedown" placeholder="请输入密码" />
        </n-form-item>
        <n-form-item v-if="mode === 'set-password'" label="确认密码" path="confirmPassword">
          <n-input v-model:value="formData.confirmPassword" type="password" show-password-on="mousedown" placeholder="请再次输入一遍" />
        </n-form-item>
      </n-form>
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
import type {
  FormItemRule,
  FormRules,
} from 'naive-ui'
import {
  NBlockquote,
  NButton,
  NCard,
  NCollapse,
  NCollapseItem,
  NFlex,
  NForm,
  NFormItem,
  NH3,
  NInput,
  NLi,
  NModal,
  NUl,
  useMessage,
} from 'naive-ui'
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  mode?: 'set-password' | 'type-password'
}>(), {
  mode: 'set-password',
})

const emit = defineEmits<{
  (e: 'setPassword', data: FormDataType): void
  (e: 'typePassword', password: string): void
}>()

const showModal = ref(false)
const message = useMessage()

export interface FormDataType {
  password: string
  confirmPassword: string
}

const formRef = ref<InstanceType<typeof NForm>>()
const formData = ref<FormDataType>({
  password: '',
  confirmPassword: '',
})

function validatePasswordSame(_rule: FormItemRule, value: string): boolean {
  return value === formData.value.password
}

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

function handleSubmit() {
  formRef.value?.validate((err) => {
    if (!err) {
      if (props.mode === 'set-password') {
        emit('setPassword', formData.value)
      }
      else {
        emit('typePassword', formData.value.password)
      }
      hide()
    }
    else {
      message.error(err[0][0].message ?? '请检查输入')
    }
  })
}

function show() {
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

<style scoped lang="less">

</style>
