import type { ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { SecureChatService } from '@/service/SecureChatService.ts'

/**
 * 本地浏览器加密缓存联系人的对称密钥
 * @version 1.0
 * @author WIFI连接超时
 * CreateTime: 2025-08-03 03:06
 */

const STORAGE_KEY = 'encrypted_contacts'

type ResultStatus
  = | 'success'
    | 'fail'
    | 'access_denied'
    | 'null_user'
    | 'duplicate_user'

interface EncryptedPayload {
  version: number
  encryptedData: string // base64
  iv: string
  salt: string
  iterations: number
}

function base64Encode(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64Decode(str: string): ArrayBuffer {
  const binary = atob(str)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    buf[i] = binary.charCodeAt(i)
  }
  return buf.buffer
}

export const useContactStore = defineStore('contact', () => {
  const unlocked = ref(false)
  const password = ref('')
  const contactMap = ref(new Map<string, Uint8Array>())
  const localKeyCache = ref(localStorage.getItem(STORAGE_KEY))
  const currentContact = ref('')

  /**
   * 返回值是以下枚举值：'success' | 'fail' | 'access_denied'，
   * 失败是因为两次密码不一致，
   * 如果本地是空的，相当于第一次设置密码，直接设，
   * 如果本地有东西，设置密码肯定是修改密码，那必须得解锁才行
   * @param pass 密码
   * @param confirm 确认密码
   */
  async function setPassword(pass: string, confirm: string): Promise<ResultStatus> {
    const exists = localStorage.getItem(STORAGE_KEY)
    if (exists) {
      if (!unlocked.value)
        return 'access_denied'
      if (pass !== confirm)
        return 'fail'
      password.value = pass
      await save()
      return 'success'
    }
    else {
      if (pass !== confirm)
        return 'fail'
      password.value = pass
      unlocked.value = true
      contactMap.value.clear()
      await save()
      return 'success'
    }
  }

  /**
   * 返回值是以下枚举值：'success' | 'fail'，失败是因为密码错了或者本地根本就没有
   * @param pass
   */
  async function auth(pass: string): Promise<ResultStatus> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw)
      return 'fail'

    try {
      const payload: EncryptedPayload = JSON.parse(raw)
      const salt = base64Decode(payload.salt)
      const iv = base64Decode(payload.iv)
      const encryptedData = base64Decode(payload.encryptedData)

      const pwKey = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(pass),
        { name: 'PBKDF2' },
        false,
        ['deriveKey'],
      )

      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: payload.iterations,
          hash: 'SHA-256',
        },
        pwKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt'],
      )

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        encryptedData,
      )

      const json = new TextDecoder().decode(decrypted)
      const obj: Record<string, string> = JSON.parse(json)

      const map = new Map<string, Uint8Array>()
      for (const [k, v] of Object.entries(obj)) {
        map.set(k, SecureChatService.hexToUint8Array(v))
      }

      contactMap.value = map
      password.value = pass
      unlocked.value = true
      currentContact.value = map.keys().next().value ?? ''
      return 'success'
    }
    catch {
      return 'fail'
    }
  }

  /**
   * 把Pinia的状态存localStorage
   */
  async function save(): Promise<void> {
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const iterations = 100_000

    const pwKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password.value),
      { name: 'PBKDF2' },
      false,
      ['deriveKey'],
    )

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256',
      },
      pwKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt'],
    )

    const obj: Record<string, string> = {}
    for (const [k, v] of contactMap.value.entries()) {
      obj[k] = SecureChatService.uint8ArrayToHex(v)
    }

    const plaintext = new TextEncoder().encode(JSON.stringify(obj))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, plaintext)

    const payload: EncryptedPayload = {
      version: 1,
      encryptedData: base64Encode(encrypted),
      iv: base64Encode(iv),
      salt: base64Encode(salt),
      iterations,
    }
    const result = JSON.stringify(payload)
    localStorage.setItem(STORAGE_KEY, result)
    localKeyCache.value = result
  }

  /**
   * 获取对称密钥
   * @param nickname 联系人昵称
   */
  function getSecretKey(nickname: string): Uint8Array | 'access_denied' | 'null_user' {
    if (!unlocked.value)
      return 'access_denied'
    const val = contactMap.value.get(nickname)
    return val ?? 'null_user'
  }

  /**
   * 设置对称密钥
   * @param nickname 联系人昵称
   * @param key 密钥
   */
  async function setSecretKey(nickname: string, key: Uint8Array): Promise<ResultStatus> {
    if (!unlocked.value)
      return 'access_denied'
    if (contactMap.value.has(nickname))
      return 'duplicate_user'
    contactMap.value.set(nickname, key)
    await save()
    currentContact.value = nickname
    return 'success'
  }

  /**
   * 获取当前联系人列表
   */
  const getContactList: ComputedRef<string[] | 'access_denied'> = computed(() => {
    if (!unlocked.value)
      return 'access_denied'
    return Array.from(contactMap.value.keys()).sort()
  })

  /**
   * 重命名联系人
   * @param oldName 被重命名的人
   * @param newName 新名字
   */
  async function rename(oldName: string, newName: string): Promise<ResultStatus> {
    if (!unlocked.value)
      return 'access_denied'
    if (!contactMap.value.has(oldName))
      return 'null_user'
    const value = contactMap.value.get(oldName)!
    contactMap.value.delete(oldName)
    contactMap.value.set(newName, value)
    await save()
    return 'success'
  }

  /**
   * 删除联系人
   * @param nickname 联系人昵称
   */
  async function remove(nickname: string): Promise<ResultStatus> {
    if (!unlocked.value)
      return 'access_denied'
    if (!contactMap.value.has(nickname))
      return 'null_user'
    contactMap.value.delete(nickname)
    await save()
    return 'success'
  }

  /**
   * 返回现在的认证状态，是否解锁
   */
  const hasAuth: ComputedRef<boolean> = computed(() => unlocked.value)

  /**
   * 返回现在的缓存状态，本地是否没有密钥数据
   */
  const hasClear: ComputedRef<boolean> = computed(() => !localKeyCache.value)

  /**
   * 清空本地所有密钥数据
   */
  function clear(): void {
    localStorage.removeItem(STORAGE_KEY)
    localKeyCache.value = null
    contactMap.value.clear()
    unlocked.value = false
    password.value = ''
  }

  /**
   * 导出本地缓存的联系人密钥
   */
  function exportRaw(): string {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ?? ''
  }

  /**
   * 导入其他地方导出的缓存联系人密钥
   * @param payload
   */
  function importRaw(payload: string): 'success' | 'fail' {
    try {
      const parsed = JSON.parse(payload)
      if (
        typeof parsed === 'object'
        && typeof parsed.version === 'number'
        && typeof parsed.encryptedData === 'string'
        && typeof parsed.iv === 'string'
        && typeof parsed.salt === 'string'
        && typeof parsed.iterations === 'number'
      ) {
        localStorage.setItem(STORAGE_KEY, payload)
        return 'success'
      }
      return 'fail'
    }
    catch {
      return 'fail'
    }
  }

  return {
    getSecretKey,
    setSecretKey,
    auth,
    setPassword,
    clear,
    getContactList,
    currentContact,
    rename,
    remove,
    hasAuth,
    hasClear,
    exportRaw,
    importRaw,
  }
})
