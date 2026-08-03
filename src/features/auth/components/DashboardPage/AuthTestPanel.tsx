'use client'

import { LogOut, ShieldCheck, ShieldOff, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_ROUTES } from '@/routes/app-routes'
import { useAuthStore } from '@/stores/auth.store'

export function AuthTestPanel() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  function handleLogout() {
    clearAuth()
    router.replace(APP_ROUTES.auth.login)
  }

  const accessToken = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">Auth Test Panel</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Kiểm tra trạng thái auth sau khi đăng nhập.
          </p>
        </div>
        <Button
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive/10 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="size-4" aria-hidden="true" />
          Đăng xuất
        </Button>
      </div>

      {/* Protected Route Status */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            {user ? (
              <ShieldCheck className="text-primary size-4" aria-hidden="true" />
            ) : (
              <ShieldOff className="text-destructive size-4" aria-hidden="true" />
            )}
            Protected Route
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <Badge className="bg-primary/10 text-primary border-primary/20 border">
              ✓ ProtectedRoute passed — user authenticated
            </Badge>
          ) : (
            <Badge variant="destructive">✗ No user in store</Badge>
          )}
        </CardContent>
      </Card>

      {/* User from Zustand Store */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <User className="text-primary size-4" aria-hidden="true" />
            User (Zustand store)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="ID" value={user.id} />
              <Field label="Tenant ID" value={user.tenantId ?? 'N/A'} />
              <Field label="Full Name" value={user.fullName} />
              <Field label="Email" value={user.email} />
              <Field label="Role" value={user.role} />
              <Field label="Active" value={String(user.isActive)} />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Không có user trong store.</p>
          )}
        </CardContent>
      </Card>

      {/* Tokens */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Tokens (localStorage)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <TokenField label="access_token" value={accessToken} />
          <TokenField label="refresh_token" value={refreshToken} />
        </CardContent>
      </Card>
    </div>
  )
}

function Field({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="bg-muted rounded-md px-3 py-2">
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      <p className="text-foreground mt-0.5 text-sm break-all">{value}</p>
    </div>
  )
}

function TokenField({ label, value }: { readonly label: string; readonly value: string | null }) {
  return (
    <div className="bg-muted rounded-md px-3 py-2">
      <p className="text-muted-foreground text-xs font-semibold">{label}</p>
      {value ? (
        <p className="text-foreground mt-0.5 font-mono text-xs break-all">{value}</p>
      ) : (
        <p className="text-destructive mt-0.5 text-xs">not found</p>
      )}
    </div>
  )
}
