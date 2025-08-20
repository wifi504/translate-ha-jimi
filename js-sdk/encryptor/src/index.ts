import sodium from 'libsodium-wrappers'
import { EncryptClient } from './worker/encrypt-client'
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
 * 使用密钥进行对称加密
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

export { EncryptClient }
