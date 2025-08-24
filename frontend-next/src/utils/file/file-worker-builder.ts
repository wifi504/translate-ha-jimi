import FileWorker from './file-worker?worker'

export function newFileWorker(): Worker {
  return new FileWorker()
}
