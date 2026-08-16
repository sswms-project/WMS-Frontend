import type { Metadata } from 'next'
import { VerifyTwoFactorPage } from '@/features/auth/pages/VerifyTwoFactorPage'

export const metadata: Metadata = {
  title: 'Xác thực hai yếu tố | KOVIA',
  description: 'Nhập mã OTP để hoàn tất đăng nhập',
}

export default function Page() {
  return <VerifyTwoFactorPage />
}
