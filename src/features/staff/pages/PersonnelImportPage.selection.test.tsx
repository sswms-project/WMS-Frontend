import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PersonnelImportDetails } from '../types/invitation.types'
import { PersonnelImportPage } from './PersonnelImportPage'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  refetch: vi.fn(),
  details: undefined as PersonnelImportDetails | undefined,
}))

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: mocks.replace }) }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const details: PersonnelImportDetails = {
  preview: {
    importId: 'import-id',
    rowVersion: 'AQID',
    fileName: 'staff.csv',
    expiresAt: '2026-09-10T00:00:00Z',
    summary: { total: 51, valid: 51, invalid: 0, warning: 0 },
    rows: Array.from({ length: 51 }, (_, index) => ({
      rowNumber: index + 2,
      fullName: `Nhân sự ${index + 1}`,
      email: `staff${index + 1}@example.com`,
      roleCode: 'WarehouseStaff',
      warehouseCodes: ['FPT-01'],
      resolvedWarehouses: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          warehouseCode: 'FPT-01',
          warehouseName: 'Kho Kovia',
        },
      ],
      accountMode: 'NewAccount',
      status: 'Valid',
      errors: [],
      warnings: [],
    })),
  },
}

vi.mock('../hooks/use-personnel-import', () => ({
  usePersonnelImportPreviewMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  usePersonnelImportQuery: () => ({
    data: mocks.details,
    isLoading: false,
    isError: false,
    isFetching: false,
    refetch: mocks.refetch,
  }),
  usePersonnelImportCommitMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  usePersonnelImportCancelMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
  usePersonnelTemplateMutation: () => ({ isPending: false, mutate: vi.fn() }),
}))

describe('PersonnelImportPage selection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.details = details
  })

  it('selects only valid rows on the visible page and preserves earlier-page selection', async () => {
    const user = userEvent.setup()
    render(<PersonnelImportPage initialImportId="import-id" />)

    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả dòng hợp lệ' }))
    expect(screen.getByRole('button', { name: 'Tạo 50 lời mời' })).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(screen.getByRole('checkbox', { name: 'Chọn tất cả dòng hợp lệ' })).not.toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: 'Chọn tất cả dòng hợp lệ' }))

    expect(screen.getByRole('button', { name: 'Tạo 51 lời mời' })).toBeEnabled()
  })
})
