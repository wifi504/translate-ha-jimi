<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 400px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          添加联系人
        </n-h3>
      </template>
      <div style="margin-bottom: 20px;">
        去找一个好友跟你一起用哈基密语交流吧
      </div>
      <n-steps vertical>
        <n-step title="你签名一个哈基密钥给对方">
          <n-tabs animated>
            <n-tab-pane name="qrcode" tab="通过扫描二维码">
              <n-qr-code
                :value="getSharedURL()"
                :size="189"
                color="#5c201d"
                style="border: 1px solid #e0e0e6"
                :icon-src="iconUrl"
                icon-background-color="#ffffff00"
                :icon-border-radius="0"
                :icon-size="50"
              />
            </n-tab-pane>
            <n-tab-pane name="link" tab="通过分享链接">
              <n-button
                type="primary"
                ghost
                size="small"
                style="margin-bottom: 12px;"
                @click="writeClipboard(getSharedURL())"
              >
                <template #icon>
                  <n-icon>
                    <document-copy16-regular />
                  </n-icon>
                </template>
                复制
              </n-button>
              <n-input
                :value="getSharedURL()"
                type="textarea"
                :autosize="{
                  minRows: 5,
                  maxRows: 9,
                }"
                readonly
              />
            </n-tab-pane>
          </n-tabs>
        </n-step>
        <n-step title="输入对方签名的哈基密钥">
          <n-button
            type="primary"
            ghost
            size="small"
            style="margin: 12px 0;"
            @click="async () => yourIdentityStr = await readClipboard()"
          >
            <template #icon>
              <n-icon>
                <clipboard-paste16-filled />
              </n-icon>
            </template>
            粘贴
          </n-button>
          <n-input v-model:value="yourIdentityStr" placeholder="对方扫码或者打开链接就会生成一个密钥" />
          <div
            :class="verifyInfo.includes('成功') ? 'verify-info-text-success'
              : verifyInfo.includes('失败') ? 'verify-info-text-fail' : ''"
          >
            <n-icon style="position: relative; top: 2px">
              <check-circle-twotone v-if="verifyInfo.includes('成功')" />
              <exclamation-circle-twotone v-else-if="verifyInfo.includes('失败')" />
            </n-icon>
            {{ verifyInfo }}
          </div>
        </n-step>
        <n-step title="设置好友昵称">
          <n-input
            v-model:value="nickname"
            :maxlength="8"
            show-count
            placeholder="昵称用来让你方便区分，不能超过8字"
          />
        </n-step>
      </n-steps>
      <template #action>
        <n-flex justify="right">
          <n-button ghost type="primary" @click="hide">
            取消
          </n-button>
          <n-button
            type="primary"
            :disabled="!canStartChat"
            @click="startChat"
          >
            开始聊天
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import {
  CheckCircleTwotone,
  ExclamationCircleTwotone,
} from '@vicons/antd'
import {
  ClipboardPaste16Filled,
  DocumentCopy16Regular,
} from '@vicons/fluent'
import {
  NButton,
  NCard,
  NFlex,
  NH3,
  NIcon,
  NInput,
  NModal,
  NQrCode,
  NStep,
  NSteps,
  NTabPane,
  NTabs,
} from 'naive-ui'
import { computed, onBeforeMount, ref, watch } from 'vue'
import hjmLogo from '@/assets/image/hjm.png'
import { SecureChatService } from '@/service/SecureChatService.ts'
import { TextCompressService } from '@/service/TextCompressService.ts'
import { useContactStore } from '@/stores/contactStore.ts'
import { readClipboard, writeClipboard } from '@/utils/clipboard.ts'
import { debounce } from '@/utils/debounce.ts'
import { HaJimiEncodeUtil } from '@/utils/HaJimiEncodeUtil.ts'

const iconUrl = hjmLogo
const showModal = ref(false)
const myIdentityStr = ref<string>('')
const yourIdentityStr = ref<string>('')
const verifyInfo = ref<string>('')
const nickname = ref<string>('')
const secureChatService = new SecureChatService()
const contactStore = useContactStore()
let privateKey: Uint8Array | null = null

// dhPublicKey | dhSignature | ed25519PublicKey
type PublicIdentityHex = [string, string, string]

async function initSecureChat() {
  await secureChatService.init()
  const identity = secureChatService.exportPublicIdentity()
  const identityHex: PublicIdentityHex = [
    SecureChatService.uint8ArrayToHex(identity.dhPublicKey),
    SecureChatService.uint8ArrayToHex(identity.dhSignature),
    SecureChatService.uint8ArrayToHex(identity.ed25519PublicKey),
  ]
  myIdentityStr.value = JSON.stringify(identityHex)
}

function verifySignature(identityStr: string): boolean {
  try {
    if (!identityStr) {
      verifyInfo.value = ''
      return false
    }
    if (!identityStr.startsWith('哈基密钥')) {
      throw new Error('fail')
    }
    const compress = HaJimiEncodeUtil.decode(HaJimiEncodeUtil.stripHaJimi(identityStr))
    const identityDecodeStr = TextCompressService.x(compress)
    const identityHex = JSON.parse(identityDecodeStr as string)
    const verified = SecureChatService.verifyDHSignature(
      SecureChatService.hexToUint8Array(identityHex[0]),
      SecureChatService.hexToUint8Array(identityHex[1]),
      SecureChatService.hexToUint8Array(identityHex[2]),
    )
    if (!verified) {
      throw new Error('fail')
    }
    privateKey = secureChatService.computeSharedKey(SecureChatService.hexToUint8Array(identityHex[0]))
    verifyInfo.value = '验证成功！已经安全地生成了独属于你们的对称密钥！'
    return true
  }
  catch {
    verifyInfo.value = '对方密钥签名验证失败！'
    return false
  }
}

const canStartChat = computed<boolean>(() => {
  const isVerified = verifyInfo.value.includes('成功')
  const isNicknameCheck = nickname.value.length > 0 && nickname.value.length <= 8
  return (isVerified && isNicknameCheck && !!privateKey)
})

const debounceVerifySignature = debounce(verifySignature, 100)

watch(yourIdentityStr, (newVal) => {
  debounceVerifySignature(newVal)
})

function getSharedURL() {
  const origin = window.location.origin
  const query = `/hajimi/?invite=${myIdentityStr.value}`
  return origin + query
}

function startChat() {
  contactStore.setSecretKey(nickname.value, privateKey as Uint8Array)
  hide()
}

async function show() {
  await initSecureChat()
  yourIdentityStr.value = ''
  nickname.value = ''
  showModal.value = true
}

function hide() {
  showModal.value = false
}

onBeforeMount(async () => {
  await initSecureChat()
})

defineExpose({
  show,
  hide,
})
</script>

<style scoped lang="less">
.verify-info-text-fail {
  color: #cf8d27;
  margin-top: 4px;
}

.verify-info-text-success {
  color: #18a058;
  margin-top: 4px;
}
</style>
