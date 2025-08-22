import FileWorker from '@/utils/file/file-worker?worker'

export function newFileWorker() {
  return new FileWorker() as Worker
}
