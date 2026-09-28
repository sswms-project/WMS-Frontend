import { Suspense } from 'react'
import { InboundReceivingPage } from '@/features/inbound/pages'

export default function InboundRoutePage() {
  return (
    <Suspense>
      <InboundReceivingPage />
    </Suspense>
  )
}
