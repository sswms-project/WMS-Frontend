'use client'

import { useState } from 'react'
import { TenantDetailsView, TenantStateDialog } from '../components/TenantDetails'
import {
  useReactivateTenantMutation,
  useSuspendTenantMutation,
  useTenantQuery,
} from '../hooks/use-admin'
import type { TenantStateFormValues } from '../schemas/tenant-state.schema'

export default function TenantDetailsPage({ tenantId }: { readonly tenantId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const query = useTenantQuery(tenantId)
  const suspend = useSuspendTenantMutation()
  const reactivate = useReactivateTenantMutation()
  const action = query.data?.status === 'Active' ? 'suspend' : 'reactivate'
  const mutation = action === 'suspend' ? suspend : reactivate

  async function handleSubmit(values: TenantStateFormValues) {
    await mutation.mutateAsync({ tenantId, body: values })
    setDialogOpen(false)
  }

  return (
    <>
      <TenantDetailsView
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        isFetching={query.isFetching}
        isPending={mutation.isPending}
        onRetry={() => void query.refetch()}
        onStateAction={() => setDialogOpen(true)}
      />
      {query.data ? (
        <TenantStateDialog
          open={dialogOpen}
          tenantName={query.data.tenantName}
          action={action}
          isPending={mutation.isPending}
          onOpenChange={setDialogOpen}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  )
}
