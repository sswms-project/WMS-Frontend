import { LoginPage } from '@/features/auth/pages/LoginPage'

export default async function Page({
  searchParams,
}: {
  readonly searchParams: Promise<{ returnUrl?: string }>
}) {
  const { returnUrl } = await searchParams
  return <LoginPage returnUrl={returnUrl} />
}
