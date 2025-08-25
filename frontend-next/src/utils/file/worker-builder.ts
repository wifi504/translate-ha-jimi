import FileWorker from './file-worker?worker'
import GCWorker from './gc-worker?worker'

export function newFileWorker(): Worker {
  return new FileWorker()
}

export function newGCWorker(): Worker {
  return new GCWorker()
}
