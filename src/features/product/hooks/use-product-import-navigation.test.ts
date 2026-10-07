import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useProductImportNavigation } from './use-product-import-navigation'

const push = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function traversal(navigation: EventTarget, cancelable = true) {
  const event = new Event('navigate', { cancelable })
  Object.defineProperties(event, {
    navigationType: { value: 'traverse' },
    destination: { value: { sameDocument: true, url: 'http://localhost/products' } },
  })
  navigation.dispatchEvent(event)
  return event
}

describe('product import browser navigation', () => {
  it('cancels before history changes and removes the listener on unmount', () => {
    const navigation = new EventTarget()
    vi.stubGlobal('navigation', navigation)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const history = vi.spyOn(window.history, 'pushState')
    const hook = renderHook(() => useProductImportNavigation(true, false))
    expect(traversal(navigation).defaultPrevented).toBe(true)
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(history).not.toHaveBeenCalled()
    hook.unmount()
    expect(traversal(navigation).defaultPrevented).toBe(false)
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('allows consent without rewriting history or asking again on popstate', () => {
    const navigation = new EventTarget()
    vi.stubGlobal('navigation', navigation)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const history = vi.spyOn(window.history, 'pushState')
    renderHook(() => useProductImportNavigation(true, false))
    expect(traversal(navigation).defaultPrevented).toBe(false)
    window.dispatchEvent(new PopStateEvent('popstate'))
    expect(confirm).toHaveBeenCalledTimes(1)
    expect(history).not.toHaveBeenCalled()
  })

  it('uses the latest busy state without losing the subscription', () => {
    const navigation = new EventTarget()
    vi.stubGlobal('navigation', navigation)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    const hook = renderHook(({ busy }) => useProductImportNavigation(true, busy), {
      initialProps: { busy: true },
    })
    expect(traversal(navigation).defaultPrevented).toBe(true)
    expect(confirm).not.toHaveBeenCalled()
    hook.rerender({ busy: false })
    expect(traversal(navigation).defaultPrevented).toBe(false)
    expect(confirm).toHaveBeenCalledTimes(1)
  })

  it('ignores clean workspaces and non-cancelable traversals', () => {
    const navigation = new EventTarget()
    vi.stubGlobal('navigation', navigation)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const hook = renderHook(({ dirty }) => useProductImportNavigation(dirty, false), {
      initialProps: { dirty: false },
    })
    expect(traversal(navigation).defaultPrevented).toBe(false)
    hook.rerender({ dirty: true })
    expect(traversal(navigation, false).defaultPrevented).toBe(false)
    expect(confirm).not.toHaveBeenCalled()
  })
})
