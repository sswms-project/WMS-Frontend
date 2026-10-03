import { useState } from 'react'
import { AlertCircle, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { PermissionResponse } from '../../types/admin.types'
import { groupAdminPermissions } from '../../utils/permission-catalog'
import { PermissionCatalog } from './PermissionCatalog'

interface PermissionsCatalogProps {
  readonly permissions: PermissionResponse[]
  readonly isLoading: boolean
  readonly isError: boolean
  readonly onRetry: () => void
}

export function PermissionsCatalog({
  permissions,
  isLoading,
  isError,
  onRetry,
}: PermissionsCatalogProps) {
  const [search, setSearch] = useState('')
  const groups = groupAdminPermissions(permissions)

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-3">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-foreground text-sm font-semibold">Danh mục quyền</h2>
          <p className="text-muted-foreground mt-1 text-xs">{permissions.length} quyền hệ thống</p>
        </div>
        <div className="relative sm:w-80">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            type="search"
            name="permission-catalog-search"
            autoComplete="off"
            spellCheck={false}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo danh mục, phân hệ hoặc quyền…"
            aria-label="Tìm quyền"
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(14rem,18rem)_minmax(0,1fr)]">
          <Skeleton className="h-full min-h-64 rounded-md" />
          <Skeleton className="h-full min-h-64 rounded-md" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Không thể tải danh mục quyền</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>Vui lòng kiểm tra kết nối và thử lại.</span>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <PermissionCatalog mode="readOnly" groups={groups} searchText={search} />
      )}
    </div>
  )
}
