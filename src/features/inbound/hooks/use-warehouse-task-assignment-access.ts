import { P } from '@/config/permissionCodes'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'

export function useWarehouseTaskAssignmentAccess() {
  const user = useAuthStore((state) => state.user)
  const meQuery = useMeQuery()
  const permissions = meQuery.data?.permissions ?? []

  return {
    currentUserId: user?.id ?? null,
    canAssign: permissions.includes(P.GOODS_RECEIPTS_APPROVE),
  }
}
