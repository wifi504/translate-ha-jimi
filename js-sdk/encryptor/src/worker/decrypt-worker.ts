import sodium from 'libsodium-wrappers'

let pullState: any | null = null
let buffer = new Uint8Array(0)
let outChunks: Uint8Array[] = []
let ended = false

function appendBuffer(data: Uint8Array) {
  const merged = new Uint8Array(buffer.length + data.length)
  merged.set(buffer, 0)
  merged.set(data, buffer.length)
  buffer = merged
}

function dataViewOf(u8: Uint8Array) {
  return new DataView(u8.buffer, u8.byteOffset, u8.byteLength)
}

function tryParseFramesAndDecrypt() {
  while (true) {
    if (buffer.length < 4) return // 不足以读长度
    const dv = dataViewOf(buffer)
    const len = dv.getUint32(0, true) // LE32
    if (buffer.length < 4 + len) return // 帧还没完整到达

    const frame = buffer.subarray(4, 4 + len)
    buffer = buffer.subarray(4 + len)

    const pulled = sodium.crypto_secretstream_xchacha20poly1305_pull(pullState!, frame)
    if (!pulled) {
      // 认证失败
      postMessage({ type: 'error', message: '解密失败: 无效帧或密钥错误' })
      // 清理
      pullState = null
      buffer = new Uint8Array(0)
      outChunks = []
      ended = true
      return
    }

    const { message, tag } = pulled as { message: Uint8Array, tag: number }
    if (message && message.length) {
      outChunks.push(message)
    }

    if (tag === sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL) {
      // 终帧
      postMessage({ type: 'end', chunks: outChunks })
      // 清理
      pullState = null
      buffer = new Uint8Array(0)
      outChunks = []
      ended = true
      return
    }
  }
}

globalThis.onmessage = async (event: MessageEvent) => {
  await sodium.ready
  const { type } = event.data

  if (type === 'init') {
    const key: Uint8Array = event.data.key
    const header: Uint8Array = event.data.header
    pullState = sodium.crypto_secretstream_xchacha20poly1305_init_pull(header, key)
    buffer = new Uint8Array(0)
    outChunks = []
    ended = false
    return
  }

  if (!pullState || ended) {
    return
  }

  if (type === 'push') {
    const chunk: Uint8Array = event.data.chunk
    postMessage({ type: 'progress', progress: chunk.length / 2 })
    appendBuffer(chunk)
    tryParseFramesAndDecrypt()
    postMessage({ type: 'progress', progress: chunk.length / 2 })
    return
  }

  if (type === 'flush') {
    // 再尝试一次解析（如果正好在 flush 前拼上完整帧）
    tryParseFramesAndDecrypt()
    if (!ended) {
      // 如果没有 FINAL 也返回（容错）
      postMessage({ type: 'end', chunks: outChunks })
      // 清理
      pullState = null
      buffer = new Uint8Array(0)
      outChunks = []
      ended = true
    }
  }
}
