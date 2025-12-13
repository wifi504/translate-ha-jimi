import { streamXOR } from '@stablelib/chacha'
import sodium from 'libsodium-wrappers'
import { MlKem768 } from 'mlkem'
/**
 * 哈基密语端到端加密通信服务
 *
 * @author WIFI连接超时
 * @version 1.0
 * Create Time 2025/7/29_00:55
 */
export class SecureChatService {
  // Ed25519 签名密钥对：身份认证和签名
  private _ed25519?: sodium.KeyPair

  // X25519 密钥对：Diffie-Hellman 密钥交换
  private _x25519?: sodium.KeyPair

  // ML-KEM (Kyber) key pair: PQC Key Encapsulation
  private _mlkemPublicKey?: Uint8Array
  private _mlkemSecretKey?: Uint8Array
  private readonly _mlkem = new MlKem768()

  // 对称加密密钥
  private _sharedKey?: Uint8Array

  // libsodium 初始化
  private _isReady = false

  // 写死的nonce，只在追求极限压缩的时候用
  private readonly _fixedNonce = new Uint8Array(8).fill(0)

  constructor() {
  }

  /**
   * 初始化 libsodium 和生成密钥对
   * 这个方法必须手动且仅需要调用一次
   */
  async init() {
    if (this._isReady) {
      return
    }
    // 等待 libsodium 加载完成（WebAssembly）
    await sodium.ready
    // 身份密钥
    this._ed25519 = sodium.crypto_sign_keypair()
    // DH密钥
    this._x25519 = sodium.crypto_box_keypair()

    // PQC: ML-KEM-768 keypair (async)
    const [pk, sk] = await this._mlkem.generateKeyPair()
    this._mlkemPublicKey = pk
    this._mlkemSecretKey = sk

    this._isReady = true
  }

  /**
   * 获取 Ed25519 公钥（用于身份认证对外公布）
   */
  get ed25519PublicKey(): Uint8Array {
    if (!this._ed25519) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return this._ed25519.publicKey
  }

  /**
   * 获取 X25519 公钥（用于共享密钥协商）
   */
  get x25519PublicKey(): Uint8Array {
    if (!this._x25519) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return this._x25519.publicKey
  }

  // Get the ML-KEM-768 public key
  get mlkem768PublicKey(): Uint8Array {
    if (!this._mlkemPublicKey) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return this._mlkemPublicKey
  }

  /**
   * 签名自己的 X25519 公钥
   * 用于发送给对方，确保公钥真实性（防止中间人攻击）
   */
  signDHPublicKey(): Uint8Array {
    if (!this._ed25519 || !this._x25519) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return sodium.crypto_sign_detached(
      this._x25519.publicKey,
      this._ed25519.privateKey,
    )
  }

  private static readonly _HANDSHAKE_PQC_PREFIX = 'hajimi-handshake-v2'
  static readonly HANDSHAKE_PQC_KEM_ALG = 'ml-kem-768'
  private static readonly _PQC_KDF_SALT = 'hajimi-pqc-v2'

  private static buildHandshakeV2Message(
    dhPublicKey: Uint8Array,
    kemPublicKey: Uint8Array,
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ): Uint8Array {
    const prefixBytes = new TextEncoder().encode(
      SecureChatService._HANDSHAKE_PQC_PREFIX,
    )
    const kemAlgBytes = new TextEncoder().encode(kemAlg)
    // Fixed-length keys, but we still include context + kemAlg to avoid cross-protocol confusion.
    const msg = new Uint8Array(
      prefixBytes.length
      + 1
      + kemAlgBytes.length
      + dhPublicKey.length
      + kemPublicKey.length,
    )
    let o = 0
    msg.set(prefixBytes, o)
    o += prefixBytes.length
    msg[o++] = 0
    msg.set(kemAlgBytes, o)
    o += kemAlgBytes.length
    msg.set(dhPublicKey, o)
    o += dhPublicKey.length
    msg.set(kemPublicKey, o)
    return msg
  }

  // Sign X25519 public key + ML-KEM public key
  signHandshakePublicKeysPQC(
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ): Uint8Array {
    if (!this._ed25519 || !this._x25519 || !this._mlkemPublicKey) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    const msg = SecureChatService.buildHandshakeV2Message(
      this._x25519.publicKey,
      this._mlkemPublicKey,
      kemAlg,
    )
    return sodium.crypto_sign_detached(msg, this._ed25519.privateKey)
  }

  /**
   * 计算共享密钥（X25519）
   * 使用自己私钥和对方公钥进行密钥协商
   * 计算结果存储在实例中供后续加解密使用
   */
  computeSharedKey(peerPublicKey: Uint8Array): Uint8Array {
    if (!this._x25519) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    // ECDH协议在椭圆曲线 Curve25519 上的实现
    // 公共参数：曲线 E 和基点 G
    // 双方私钥：标量 a b
    // 双方公钥：A=aG  B=bG
    // 协商结果：K=aB=bA=abG
    this._sharedKey = sodium.crypto_scalarmult(
      this._x25519.privateKey,
      peerPublicKey,
    )
    return this._sharedKey
  }

  private static async hkdfSha256(
    ikm: Uint8Array,
    salt: Uint8Array,
    info: Uint8Array,
    length: number,
  ): Promise<Uint8Array> {
    const ikmCopy = new Uint8Array(ikm)
    const saltCopy = new Uint8Array(salt)
    const infoCopy = new Uint8Array(info)

    const key = await crypto.subtle.importKey('raw', ikmCopy, 'HKDF', false, [
      'deriveBits',
    ])
    const bits = await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: saltCopy, info: infoCopy },
      key,
      length * 8,
    )
    return new Uint8Array(bits)
  }

  async computePqcHybridSharedKeyAsResponder(
    peerDhPublicKey: Uint8Array,
    peerKemPublicKey: Uint8Array,
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ): Promise<{ sharedKey: Uint8Array, kemCipherText: Uint8Array }> {
    if (!this._x25519 || !this._mlkemSecretKey) {
      throw new Error('尚未初始化：请先调用 init()')
    }

    const xShared = sodium.crypto_scalarmult(
      this._x25519.privateKey,
      peerDhPublicKey,
    )
    const [cipherText, pqShared] = await this._mlkem.encap(peerKemPublicKey)

    const ikm = new Uint8Array(xShared.length + pqShared.length)
    ikm.set(xShared, 0)
    ikm.set(pqShared, xShared.length)

    const salt = new TextEncoder().encode(SecureChatService._PQC_KDF_SALT)
    const info = new TextEncoder().encode(`x25519+${kemAlg}`)
    this._sharedKey = await SecureChatService.hkdfSha256(ikm, salt, info, 32)
    return { sharedKey: this._sharedKey, kemCipherText: cipherText }
  }

  async computePqcHybridSharedKeyAsInitiator(
    peerDhPublicKey: Uint8Array,
    peerKemPublicKey: Uint8Array,
    peerKemCipherText: Uint8Array,
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ): Promise<Uint8Array> {
    if (!this._x25519 || !this._mlkemSecretKey) {
      throw new Error('尚未初始化：请先调用 init()')
    }

    void peerKemPublicKey

    const xShared = sodium.crypto_scalarmult(
      this._x25519.privateKey,
      peerDhPublicKey,
    )
    const pqShared = await this._mlkem.decap(
      peerKemCipherText,
      this._mlkemSecretKey,
    )

    const ikm = new Uint8Array(xShared.length + pqShared.length)
    ikm.set(xShared, 0)
    ikm.set(pqShared, xShared.length)

    const salt = new TextEncoder().encode(SecureChatService._PQC_KDF_SALT)
    const info = new TextEncoder().encode(`x25519+${kemAlg}`)
    this._sharedKey = await SecureChatService.hkdfSha256(ikm, salt, info, 32)
    return this._sharedKey
  }

  /**
   * 使用共享密钥加密字符串消息（SecretBox），带校验，防篡改
   * 返回包含随机 nonce（12位） 和密文的对象
   */
  encryptAEAD(message: string): { nonce: Uint8Array, ciphertext: Uint8Array } {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    // AEAD：带有关联数据的身份验证加密（Authenticated Encryption with Associated Data）
    // ChaCha20：流加密替代AES提高效率
    // Poly1305：消息认证码MAC，保证密文是没有被篡改的
    // ietf：对上面算法选择的规范，HTTP/2、TLS 1.3、QUIC啥的都用的这个，用就完了
    // 安全了，但是体积太长了
    // 这里的随机nonce目前考虑到密文长度问题，用的12位，其实安全程度肯定够用了
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES)
    const plaintext = sodium.from_string(message)
    const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      plaintext,
      null,
      null,
      nonce,
      this._sharedKey,
    )
    return { nonce, ciphertext }
  }

  /**
   * 使用共享密钥解密密文（校验过的那个密文，不是普通密文）
   * 返回解密后的字符串消息
   */
  decryptAEAD(ciphertext: Uint8Array, nonce: Uint8Array): string {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    const plaintext = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      null,
      nonce,
      this._sharedKey,
    )
    return sodium.to_string(plaintext)
  }

  /**
   * 使用共享密钥加密字符串消息，直接 ChaCha20 流式加密
   * 无完整性校验、带盐（8位nonce）
   */
  encryptRaw(message: string): { nonce: Uint8Array, ciphertext: Uint8Array } {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    const nonce = sodium.randombytes_buf(8)
    const plaintext = sodium.from_string(message)
    const dst = new Uint8Array(plaintext.length)

    const ciphertext = streamXOR(this._sharedKey, nonce, plaintext, dst)
    return { nonce, ciphertext }
  }

  /**
   * 使用共享密钥解密密文（普通密文带盐）
   * 返回解密后的字符串消息
   */
  decryptRaw(ciphertext: Uint8Array, nonce: Uint8Array): string {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    const dst = new Uint8Array(ciphertext.length)
    // stream cipher 对称加密 加密两次可还原
    const plaintext = streamXOR(this._sharedKey, nonce, ciphertext, dst)
    return sodium.to_string(plaintext)
  }

  /**
   * 固定 nonce 的 ChaCha20 加密（无认证）
   */
  encryptRawFixedNonce(message: string): Uint8Array {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    const plaintext = new TextEncoder().encode(message)
    const ciphertext = new Uint8Array(plaintext.length)
    return streamXOR(this._sharedKey, this._fixedNonce, plaintext, ciphertext)
  }

  /**
   * 固定 nonce 的 ChaCha20 解密（无认证）
   */
  decryptRawFixedNonce(ciphertext: Uint8Array): string {
    if (!this._sharedKey) {
      throw new Error('共享密钥未建立：请先调用 computeSharedKey()')
    }
    const plaintext = new Uint8Array(ciphertext.length)
    const decrypted = streamXOR(this._sharedKey, this._fixedNonce, ciphertext, plaintext)
    return new TextDecoder().decode(decrypted)
  }

  /**
   * 导出身份信息，用于群聊广播等
   * 包含身份公钥，DH 公钥和对应签名
   */
  exportPublicIdentity() {
    if (!this._ed25519 || !this._x25519) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return {
      ed25519PublicKey: this._ed25519.publicKey,
      dhPublicKey: this._x25519.publicKey,
      dhSignature: this.signDHPublicKey(),
    }
  }

  // PQC: Export identity information (includes PQC public key + combined signature)
  exportPublicIdentityPQC(
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ) {
    if (!this._ed25519 || !this._x25519 || !this._mlkemPublicKey) {
      throw new Error('尚未初始化：请先调用 init()')
    }
    return {
      v: 2 as const,
      kemAlg,
      ed25519PublicKey: this._ed25519.publicKey,
      dhPublicKey: this._x25519.publicKey,
      kemPublicKey: this._mlkemPublicKey,
      handshakeSignature: this.signHandshakePublicKeysPQC(kemAlg),
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
    return sodium.crypto_sign_verify_detached(
      signature,
      dhPublicKey,
      ed25519PublicKey,
    )
  }

  // PQC: Verify signature
  static async verifyHandshakeSignaturePQC(
    dhPublicKey: Uint8Array,
    kemPublicKey: Uint8Array,
    signature: Uint8Array,
    ed25519PublicKey: Uint8Array,
    kemAlg: string = SecureChatService.HANDSHAKE_PQC_KEM_ALG,
  ): Promise<boolean> {
    await sodium.ready
    const msg = SecureChatService.buildHandshakeV2Message(
      dhPublicKey,
      kemPublicKey,
      kemAlg,
    )
    return sodium.crypto_sign_verify_detached(signature, msg, ed25519PublicKey)
  }

  /**
   * 静态方法，传入共享密钥加密字符串消息（SecretBox），带校验，防篡改
   * 返回包含随机 nonce（12位） 和密文的对象
   */
  static encryptByKeyAEAD(message: string | Uint8Array, sharedKey: Uint8Array): { nonce: Uint8Array, ciphertext: Uint8Array } {
    const nonce = sodium.randombytes_buf(sodium.crypto_aead_chacha20poly1305_ietf_NPUBBYTES)
    let messageData: string | Uint8Array
    if (typeof message === 'string') {
      messageData = sodium.from_string(message)
    }
    else {
      messageData = message
    }
    const ciphertext = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      messageData,
      null,
      null,
      nonce,
      sharedKey,
    )
    return { nonce, ciphertext }
  }

  /**
   * 静态方法，传入密钥解密密文（校验过的那个密文，不是普通密文）
   * 返回解密后的字符串消息
   */
  static decryptByKeyAEAD(ciphertext: Uint8Array, nonce: Uint8Array, sharedKey: Uint8Array, raw: boolean = false): string | Uint8Array {
    const plaintext = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null,
      ciphertext,
      null,
      nonce,
      sharedKey,
    )
    if (raw) {
      return plaintext
    }
    return sodium.to_string(plaintext)
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
