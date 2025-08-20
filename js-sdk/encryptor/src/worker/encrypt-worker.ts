import sodium from 'libsodium-wrappers'

let pushState: any | null = null
let outChunks: Uint8Array[] = []
let closed = false

function makeFramedChunk(frame: Uint8Array): Uint8Array {
  const len = frame.length
  const framed = new Uint8Array(4 + len)
  // 小端写入帧长度
  new DataView(framed.buffer).setUint32(0, len, true)
  framed.set(frame, 4)
  return framed
}

function postEnd() {
  postMessage({ type: 'end', chunks: outChunks })
  // 可以复用同一个 worker 实例
  outChunks = []
  pushState = null
  closed = true
}

globalThis.onmessage = async (event: MessageEvent) => {
  await sodium.ready
  const { type } = event.data

  if (type === 'init') {
    const key: Uint8Array = event.data.key
    const { state, header } = sodium.crypto_secretstream_xchacha20poly1305_init_push(key)
    pushState = state
    outChunks = []
    closed = false
    // 把 header 回给主线程
    postMessage({ type: 'header', header })
    return
  }

  if (!pushState || closed) {
    // 未初始化或已关闭，直接忽略
    return
  }

  if (type === 'push') {
    const chunk: Uint8Array = event.data.chunk
    postMessage({ type: 'progress', progress: chunk.length / 2 })
    const frame = sodium.crypto_secretstream_xchacha20poly1305_push(
      pushState,
      chunk,
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_MESSAGE,
    )
    outChunks.push(makeFramedChunk(frame))
    postMessage({ type: 'progress', progress: chunk.length / 2 })
    return
  }

  if (type === 'flush') {
    // 发送 FINAL 帧
    const finalFrame = sodium.crypto_secretstream_xchacha20poly1305_push(
      pushState,
      new Uint8Array(0),
      null,
      sodium.crypto_secretstream_xchacha20poly1305_TAG_FINAL,
    )
    outChunks.push(makeFramedChunk(finalFrame))
    postEnd()
  }
}
