'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth.store'
import { AppRouteSkeleton } from '@/components/AppRouteSkeleton'
import { getDashboardRouteForRole } from '../utils/role-routes'

export function DashboardRedirect() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (user) router.replace(getDashboardRouteForRole(user.role))
  }, [user, router])

  return <AppRouteSkeleton />
}
