'use client'

import type { Route } from 'next'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { AccessControlMode } from '../../../types/tenant-access-control.types'

export type PersonalPermissionIntent =
  | { type: 'mode'; mode: AccessControlMode }
  | { type: 'role'; roleId: string }
  | { type: 'subject'; userId: string }
  | { type: 'navigation'; href: string }
  | { type: 'history' }

interface UseUnsavedPersonalNavigationOptions {
  readonly dirty: boolean
  readonly busy: boolean
  readonly onModeChange: (mode: AccessControlMode) => void
  readonly onRoleChange: (roleId: string) => void
  readonly onSubjectChange: (userId: string) => void
}

export function useUnsavedPersonalNavigation({
  dirty,
  busy,
  onModeChange,
  onRoleChange,
  onSubjectChange,
}: UseUnsavedPersonalNavigationOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const historyTraversal = useRef<'idle' | 'restoring' | 'leaving'>('idle')
  const [pendingIntent, setPendingIntent] = useState<PersonalPermissionIntent | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!dirty) return

    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const interceptNavigation = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank' || anchor.download)
        return
      const url = new URL(anchor.href, window.location.href)
      const href = `${url.pathname}${url.search}${url.hash}`
      if (url.origin !== window.location.origin || href === pathname) return

      event.preventDefault()
      event.stopPropagation()
      setPendingIntent({ type: 'navigation', href })
      setDialogOpen(true)
    }
    const interceptHistoryNavigation = () => {
      if (historyTraversal.current !== 'idle') {
        historyTraversal.current = 'idle'
        return
      }
      historyTraversal.current = 'restoring'
      window.history.forward()
      setPendingIntent({ type: 'history' })
      setDialogOpen(true)
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    window.addEventListener('popstate', interceptHistoryNavigation)
    document.addEventListener('click', interceptNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeUnload)
      window.removeEventListener('popstate', interceptHistoryNavigation)
      document.removeEventListener('click', interceptNavigation, true)
    }
  }, [dirty, pathname])

  function completeIntent(intent = pendingIntent) {
    if (!intent) return
    if (intent.type === 'mode') onModeChange(intent.mode)
    else if (intent.type === 'role') onRoleChange(intent.roleId)
    else if (intent.type === 'subject') onSubjectChange(intent.userId)
    else if (intent.type === 'navigation') router.push(intent.href as Route)
    else {
      historyTraversal.current = 'leaving'
      window.history.back()
    }
    setPendingIntent(null)
    setDialogOpen(false)
  }

  function requestIntent(intent: PersonalPermissionIntent) {
    if (busy) return
    if (!dirty) {
      completeIntent(intent)
      return
    }
    setPendingIntent(intent)
    setDialogOpen(true)
  }

  function changeDialogOpen(open: boolean) {
    setDialogOpen(open)
    if (!open) setPendingIntent(null)
  }

  return {
    dialogOpen,
    changeDialogOpen,
    completeIntent,
    requestIntent,
  }
}
