import { useEffect, useEffectEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'

export function useProductImportNavigation(dirty: boolean, busy: boolean) {
  const router = useRouter()
  const canLeave = useEffectEvent(
    () => !busy && window.confirm('Tệp chưa nhập sẽ không được lưu. Bạn muốn rời trang?')
  )
  useEffect(() => {
    if (!dirty) return
    const originalUrl = window.location.href
    const originalState: unknown = window.history.state
    const unload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const click = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return
      const anchor = event.target.closest('a[href]')
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target === '_blank' ||
        anchor.download ||
        anchor.href === window.location.href
      )
        return
      if (!canLeave()) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const back = (event: PopStateEvent) => {
      const destination = window.location.href
      if (destination === originalUrl) return
      event.stopImmediatePropagation()
      // Restore this workspace before Next handles popstate. Leave only after consent.
      window.history.pushState(originalState, '', originalUrl)
      if (canLeave()) {
        const url = new URL(destination)
        router.push(`${url.pathname}${url.search}${url.hash}` as Route)
      }
    }
    window.addEventListener('beforeunload', unload)
    window.addEventListener('popstate', back, true)
    document.addEventListener('click', click, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      window.removeEventListener('popstate', back, true)
      document.removeEventListener('click', click, true)
    }
  }, [dirty, router])
}
