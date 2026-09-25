import { RolesPage } from '@/features/admin/pages'

export default function AdminRolesPage() {
  return (
    <div className="space-y-4">
      <header>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Phân quyền vai trò</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-6">
            Gán quyền cho từng vai trò trong hệ thống
          </p>
        </div>
      </header>
      <RolesPage />
    </div>
  )
}
