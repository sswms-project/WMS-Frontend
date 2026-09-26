'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useSyncExternalStore } from 'react'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'

function subscribeToHydration(onStoreChange: () => void) {
  if (useAuthStore.persist.hasHydrated()) return () => undefined
  return useAuthStore.persist.onFinishHydration(onStoreChange)
}

function getHydrationSnapshot() {
  return useAuthStore.persist.hasHydrated()
}

function getServerHydrationSnapshot() {
  return false
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  )
  const isHome = pathname === APP_ROUTES.home

  useEffect(() => {
    if (hasHydrated && isHome && user) {
      router.replace(APP_ROUTES.dashboard)
    }
  }, [hasHydrated, isHome, router, user])

  if (hasHydrated && isHome && user) return null

  return <>{children}</>
}
