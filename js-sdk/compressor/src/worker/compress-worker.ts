import pako from 'pako'

const deflate = new pako.Deflate({ level: 6 })
const chunks: Uint8Array[] = []

deflate.onData = (chunk: Uint8Array) => {
  chunks.push(new Uint8Array(chunk))
}

deflate.onEnd = () => {
  postMessage({ type: 'end', chunks })
}

globalThis.onmessage = (event) => {
  const { type, data } = event.data
  if (type === 'push') {
    postMessage({ type: 'progress', progress: data.length / 2 })
    deflate.push(data, false)
    postMessage({ type: 'progress', progress: data.length / 2 })
  }
  else if (type === 'flush') {
    deflate.push(new Uint8Array(0), true)
  }
}
