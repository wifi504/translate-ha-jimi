import footNotesJson from '@/data/jsons/foot-notes.json'
import homeNoticeJson from '@/data/jsons/home-notice.json'
import keyNoticeJson from '@/data/jsons/key-notice.json'

export interface FootNotes {
  iconLinks: {
    iconSVG: string
    title: string
    href: string
  }[]
  textLinks: {
    title: string
    href: string
  }[]
}

export type Notice = NoticeItem[]
export interface NoticeItem {
  title: string
  textList: string[]
}

export const footNotes: FootNotes = footNotesJson
export const homeNotice: Notice = homeNoticeJson
export const keyNotice: Notice = keyNoticeJson
