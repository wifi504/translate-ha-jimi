import footNotesJson from '@/data/jsons/foot-notes.json'

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

export const footNotes: FootNotes = footNotesJson
