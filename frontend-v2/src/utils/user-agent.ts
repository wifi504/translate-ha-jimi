import type { Component, ShallowRef } from 'vue'

function isMobileUA(ua: string): boolean {
  return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

export function updatePage(phoneComponent: Component, pcComponent: Component, shallowRef: ShallowRef<Component>): void {
  const ua = navigator.userAgent
  if (isMobileUA(ua)) {
    shallowRef.value = phoneComponent
  }
  else {
    shallowRef.value = pcComponent
  }
}
