import pako from 'pako'

const inflate = new pako.Inflate()
const chunks: Uint8Array[] = []

inflate.onData = (chunk: Uint8Array) => {
  chunks.push(new Uint8Array(chunk))
}

inflate.onEnd = () => {
  postMessage({ type: 'end', chunks })
}

globalThis.onmessage = (event) => {
  const { type, data } = event.data
  if (type === 'push') {
    postMessage({ type: 'progress', progress: data.length / 2 })
    inflate.push(data, false)
    postMessage({ type: 'progress', progress: data.length / 2 })
  }
  else if (type === 'flush') {
    inflate.push(new Uint8Array(0), true)
  }
}
