/**
 * 哈基密语端到端加密通信服务
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
import sodium from 'libsodium-wrappers'

export class SecureChatService {
  // Ed25519 签名密钥对：身份认证和签名
  private _ed25519?: sodium.KeyPair

  // X25519 密钥对：Diffie-Hellman 密钥交换
  private _x25519?: sodium.KeyPair

  // 对称加密密钥
  private _sharedKey?: Uint8Array

  // libsodium 初始化
  private _isReady = false

  constructor() {
  }

  /**
   * 初始化 libsodium 和生成密钥对
   * 这个方法必须手动且仅需要调用一次
   */
  async init() {
    if (this._isReady)
      return
    // 等待 libsodium 加载完成（WebAssembly）
    await sodium.ready
    // 身份密钥
    this._ed25519 = sodium.crypto_sign_keypair()
    // DH密钥
    this._x25519 = sodium.crypto_box_keypair()
    this._isReady = true
  }

  /**
   * 获取 Ed25519 公钥（用于身份认证对外公布）
   */
  get ed25519PublicKey(): Uint8Array {
    if (!this._ed25519)
      throw new Error('尚未初始化：请先调用 init()')
    return this._ed25519.publicKey
  }

  /**
   * 获取 X25519 公钥（用于共享密钥协商）
   */
  get x25519PublicKey(): Uint8Array {
    if (!this._x25519)
      throw new Error('尚未初始化：请先调用 init()')
    return this._x25519.publicKey
  }

  /**
   * 签名自己的 X25519 公钥
   * 用于发送给对方，确保公钥真实性（防止中间人攻击）
   */
  signDHPublicKey(): Uint8Array {
    if (!this._ed25519 || !this._x25519)
      throw new Error('尚未初始化：请先调用 init()')
    return sodium.crypto_sign_detached(this._x25519.publicKey, this._ed25519.privateKey)
  }

  /**
   * 计算共享密钥（X25519）
   * 使用自己私钥和对方公钥进行密钥协商
   * 计算结果存储在实例中供后续加解密使用
   */
  computeSharedKey(peerPublicKey: Uint8Array): Uint8Array {
    if (!this._x25519)
      throw new Error('尚未初始化：请先调用 init()')
    this._sharedKey = sodium.crypto_scalarmult(this._x25519.privateKey, peerPublicKey)
    return this._sharedKey
  }

  /**
   * 使用共享密钥加密字符串消息（SecretBox）
   * 返回包含随机 nonce 和密文的对象
   */
  encrypt(message: string): { nonce: Uint8Array, ciphertext: Uint8Array } {
    if (!this._sharedKey)
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
    const plaintext = sodium.from_string(message)
    const ciphertext = sodium.crypto_secretbox_easy(plaintext, nonce, this._sharedKey)
    return { nonce, ciphertext }
  }

  /**
   * 使用共享密钥解密密文
   * 返回解密后的字符串消息
   */
  decrypt(ciphertext: Uint8Array, nonce: Uint8Array): string {
    if (!this._sharedKey)
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    const plaintext = sodium.crypto_secretbox_open_easy(ciphertext, nonce, this._sharedKey)
    return sodium.to_string(plaintext)
  }

  /**
   * 导出身份信息，用于群聊广播等
   * 包含身份公钥，DH 公钥和对应签名
   */
  exportPublicIdentity() {
    if (!this._ed25519 || !this._x25519)
      throw new Error('尚未初始化：请先调用 init()')
    return {
      ed25519PublicKey: this._ed25519.publicKey,
      dhPublicKey: this._x25519.publicKey,
      dhSignature: this.signDHPublicKey(),
    }
  }

  /**
   * 静态方法：验证对方 DH 公钥的签名是否有效
   * @param dhPublicKey 对方的 DH 公钥（Uint8Array）
   * @param signature 对方签名（Uint8Array）
   * @param ed25519PublicKey 对方的身份公钥（Uint8Array）
   */
  static verifyDHSignature(
    dhPublicKey: Uint8Array,
    signature: Uint8Array,
    ed25519PublicKey: Uint8Array,
  ): boolean {
    return sodium.crypto_sign_verify_detached(signature, dhPublicKey, ed25519PublicKey)
  }

  /**
   * 静态方法：Uint8Array 转换成 Hex
   */
  static uint8ArrayToHex(uint8Array: Uint8Array): string {
    return sodium.to_hex(uint8Array)
  }

  /**
   * 静态方法：Hex 转换成 Uint8Array
   */
  static hexToUint8Array(hexString: string): Uint8Array {
    return sodium.from_hex(hexString)
  }
}

// 懒汉式单例实例
let _instance: SecureChatService | null = null

/**
 * 获取单例实例
 * 如果没有实例则新建
 */
export function getSecureChatService(): SecureChatService {
  if (!_instance) {
    _instance = new SecureChatService()
  }
  return _instance
}
