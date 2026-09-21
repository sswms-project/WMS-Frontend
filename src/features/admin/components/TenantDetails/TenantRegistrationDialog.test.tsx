import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import {
  tenantRegistrationRejectionSchema,
  type TenantRegistrationRejectionFormValues,
} from '../../schemas/tenant-registration-rejection.schema'
import { TenantRegistrationDialog } from './TenantRegistrationDialog'

interface TestDialogProps {
  readonly action: 'approve' | 'reject'
  readonly onApprove: () => Promise<void>
  readonly onReject: (values: TenantRegistrationRejectionFormValues) => Promise<void>
}

function TestDialog({ action, onApprove, onReject }: TestDialogProps) {
  const form = useForm<TenantRegistrationRejectionFormValues>({
    resolver: zodResolver(tenantRegistrationRejectionSchema),
    defaultValues: { reason: '' },
  })

  return (
    <TenantRegistrationDialog
      open
      tenantName="KOVIA Logistics ABC"
      action={action}
      form={form}
      isPending={false}
      onOpenChange={vi.fn()}
      onApprove={onApprove}
      onReject={onReject}
    />
  )
}

describe('TenantRegistrationDialog', () => {
  it('approves without displaying or validating a reason', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    const onReject = vi.fn().mockResolvedValue(undefined)
    render(<TestDialog action="approve" onApprove={onApprove} onReject={onReject} />)

    expect(screen.queryByLabelText('Lý do từ chối')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xác nhận phê duyệt' }))

    expect(onApprove).toHaveBeenCalledOnce()
    expect(onReject).not.toHaveBeenCalled()
  })

  it('requires a reason when rejecting a registration', async () => {
    const user = userEvent.setup()
    const onApprove = vi.fn().mockResolvedValue(undefined)
    const onReject = vi.fn().mockResolvedValue(undefined)
    render(<TestDialog action="reject" onApprove={onApprove} onReject={onReject} />)

    await user.click(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    expect(await screen.findByText('Vui lòng nhập lý do từ chối.')).toBeInTheDocument()
    expect(onReject).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText('Lý do từ chối'), 'Thiếu hồ sơ đăng ký')
    await user.click(screen.getByRole('button', { name: 'Xác nhận từ chối' }))

    expect(onReject).toHaveBeenCalledWith({ reason: 'Thiếu hồ sơ đăng ký' }, expect.anything())
    expect(onApprove).not.toHaveBeenCalled()
  })
})
