import { ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { RoleResponse } from '../../types/admin.types'

interface RolesTableProps {
  readonly roles: RoleResponse[]
  readonly isLoading: boolean
  readonly onManagePermissions: (role: RoleResponse) => void
}

export function RolesTable({ roles, isLoading, onManagePermissions }: RolesTableProps) {
  if (isLoading) {
    return (
      <div data-slot="operational-list-body" className="min-h-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="bg-card sticky top-0 z-10">Vai trò</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 hidden lg:table-cell">
                Mô tả
              </TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-28 text-center">Quyền</TableHead>
              <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="bg-muted/70 size-8 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="bg-muted/70 h-3.5 w-28" />
                      <Skeleton className="bg-muted/70 h-3 w-20" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="bg-muted/70 h-3.5 w-4/5 max-w-sm" />
                </TableCell>
                <TableCell>
                  <Skeleton className="bg-muted/70 mx-auto h-5 w-8 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="bg-muted/70 ml-auto h-8 w-24 rounded-md" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!roles.length) {
    return (
      <div
        data-slot="operational-list-body"
        className="text-muted-foreground flex min-h-48 items-center justify-center p-6 text-center text-sm"
      >
        Không tìm thấy vai trò phù hợp.
      </div>
    )
  }

  return (
    <div data-slot="operational-list-body" className="min-h-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="bg-card sticky top-0 z-10">Vai trò</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 hidden lg:table-cell">Mô tả</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-28 text-center">Quyền</TableHead>
            <TableHead className="bg-card sticky top-0 z-10 w-32 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>
                <div className="flex min-w-44 items-center gap-2.5">
                  <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg">
                    <ShieldCheck className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{role.roleName}</span>
                      {role.isSystemRole && (
                        <Badge variant="secondary" className="shrink-0 text-[10px]">
                          Hệ thống
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs lg:hidden">
                      {role.description || 'Chưa có mô tả'}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground max-w-sm truncate text-xs lg:table-cell">
                {role.description || 'Chưa có mô tả'}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="tabular-nums">
                  {role.permissions.length}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => onManagePermissions(role)}
                >
                  Phân quyền
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
