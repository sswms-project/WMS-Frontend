'use client'

import { useSyncExternalStore } from 'react'

const DESIGNER_DESKTOP_BREAKPOINT = 1024

function subscribe(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia(`(max-width: ${DESIGNER_DESKTOP_BREAKPOINT - 1}px)`)
  mediaQuery.addEventListener('change', onStoreChange)
  return () => mediaQuery.removeEventListener('change', onStoreChange)
}

function getSnapshot() {
  return window.innerWidth < DESIGNER_DESKTOP_BREAKPOINT
}

export function useLayoutDesignerCompact() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
