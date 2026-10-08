import { useEffect, useEffectEvent } from 'react'
import { useRouter } from 'next/navigation'
import type { Route } from 'next'

export function useImportNavigation(dirty: boolean, busy: boolean) {
  const router = useRouter()
  const canLeave = useEffectEvent(
    () => !busy && window.confirm('Tệp chưa nhập sẽ không được lưu. Bạn muốn rời trang?')
  )
  useEffect(() => {
    if (!dirty) return
    const originalUrl = window.location.href
    const originalState: unknown = window.history.state
    const navigation = window.navigation
    let nativeTraversal = false
    const traverse = (event: NavigateEvent) => {
      if (
        event.defaultPrevented ||
        event.navigationType !== 'traverse' ||
        !event.cancelable ||
        !event.destination.sameDocument ||
        event.destination.url === originalUrl
      )
        return
      // Ask before the URL changes so cancellation preserves the Forward stack.
      nativeTraversal = canLeave()
      if (!nativeTraversal) event.preventDefault()
    }
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
      if (nativeTraversal) {
        nativeTraversal = false
        return
      }
      const destination = window.location.href
      if (destination === originalUrl) return
      event.stopImmediatePropagation()
      const allowed = canLeave()
      // Restore this workspace before Next handles popstate. Leave only after consent.
      window.history.pushState(originalState, '', originalUrl)
      if (allowed) {
        const url = new URL(destination)
        router.push(`${url.pathname}${url.search}${url.hash}` as Route)
      }
    }
    window.addEventListener('beforeunload', unload)
    navigation?.addEventListener('navigate', traverse)
    window.addEventListener('popstate', back, true)
    document.addEventListener('click', click, true)
    return () => {
      window.removeEventListener('beforeunload', unload)
      navigation?.removeEventListener('navigate', traverse)
      window.removeEventListener('popstate', back, true)
      document.removeEventListener('click', click, true)
    }
  }, [dirty, router])
}
