import type { Metadata } from 'next'
import { AcceptInvitationPage } from '@/features/staff/pages'

export const metadata: Metadata = {
  title: 'Chấp nhận lời mời | KOVIA',
  description: 'Hoàn tất tài khoản từ lời mời tham gia tổ chức KOVIA',
}

interface PageProps {
  readonly searchParams: Promise<{
    readonly token?: string | readonly string[]
  }>
}

function normalizeToken(token?: string | readonly string[]) {
  const value = Array.isArray(token) ? token[0] : token
  const normalizedValue = value?.trim()
  return normalizedValue || undefined
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  return <AcceptInvitationPage token={normalizeToken(params.token)} />
}
