// 日志
export default class Logger {
  private readonly _prefix: string
  private readonly _tag: string
  private _showInfo: boolean = true
  private _showWarn: boolean = true
  private _showError: boolean = true

  constructor(prefix: string) {
    this._prefix = prefix
    this._tag = this.genTag()
  }

  // 写成构思的设置日志级别，因为傻鸟Vue和ESLint不让用switch
  setLevel(value: 'OFF' | 'ERROR' | 'WARN' | 'INFO') {
    this._showError = true
    this._showWarn = true
    this._showInfo = true

    if (value === 'OFF') {
      this._showError = false
      this._showWarn = false
      this._showInfo = false
    }
    else if (value === 'ERROR') {
      this._showWarn = false
      this._showInfo = false
    }
    else if (value === 'WARN') {
      this._showInfo = false
    }
    else if (value === 'INFO') {
      // 全部保持 true
    }
    return this
  }
  // 傻鸟Vue和ESLint不让这么写，这明明叫利用特性...
  // setLevel(value: 'OFF' | 'ERROR' | 'WARN' | 'INFO') {
  //   this._showError = true
  //   this._showWarn = true
  //   this._showInfo = true
  //   switch (value) {
  //     case 'OFF':
  //       this._showError = false
  //     case 'ERROR':
  //       this._showWarn = false
  //     case 'WARN':
  //       this._showInfo = false
  //     case 'INFO':
  //       break
  //   }
  // }

  info(...args: any[]) {
    if (this._showInfo) {
      console.log(this.formatPrefix('info'), ...args)
    }
  }

  warn(...args: any[]) {
    if (this._showWarn) {
      console.warn(this.formatPrefix('warn'), ...args)
    }
  }

  error(...args: any[]) {
    if (this._showError) {
      console.error(this.formatPrefix('error'), ...args)
    }
  }

  // [prefix][yyyy-MM-dd HH:mm:ss SSS][abcd1234][type]
  private formatPrefix(type: string): string {
    return `[${this._prefix}][${this.formatCurrentTime()}][${this._tag}][${type}]`
  }

  /**
   * 格式化输出当前时间
   *
   * @return 当前时间
   */
  private formatCurrentTime(): string {
    const date = new Date()

    // 提取各时间部分并补零
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    // 拼接成目标格式
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${milliseconds}`
  }

  /**
   * 生成Tag
   *
   * @return 8位随机字符串
   */
  private genTag(): string {
    // 定义字符集：大小写字母 + 数字
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    const length = 8

    for (let i = 0; i < length; i++) {
      // 随机从字符集中选取一个字符
      const randomIndex = Math.floor(Math.random() * charset.length)
      result += charset[randomIndex]
    }

    return result
  }
}
