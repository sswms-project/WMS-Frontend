import { Suspense } from 'react'
import { PaymentResultPage } from '@/features/subscription/pages'

export default function PaymentResultRoutePage() {
  return (
    <Suspense>
      <PaymentResultPage />
    </Suspense>
  )
}
