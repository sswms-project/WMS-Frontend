'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  TenantDetailsView,
  TenantRegistrationDialog,
  TenantStateDialog,
} from '../components/TenantDetails'
import {
  useApproveTenantRegistrationMutation,
  useReactivateTenantMutation,
  useRejectTenantRegistrationMutation,
  useSuspendTenantMutation,
  useTenantQuery,
} from '../hooks/use-admin'
import { tenantStateSchema, type TenantStateFormValues } from '../schemas/tenant-state.schema'

export default function TenantDetailsPage({ tenantId }: { readonly tenantId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [registrationAction, setRegistrationAction] = useState<'approve' | 'reject' | null>(null)
  const query = useTenantQuery(tenantId)
  const suspend = useSuspendTenantMutation()
  const reactivate = useReactivateTenantMutation()
  const approve = useApproveTenantRegistrationMutation()
  const reject = useRejectTenantRegistrationMutation()
  const registrationForm = useForm<TenantStateFormValues>({
    resolver: zodResolver(tenantStateSchema),
    defaultValues: { reason: '' },
  })
  const action = query.data?.status === 'Active' ? 'suspend' : 'reactivate'
  const mutation = action === 'suspend' ? suspend : reactivate

  async function handleSubmit(values: TenantStateFormValues) {
    await mutation.mutateAsync({ tenantId, body: values })
    setDialogOpen(false)
  }

  async function handleRegistrationDecision(values: TenantStateFormValues) {
    if (!query.data || !registrationAction) return
    const decisionMutation = registrationAction === 'approve' ? approve : reject
    await decisionMutation.mutateAsync({
      tenantId,
      body: { concurrencyToken: query.data.concurrencyToken, reason: values.reason },
    })
    registrationForm.reset()
    setRegistrationAction(null)
  }

  return (
    <>
      <TenantDetailsView
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        isFetching={query.isFetching}
        isPending={mutation.isPending || approve.isPending || reject.isPending}
        onRetry={() => void query.refetch()}
        onStateAction={() => setDialogOpen(true)}
        onApprove={() => setRegistrationAction('approve')}
        onReject={() => setRegistrationAction('reject')}
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
      {query.data && registrationAction ? (
        <TenantRegistrationDialog
          open
          tenantName={query.data.tenantName}
          action={registrationAction}
          form={registrationForm}
          isPending={approve.isPending || reject.isPending}
          onOpenChange={(open) => {
            if (!open) {
              registrationForm.reset()
              setRegistrationAction(null)
            }
          }}
          onSubmit={handleRegistrationDecision}
        />
      ) : null}
    </>
  )
}
