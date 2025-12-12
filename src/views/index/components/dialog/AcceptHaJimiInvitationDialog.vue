<template>
  <n-modal v-model:show="showModal" :mask-closable="false">
    <n-card style="width: 400px;">
      <template #header>
        <n-h3 prefix="bar" style="margin-bottom: 0">
          你有新的邀请
        </n-h3>
      </template>
      <div style="margin-bottom: 20px;">
        你的哈基友希望用哈基密语与你聊天
      </div>
      <n-steps vertical>
        <n-step v-if="contactStore.hasClear" title="设置密码">
          <div>
            因为你们的哈基密钥将加密储存在浏览器中，所以需要你先设置密码以便后续使用
          </div>
          <n-button
            v-if="!contactStore.hasAuth"
            type="primary"
            size="small"
            @click="$emit('setPwd')"
          >
            立即设置
          </n-button>
          <n-tag v-else type="success">
            完成
          </n-tag>
        </n-step>
        <n-step v-else title="输入密码">
          <div>
            你的浏览器本地已经有哈基友密钥，请输入密码解锁
          </div>
          <n-button
            v-if="!contactStore.hasAuth"
            type="primary"
            size="small"
            @click="$emit('typePwd')"
          >
            立即输入
          </n-button>
          <n-tag v-else type="success">
            完成
          </n-tag>
        </n-step>
        <n-step title="验证对方签名密钥">
          <div
            v-if="contactStore.hasAuth"
            :class="verifyInfo.includes('成功') ? 'verify-info-text-success'
              : verifyInfo.includes('失败') ? 'verify-info-text-fail' : ''"
          >
            <n-icon style="position: relative; top: 2px">
              <check-circle-twotone v-if="verifyInfo.includes('成功')" />
              <exclamation-circle-twotone v-else-if="verifyInfo.includes('失败')" />
            </n-icon>
            {{ verifyInfo }}
          </div>
          <div v-else>
            请先完成第一步
          </div>
        </n-step>
        <n-step title="你也签名一个哈基密钥给对方">
          <n-button
            v-if="contactStore.hasAuth"
            type="primary"
            ghost
            size="small"
            style="margin-bottom: 12px;"
            @click="writeClipboard(myIdentityStr)"
          >
            <template #icon>
              <n-icon>
                <document-copy16-regular />
              </n-icon>
            </template>
            复制
          </n-button>
          <n-input
            v-if="contactStore.hasAuth"
            :value="myIdentityStr"
            type="textarea"
            :autosize="{
              minRows: 5,
              maxRows: 5,
            }"
            placeholder="验证失败，拒绝签名"
            readonly
          />
          <n-input
            v-else
            disabled
            type="textarea"
            :autosize="{
              minRows: 5,
              maxRows: 5,
            }"
            placeholder="请先完成第一步"
          />
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
  NStep,
  NSteps,
  NTag,
} from 'naive-ui'
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SecureChatService } from '@/service/SecureChatService.ts'
import { TextCompressService } from '@/service/TextCompressService.ts'
import { useContactStore } from '@/stores/contactStore.ts'
import { base64UrlToBytes, bytesToBase64Url } from '@/utils/base64url'
import { writeClipboard } from '@/utils/clipboard.ts'
import { HaJimiEncodeUtil } from '@/utils/HaJimiEncodeUtil.ts'

defineEmits<{
  (e: 'setPwd'): void
  (e: 'typePwd'): void
}>()

const showModal = ref(false)
const myIdentityStr = ref<string>('')
const verifyInfo = ref<string>('')
const nickname = ref<string>('')
const contactStore = useContactStore()
const route = useRoute()
const router = useRouter()
const secureChatService = new SecureChatService()
let privateKey: Uint8Array | null = null

// dhPublicKey | dhSignature | ed25519PublicKey
type PublicIdentityHex = [string, string, string]

interface InvitePQC {
  v: 2
  kemAlg: string
  sigPk: string
  dhPk: string
  kemPk: string
  sig: string
  kemCt?: string
}

let myIdentityPqc: ReturnType<SecureChatService['exportPublicIdentityPQC']> | null = null

async function initSecureChat() {
  await secureChatService.init()
  myIdentityPqc = secureChatService.exportPublicIdentityPQC()
}

function decodeInviteFromQuery(raw: unknown): InvitePQC | PublicIdentityHex {
  const s = `${raw ?? ''}`.trim()
  if (!s) {
    throw new Error('fail')
  }
  // legacy: raw JSON in URL
  try {
    return JSON.parse(s)
  }
  catch {
    const compressed = base64UrlToBytes(s)
    const json = TextCompressService.x(compressed) as string
    return JSON.parse(json)
  }
}

async function verifySignature(): Promise<boolean> {
  try {
    const raw = route.query.invite
    if (!raw) {
      throw new Error('fail')
    }

    const decoded = decodeInviteFromQuery(raw)

    if (decoded && typeof decoded === 'object' && (decoded as any).v === 2) {
      const payload = decoded as InvitePQC
      const peerDhPk = base64UrlToBytes(payload.dhPk)
      const peerKemPk = base64UrlToBytes(payload.kemPk)
      const verified = await SecureChatService.verifyHandshakeSignaturePQC(
        peerDhPk,
        peerKemPk,
        base64UrlToBytes(payload.sig),
        base64UrlToBytes(payload.sigPk),
        payload.kemAlg,
      )
      if (!verified) {
        throw new Error('fail')
      }

      const { sharedKey, kemCipherText } = await secureChatService.computePqcHybridSharedKeyAsResponder(
        peerDhPk,
        peerKemPk,
        payload.kemAlg,
      )
      privateKey = sharedKey

      if (!myIdentityPqc) {
        throw new Error('fail')
      }
      const response: InvitePQC = {
        v: 2,
        kemAlg: myIdentityPqc.kemAlg,
        sigPk: bytesToBase64Url(myIdentityPqc.ed25519PublicKey),
        dhPk: bytesToBase64Url(myIdentityPqc.dhPublicKey),
        kemPk: bytesToBase64Url(myIdentityPqc.kemPublicKey),
        sig: bytesToBase64Url(myIdentityPqc.handshakeSignature),
        kemCt: bytesToBase64Url(kemCipherText),
      }
      const compress = TextCompressService.a(JSON.stringify(response))
      myIdentityStr.value = HaJimiEncodeUtil.decorateHaJimiKey(HaJimiEncodeUtil.encode(compress))

      verifyInfo.value = 'Verification successful! Session key established using PQC!'
      return true
    }

    // legacy fallback (no version field)
    const identityHexList = decoded as PublicIdentityHex
    const verified = SecureChatService.verifyDHSignature(
      SecureChatService.hexToUint8Array(identityHexList[0]),
      SecureChatService.hexToUint8Array(identityHexList[1]),
      SecureChatService.hexToUint8Array(identityHexList[2]),
    )
    if (!verified) {
      throw new Error('fail')
    }
    privateKey = secureChatService.computeSharedKey(SecureChatService.hexToUint8Array(identityHexList[0]))
    verifyInfo.value = '验证成功！已经安全地生成了独属于你们的对称密钥'

    // keep old format
    const identity = secureChatService.exportPublicIdentity()
    const identityHex: PublicIdentityHex = [
      SecureChatService.uint8ArrayToHex(identity.dhPublicKey),
      SecureChatService.uint8ArrayToHex(identity.dhSignature),
      SecureChatService.uint8ArrayToHex(identity.ed25519PublicKey),
    ]
    const compress = TextCompressService.a(JSON.stringify(identityHex))
    myIdentityStr.value = HaJimiEncodeUtil.decorateHaJimiKey(HaJimiEncodeUtil.encode(compress))

    return true
  }
  catch {
    verifyInfo.value = '验证失败！你需要让对方重发才能继续'
    return false
  }
}

const canStartChat = computed<boolean>(() => {
  const isVerified = verifyInfo.value.includes('成功')
  const isNicknameCheck = nickname.value.length > 0 && nickname.value.length <= 8
  return isVerified && isNicknameCheck && !!privateKey
})

function startChat() {
  contactStore.setSecretKey(nickname.value, privateKey as Uint8Array)
  hide()
}

async function show() {
  showModal.value = true
  await initSecureChat()
}

function hide() {
  showModal.value = false
  router.push('/')
}

onBeforeMount(async () => {
  await initSecureChat()
  if (route.query.invite) {
    await verifySignature()
    await show()
  }
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
