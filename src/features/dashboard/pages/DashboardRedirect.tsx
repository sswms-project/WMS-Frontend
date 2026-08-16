'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { getDashboardRouteForRole } from '../utils/role-routes'

export function DashboardRedirect() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) router.replace(getDashboardRouteForRole(user.role))
  }, [user, router])

  return (
    <div className="flex h-64 items-center justify-center">
      <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
    </div>
  )
}
