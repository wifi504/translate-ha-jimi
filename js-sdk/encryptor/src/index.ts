import type { StateAddress } from 'libsodium-wrappers'
import sodium from 'libsodium-wrappers'
/**
 * 哈基密语端到端加密器
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/8/19_11:55
 */

// 密钥对
export type KeyPair = sodium.KeyPair
// 身份信息
export interface Identity {
  dhPublicKey: Uint8Array
  signPublicKey: Uint8Array
  dhSignature: Uint8Array
}
// 对称加密密文
export interface Secret {
  nonce: Uint8Array
  cipherData: Uint8Array
}

/**
 * 初始化哈基米加密器
 */
export async function init() {
  await sodium.ready
}

/**
 * 生成DH密钥对（x25519）
 */
export function dhKeypair(): KeyPair {
  return sodium.crypto_box_keypair()
}

/**
 * 生成签名密钥对（ed25519）
 */
export function signKeypair(): KeyPair {
  return sodium.crypto_sign_keypair()
}

/**
 * 导出签名身份信息（DH公钥、签名的公钥、DH公钥的签名）
 *
 * @param dhKeypair DH密钥对
 * @param signKeypair 签名密钥对
 */
export function exportPublicIdentity(
  dhKeypair: KeyPair,
  signKeypair: KeyPair,
): Identity {
  return {
    dhPublicKey: dhKeypair.publicKey,
    signPublicKey: signKeypair.publicKey,
    dhSignature: sodium.crypto_sign_detached(dhKeypair.publicKey, signKeypair.privateKey),
  }
}

/**
 * 验证身份信息签名
 *
 * @param identity 身份信息
 */
export function verifyPublicIdentity(identity: Identity): boolean {
  return sodium.crypto_sign_verify_detached(
    identity.dhSignature,
    identity.dhPublicKey,
    identity.signPublicKey,
  )
}

/**
 * 计算共享密钥
 *
 * @param dhPrivateKey DH私钥
 * @param peerDhPublicKey 对方DH公钥
 */
export function computeSharedKey(
  dhPrivateKey: Uint8Array,
  peerDhPublicKey: Uint8Array,
): Uint8Array {
  return sodium.crypto_scalarmult(dhPrivateKey, peerDhPublicKey)
}

/**
 * 使用密钥进行对称加密
 *
 * @param plainData 明文数据
 * @param key 密钥
 * @return 密文对象
 */
export function encrypt(plainData: Uint8Array, key: Uint8Array): Secret {
  // AEAD：带有关联数据的身份验证加密（Authenticated Encryption with Associated Data）
  // ChaCha20：流加密替代AES提高效率
  // Poly1305：消息认证码MAC，保证密文是没有被篡改的
  // ietf：对上面算法选择的规范，HTTP/2、TLS 1.3、QUIC啥的都用的这个，用就完了
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES)
  const cipherData = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    plainData,
    null,
    null,
    nonce,
    key,
  )
  return { nonce, cipherData }
}

/**
 * 使用密钥解密
 *
 * @param secret 密文对象
 * @param key 密钥
 * @return 明文数据
 */
export function decrypt(secret: Secret, key: Uint8Array): Uint8Array {
  return sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
    null,
    secret.cipherData,
    null,
    secret.nonce,
    key,
  )
}

export type EncryptState = StateAddress

/**
 * 初始化加密流
 *
 * @param key 加密密钥
 * @returns 包含初始状态和头部的对象
 */
export function initEncryption(key: Uint8Array): {
  state: EncryptState
  header: Uint8Array
} {
  return sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
}

/**
 * 初始化解密流
 *
 * @param key 解密密钥
 * @param header 加密时生成的头部
 * @returns 解密状态
 */
export function initDecryption(key: Uint8Array, header: Uint8Array): EncryptState {
  return sodium.crypto_secretstream_xchacha20poly1305_init_pull(header, key)
}

/**
 * 加密文件分片
 *
 * @param state 加密状态
 * @param chunk 文件分片数据
 * @param isFinal 是否为最后一个分片
 * @returns 加密后的分片数据
 */
export function encryptChunk(
  state: EncryptState,
  chunk: Uint8Array,
  isFinal: boolean = false,
): Uint8Array {
  const tag = isFinal
    ? sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL
    : sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE

  return sodium.crypto_secretstream_xchacha20poly1305_push(state, chunk, null, tag)
}

/**
 * 解密文件分片
 *
 * @param state 解密状态
 * @param encryptedChunk 加密的分片数据
 * @returns 包含解密数据和是否为最后一个分片的对象
 */
export function decryptChunk(
  state: EncryptState,
  encryptedChunk: Uint8Array,
): {
  data: Uint8Array
  isFinal: boolean
} {
  const messageTag = sodium.crypto_secretstream_xchacha20poly1305_pull(state, encryptedChunk)
  if (!messageTag) throw new Error('解密失败')
  const isFinal = messageTag.tag === sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL

  return { data: messageTag.message, isFinal }
}
