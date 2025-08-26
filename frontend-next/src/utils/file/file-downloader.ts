import streamSaver from 'streamsaver'

streamSaver.mitm = `/${import.meta.env.VITE_BASEURL}lib/streamsaver/mitm.html`

export type DownloaderStatus = 'NEW' | 'WRITING' | 'CLOSE'

export default class FileDownloader {
  private _writableStream: WritableStream<Uint8Array>
  private _writer: WritableStreamDefaultWriter<Uint8Array>
  private _queue: { data: Uint8Array, final: boolean }[] = []
  private _writing = false
  private _status: DownloaderStatus = 'NEW'

  public onClose: (() => void) | null = null

  constructor(fileName: string) {
    this._writableStream = streamSaver.createWriteStream(fileName)
    this._writer = this._writableStream.getWriter()
  }

  get status(): DownloaderStatus {
    return this._status
  }

  save(data: Uint8Array, isFinal: boolean = false) {
    this._queue.push({ data, final: isFinal })
    if (!this._writing) {
      this._processQueue().catch(e => console.error('流写入失败！', e))
    }
  }

  private async _processQueue() {
    this._writing = true
    this._status = 'WRITING'

    while (this._queue.length > 0) {
      const { data, final } = this._queue.shift()!
      await this._writer.write(data)

      if (final) {
        await this._writer.close()
        this._status = 'CLOSE'
        this._writing = false

        if (this.onClose) {
          try {
            this.onClose()
          }
          catch (err) {
            console.error('onClose callback error:', err)
          }
        }
        return
      }
    }

    this._writing = false
  }
}
