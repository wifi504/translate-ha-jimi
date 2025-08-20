# hayalib.js 哈呀库文档

## 1 库结构

- `hayalib` 合并导出
  - `@hayalib/compressor` 哈基压缩器
  - `@hayalib/encoder` 哈基编解码器
  - `@hayalib/encryptor` 哈基加密器
  - `@hayalib/files` 基密文件处理器
  - `@hayalib/hajihash` 哈基函数
  - `@hayalib/utils` 哈基工具

## 2 文档

### `@hayalib/compressor` 哈基压缩器

#### 直接压缩

```typescript
export function compress(data: Uint8Array): Uint8Array
```

Params:
data – 被压缩的数据
Returns:
压缩后的数据

#### 直接解压

```typescript
export function decompress(data: Uint8Array): Uint8Array
```

Params:
data – 被解压的数据
Returns:
解压后的数据

#### 初始化压缩流

```typescript
export function initCompression(level: Level = 6): CompressState
```

Params:
level – 压缩等级

#### 初始化解压流

```typescript
export function initDecompression(): CompressState
```

#### 压缩分片文件

```typescript
export function compressChunk(
  state: CompressState,
  chunk: Uint8Array,
  isFinal: boolean = false,
): Uint8Array
```

Params:
state – 压缩上下文
chunk – 文件分片数据
isFinal – 是否为最后一个分片
Returns:
Uint8Array 压缩后的分片数据

#### 解压分片文件

```typescript
export function decompressChunk(
  state: CompressState,
  chunk: Uint8Array,
  isFinal: boolean = false,
): Uint8Array
```

Params:
state – 压缩上下文
chunk – 文件分片数据
isFinal – 是否为最后一个分片

### `@hayalib/encoder` 哈基编解码器

#### 自定义对照字典

```typescript
export function customDictionary(dictionary: string): void
```

Params:
dictionary – 一串不重复的字符串，长度必须为256位

#### 自定义哈基米装饰符

```typescript
export function customDecoration(newDecoration: string): void
```

Params:
newDecoration – 一串用"|"分隔的装饰符，不能在对照字典重复

#### 将原始数据编码成“哈基密文”字符串

```typescript
export function encode(bytes: Uint8Array, prefix?: string): string
```

Params:
bytes – Uint8Array 数据
prefix – 可选的结果前缀

#### 将“哈基密文”字符串解码成原始数据

```typescript
export function decode(text: string): Uint8Array
```

Params:
text – 哈基密文

### `@hayalib/encryptor` 哈基加密器

#### 初始化哈基米加密器

```typescript
export async function init()
```

#### 生成DH密钥对（x25519）

```typescript
export function dhKeypair(): KeyPair
```

#### 生成签名密钥对（ed25519）

```typescript
export function signKeypair(): KeyPair
```

#### 导出签名身份信息（DH公钥、签名的公钥、DH公钥的签名）

```typescript
export function exportPublicIdentity(
  dhKeypair: KeyPair,
  signKeypair: KeyPair,
): Identity
```

Params:
dhKeypair – DH密钥对
signKeypair – 签名密钥对

#### 验证身份信息签名

```typescript
export function verifyPublicIdentity(identity: Identity): boolean
```

Params:
identity – 身份信息

#### 计算共享密钥

```typescript
export function computeSharedKey(
  dhPrivateKey: Uint8Array,
  peerDhPublicKey: Uint8Array,
): Uint8Array
```

Params:
dhPrivateKey – DH私钥
peerDhPublicKey – 对方DH公钥

#### 使用密钥进行对称加密

```typescript
export function encrypt(plainData: Uint8Array, key: Uint8Array): Secret
```

Params:
plainData – 明文数据
key – 密钥

#### 使用密钥解密

```typescript
export function decrypt(secret: Secret, key: Uint8Array): Uint8Array
```

Params:
secret – 密文对象
key – 密钥
Returns:
明文数据

#### 初始化加密流

```typescript
export function initEncryption(key: Uint8Array): {
  state: EncryptState
  header: Uint8Array
}
```

Params:
key – 加密密钥
Returns:
包含初始状态和头部的对象

#### 初始化解密流

```typescript
export function initDecryption(key: Uint8Array, header: Uint8Array): EncryptState
```

Params:
key – 解密密钥
header – 加密时生成的头部
Returns:
解密状态

#### 加密文件分片

```typescript
export function encryptChunk(
  state: EncryptState,
  chunk: Uint8Array,
  isFinal: boolean = false,
): Uint8Array
```

Params:
state – 加密状态
chunk – 文件分片数据
isFinal – 是否为最后一个分片
Returns:
加密后的分片数据

#### 解密文件分片

```typescript
export function decryptChunk(
  state: EncryptState,
  encryptedChunk: Uint8Array,
): {
  data: Uint8Array
  isFinal: boolean
}
```

Params:
state – 解密状态
encryptedChunk – 加密的分片数据
Returns:
包含解密数据和是否为最后一个分片的对象

### `@hayalib/files` 基密文件处理器

#### 处理文件上传，判断文件是普通文件还是基密文件，处理完毕后下载

```typescript
export function handleFileUpload(file: File, sharedKey: Uint8Array | null, onProgress?: (percent: number) => void): Promise<void>
```

Params:
file – 浏览器上传的文件
sharedKey – chacha20 的加密密钥，如果传 null 则纯压缩
onProgress – 可选对进度回调

### `@hayalib/hajihash` 哈基函数

#### 根据输入获取完整哈基摘要

```typescript
export function sha256(message: Message): Uint8Array
```

Params:
message – 任意消息 string | number[] | ArrayBuffer | Uint8Array
Returns:
完整长度的哈基摘要

#### 根据输入获取哈基校验词

```typescript
export function checkWord(message: Message): Uint8Array
```

Params:
message – 任意消息 string | number[] | ArrayBuffer | Uint8Array
Returns:
两位校验位

#### 根据完整哈基摘要校验输入

```typescript
export function verifySha256(message: Message, hash: Uint8Array): boolean
```

Params:
message – 任意消息 string | number[] | ArrayBuffer | Uint8Array
hash – 完整长度的哈基摘要
Returns:
校验结果(boolean)

#### 根据哈基校验词校验输入

```typescript
export function verifyCheckWord(message: Message, hash: Uint8Array): boolean
```

Params:
message – 任意消息 string | number[] | ArrayBuffer | Uint8Array
hash – 哈基校验词
Returns:
校验结果(boolean)

### `@hayalib/utils` 哈基工具

#### 字符串 --转换-> Uint8Array (UTF-8)

```typescript
export function stringToUint8Array(str: string): Uint8Array
```

Params:
str – 字符串

#### Uint8Array --转换-> 字符串 (UTF-8)

```typescript
export function uint8ArrayToString(arr: Uint8Array): string
```

Params:
arr – Uint8Array

#### Uint8Array --转换-> Hex

```typescript
export function uint8ArrayToHex(arr: Uint8Array): string
```

Params:
arr – Uint8Array

#### Hex --转换-> Uint8Array

```typescript
export function hexToUint8Array(hex: string): Uint8Array
```

Params:
hex – Hex

#### 对象 --转换-> Uint8Array

```typescript
export function objectToUint8Array(obj: any): Uint8Array
```

Params:
obj – 对象

#### Uint8Array --转换-> 对象

```typescript
export function uint8ArrayToObject(arr: Uint8Array): any
```

Params:
arr – Uint8Array

#### 合并多个 Uint8Array

```typescript
export function mergeUint8Arrays(chunks: Uint8Array[]): Uint8Array
```

Params:
chunks – Uint8Array[]

#### 打包元数据

```typescript
export function packData(payload: Uint8Array, meta: any): Uint8Array
```

Params:
payload – 载荷数据
meta – 可以被JSON序列化的元数据对象

#### 解包元数据

```typescript
export function unpackData(packed: Uint8Array): {
  meta: any
  payload: Uint8Array
}
```

Params:
packed – 打包数据
