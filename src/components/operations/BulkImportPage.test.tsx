import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { Route } from 'next'
import { describe, expect, it, vi } from 'vitest'
import {
  BulkImportPage,
  type BulkImportColumn,
  type BulkImportCommitOutcome,
  type BulkImportRow,
} from './BulkImportPage'

interface TestRow extends BulkImportRow {
  readonly name: string
}

const columns: readonly BulkImportColumn<TestRow>[] = [
  { key: 'name', header: 'Tên', render: (row) => row.name },
]

const previewRows: TestRow[] = [
  { rowNumber: 2, name: 'Khách hợp lệ A', errors: [] },
  { rowNumber: 3, name: 'Khách lỗi một', errors: ['Email không hợp lệ.'] },
  { rowNumber: 4, name: 'Khách hợp lệ B', errors: [] },
]

type ImportHandler = (rows: readonly TestRow[]) => Promise<BulkImportCommitOutcome>

function renderPage(overrides: { rows?: TestRow[]; onImport?: ImportHandler } = {}) {
  const onImport = vi.fn<ImportHandler>(
    overrides.onImport ?? (() => Promise.resolve({ isSucceeded: true }))
  )
  render(
    <BulkImportPage<TestRow>
      eyebrow="Danh mục"
      title="Nhập danh sách khách hàng"
      description="Mô tả"
      entityLabel="khách hàng"
      maxRows={500}
      backHref={'/stock-recipients' as Route}
      backLabel="Quay lại"
      listLabel="Xem danh sách khách hàng"
      resultFileName="ket-qua.csv"
      columns={columns}
      getRowLabel={(row) => row.name}
      getRowSearchText={(row) => row.name}
      isPreviewing={false}
      isImporting={false}
      isDownloadingTemplate={false}
      onDownloadTemplate={() => undefined}
      onPreview={() => Promise.resolve({ isSucceeded: true, rows: overrides.rows ?? previewRows })}
      onImport={onImport}
    />
  )
  return { onImport }
}

async function chooseFile() {
  const input = screen.getByLabelText(/Tệp khách hàng/)
  await userEvent.upload(input, new File(['x'], 'khach-hang.xlsx'))
}

async function confirmImport(buttonName: RegExp) {
  await userEvent.click(await screen.findByRole('button', { name: buttonName }))
  await userEvent.click(await screen.findByRole('button', { name: 'Xác nhận nhập' }))
}

describe('BulkImportPage', () => {
  it('summarises the preview and preselects every valid row', async () => {
    renderPage()
    await chooseFile()

    expect(await screen.findByText('Bản xem trước')).toBeInTheDocument()
    expect(screen.getByText(/đã chọn 2\/2 dòng hợp lệ/)).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 3' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Nhập 2 khách hàng/ })).toBeEnabled()
  })

  it('imports only the selected valid rows and reports skipped ones', async () => {
    const { onImport } = renderPage()
    await chooseFile()

    await userEvent.click(await screen.findByRole('checkbox', { name: 'Chọn dòng 4' }))
    await confirmImport(/Nhập 1 khách hàng/)

    await waitFor(() => expect(onImport).toHaveBeenCalledTimes(1))
    expect(onImport.mock.calls[0]?.[0]).toEqual([previewRows[0]])
    expect(await screen.findByText('Đã hoàn tất nhập khách hàng')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Đã nhập 1 khách hàng; bỏ qua 2 dòng.')
    const table = screen.getByRole('table')
    expect(within(table).getByText('Bỏ qua: Email không hợp lệ.')).toBeInTheDocument()
    expect(within(table).getByText('Bỏ qua: không được chọn')).toBeInTheDocument()
  })

  it('filters the preview by status', async () => {
    renderPage()
    await chooseFile()

    await userEvent.selectOptions(await screen.findByLabelText('Lọc trạng thái'), 'Invalid')

    expect(screen.getByText('Khách lỗi một')).toBeInTheDocument()
    expect(screen.queryByText('Khách hợp lệ A')).not.toBeInTheDocument()
  })

  it('disables importing when no row is valid', async () => {
    renderPage({ rows: [previewRows[1]!] })
    await chooseFile()

    expect(await screen.findByRole('button', { name: /Nhập 0 khách hàng/ })).toBeDisabled()
  })

  it('keeps the preview and shows the server message when the import fails', async () => {
    renderPage({
      onImport: () => Promise.resolve({ isSucceeded: false, message: 'Dòng 2: trùng mã.' }),
    })
    await chooseFile()

    await confirmImport(/Nhập 2 khách hàng/)

    expect(await screen.findByText('Dòng 2: trùng mã.')).toBeInTheDocument()
    expect(screen.getByText('Khách hợp lệ A')).toBeInTheDocument()
    expect(screen.queryByText('Đã hoàn tất nhập khách hàng')).not.toBeInTheDocument()
  })

  it('lets the user discard the preview and start over', async () => {
    renderPage()
    await chooseFile()

    await userEvent.click(await screen.findByRole('button', { name: 'Hủy phiên nhập' }))

    expect(await screen.findByText('Chọn tệp khách hàng')).toBeInTheDocument()
  })
})
