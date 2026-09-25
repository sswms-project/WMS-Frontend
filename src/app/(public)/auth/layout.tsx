'use client'

import { useRouter } from 'next/navigation'
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  )
  useEffect(() => {
    if (hasHydrated && user) {
      router.replace(APP_ROUTES.dashboard)
    }
  }, [hasHydrated, router, user])

  return <>{children}</>
}
