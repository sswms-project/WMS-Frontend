import { P } from '@/config/permissionCodes'
import { USER_ROLES } from '@/config/roles'
import { useMeQuery } from '@/features/auth/hooks/use-auth'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Quản lý kho và Chủ doanh nghiệp giao việc (cần quyền duyệt phiếu nhập như backend);
 * chỉ người được giao đích danh mới thực hiện nhận hàng hoặc cất hàng.
 */
export function useWarehouseTaskAssignmentAccess() {
  const user = useAuthStore((state) => state.user)
  const meQuery = useMeQuery()
  const permissions = meQuery.data?.permissions ?? []
  const isAssignerRole =
    user?.role === USER_ROLES.WarehouseManager || user?.role === USER_ROLES.TenantOwner

  return {
    currentUserId: user?.id ?? null,
    canAssign: isAssignerRole && permissions.includes(P.GOODS_RECEIPTS_APPROVE),
  }
}
