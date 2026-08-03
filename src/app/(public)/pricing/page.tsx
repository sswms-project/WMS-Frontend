import type { Metadata } from 'next'
import { PricingPage } from '@/features/landing/pages'

export const metadata: Metadata = {
  title: 'Bảng giá | KOVIA',
  description: 'Các gói dịch vụ quản lý kho hiện có của KOVIA.',
}

export default function PricingRoutePage() {
  return <PricingPage />
}
