import { RolesPage } from '@/features/admin/pages'

export default function AdminRolesPage() {
  return (
    <div className="space-y-4">
      <header>
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight">Phân quyền vai trò</h1>
        </div>
      </header>
      <RolesPage />
    </div>
  )
}
