'use client'
import { useEffect, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
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

export function ProtectedRoute({ children }: { readonly children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const hasHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot
  )

  useEffect(() => {
    if (hasHydrated && !user) router.replace(APP_ROUTES.auth.login)
  }, [hasHydrated, user, router])

  if (!hasHydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null
  return <>{children}</>
}
