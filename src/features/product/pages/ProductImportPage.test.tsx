import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { P } from '@/config/permissionCodes'
import { ROUTE_CAPABILITIES, getAllowedRolesForPath } from '@/config/route-permissions'
import { APP_ROUTES } from '@/routes/app-routes'
import { USER_ROLES } from '@/config/roles'
import { logger } from '@/lib/logger'
import { queryKeys } from '@/lib/query-keys'
import { productImportService } from '../services/product-import.service'
import { productService } from '../services/product.service'
import { useProductImportInspect, useProductImportPreview } from '../hooks/use-product-import'
import {
  productImportFileSchema,
  productImportOptionsSchema,
} from '../schemas/product-import.schema'
import type {
  ProductImportInspect,
  ProductImportPreview,
  ProductImportPreviewRow,
} from '../types/product-import.types'
import {
  defaultProductImportOptions,
  importSelectionState,
  productImportPayload,
  productImportReportCsv,
  selectedProductImportRows,
  toggleImportSelection,
} from '../utils/product-import'
import ProductImportPage from './ProductImportPage'

const auth = vi.hoisted(() => ({
  isPending: false,
  isError: false,
  data: { id: 'user', tenantId: 'tenant', permissions: ['products:import'] },
}))
const push = vi.hoisted(() => vi.fn())
vi.mock('@/features/auth/hooks/use-auth', () => ({ useMeQuery: () => auth }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }))

const mapping = ['sku', 'productName', 'unit', 'category'].map((field, columnIndex) => ({
  field,
  columnIndex,
}))
const inspectData: ProductImportInspect = {
  isCsv: false,
  csvDelimiter: null,
  schema: {
    version: 1,
    templateVersion: '1',
    mainFields: mapping.map((item) => ({
      field: item.field,
      displayName: item.field,
      isRequired: true,
      aliases: [],
      description: '',
      defaultValue: null,
    })),
    conversionFields: ['sku', 'unit', 'conversionFactor'].map((field) => ({
      field,
      displayName: field,
      isRequired: true,
      aliases: [],
      description: '',
      defaultValue: null,
    })),
    limits: {
      maxUploadBytes: 5242880,
      maxProducts: 500,
      maxConversions: 2000,
      maxSheets: 16,
      maxColumns: 100,
      maxCellLength: 2000,
      maxPhysicalRows: 10000,
    },
  },
  sheets: [
    {
      sheetId: '1',
      sheetName: 'Hàng hóa',
      dataRowCount: 3,
      mainHeaderCandidates: [
        {
          rowNumber: 1,
          hasAllRequiredFields: true,
          suggestedMapping: mapping,
          columns: mapping.map((item) => ({
            columnIndex: item.columnIndex,
            letter: String(item.columnIndex),
            header: item.field,
          })),
        },
      ],
      conversionHeaderCandidates: [],
      sampleRows: [
        { rowNumber: 2, values: { '0': 'BIA-1', '1': 'Bia', '2': 'Lon', '3': 'Đồ uống' } },
      ],
    },
  ],
}
const row: ProductImportPreviewRow = {
  rowNumber: 2,
  sheetName: 'Hàng hóa',
  sku: 'BIA-1',
  productName: 'Bia',
  description: null,
  unitValue: 'Lon',
  categoryValue: 'Đồ uống',
  unit: { id: 'base-unit', code: 'LON', name: 'Lon' },
  category: { id: 'category', code: 'DU', name: 'Đồ uống' },
  isLotTracked: false,
  shelfLifeDays: null,
  unitConversions: [
    {
      rowNumber: 2,
      sheetName: 'Quy đổi',
      unitValue: 'Thùng',
      unit: { id: 'box-unit', code: 'THUNG', name: 'Thùng' },
      conversionFactor: 24,
      errors: [],
    },
  ],
  errors: [],
  warnings: [],
}
const issue = {
  code: 'Invalid',
  field: 'unit',
  message: 'Không tìm thấy đơn vị.',
  source: { sheetName: 'Hàng hóa', rowNumber: 3, columnIndex: 2 },
}
const invalid: ProductImportPreviewRow = {
  ...row,
  rowNumber: 3,
  sku: 'LOI',
  productName: 'Hàng lỗi',
  errors: [issue],
}
const previewData: ProductImportPreview = {
  schemaVersion: 1,
  summary: { products: 2, validProducts: 1, invalidProducts: 1, conversions: 2 },
  main: {
    ...defaultProductImportOptions(inspectData).main,
    sheetName: 'Hàng hóa',
    ignoredColumns: [],
  },
  conversions: null,
  rows: [row, invalid],
  fileErrors: [],
  warnings: [],
}

function wrapper(
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
) {
  return {
    client,
    Wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  }
}
function renderPage() {
  const { client, Wrapper } = wrapper()
  return { client, ...render(<ProductImportPage />, { wrapper: Wrapper }) }
}
async function openReview() {
  await userEvent.upload(
    screen.getByLabelText('Tệp vật tư hàng hóa'),
    new File(['data'], 'hang.xlsx')
  )
  await userEvent.click(await screen.findByRole('button', { name: 'Kiểm tra dữ liệu' }))
  await screen.findByRole('checkbox', { name: 'Chọn dòng 2' })
}
async function save() {
  await userEvent.click(screen.getByRole('button', { name: 'Nhập 1 sản phẩm' }))
  await userEvent.click(screen.getByRole('button', { name: 'Xác nhận nhập' }))
}

beforeEach(() => {
  auth.isPending = false
  auth.isError = false
  auth.data.permissions = [P.PRODUCTS_IMPORT]
  auth.data.tenantId = 'tenant'
  auth.data.id = 'user'
  vi.spyOn(productImportService, 'inspect').mockResolvedValue(structuredClone(inspectData))
  vi.spyOn(productImportService, 'preview').mockResolvedValue(structuredClone(previewData))
  vi.spyOn(productImportService, 'template').mockResolvedValue(new Blob(['xlsx']))
  vi.spyOn(productService, 'importProducts').mockResolvedValue({
    isSuccess: true,
    statusCode: 200,
    message: '',
    data: null,
  })
  vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
  vi.spyOn(window, 'confirm').mockReturnValue(false)
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:test'),
  })
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  push.mockClear()
})

describe('product import contract and selection', () => {
  it('requires import capability independently of role-prefix guard', () => {
    expect(getAllowedRolesForPath(APP_ROUTES.productImport)).toContain(USER_ROLES.WarehouseStaff)
    expect(ROUTE_CAPABILITIES[APP_ROUTES.productImport]).toBe(P.PRODUCTS_IMPORT)
  })
  it.each(['bad.xls', 'bad.exe'])('rejects unsupported %s', (name) =>
    expect(productImportFileSchema.safeParse(new File(['x'], name)).success).toBe(false)
  )
  it('rejects empty and oversized files', () => {
    expect(productImportFileSchema.safeParse(new File([], 'empty.csv')).success).toBe(false)
    expect(
      productImportFileSchema.safeParse(new File([new Uint8Array(5242881)], 'big.xlsx')).success
    ).toBe(false)
  })
  it('does not guess ambiguous sheets or header candidates', () => {
    const copy = structuredClone(inspectData)
    copy.sheets.push({ ...copy.sheets[0]!, sheetId: '2' })
    expect(defaultProductImportOptions(copy).main.sheetId).toBe('')
    copy.sheets = [copy.sheets[0]!]
    copy.sheets[0]!.mainHeaderCandidates.push({
      ...copy.sheets[0]!.mainHeaderCandidates[0]!,
      rowNumber: 8,
    })
    expect(defaultProductImportOptions(copy).main.columnMapping).toEqual([])
  })
  it('requires supported schema and unique required mapping', () => {
    const options = defaultProductImportOptions(inspectData)
    expect(productImportOptionsSchema(inspectData).safeParse(options).success).toBe(true)
    expect(
      productImportOptionsSchema({
        ...inspectData,
        schema: { ...inspectData.schema, version: 2 },
      }).safeParse(options).success
    ).toBe(false)
    expect(
      productImportOptionsSchema(inspectData).safeParse({
        ...options,
        main: { ...options.main, columnMapping: [] },
      }).success
    ).toBe(false)
    expect(
      productImportOptionsSchema(inspectData).safeParse({
        ...options,
        main: {
          ...options.main,
          columnMapping: mapping.map((item) => ({ ...item, columnIndex: 0 })),
        },
      }).success
    ).toBe(false)
  })
  it('rejects same-sheet conversions and conversions on CSV', () => {
    const options = defaultProductImportOptions(inspectData)
    expect(
      productImportOptionsSchema(inspectData).safeParse({ ...options, conversions: options.main })
        .success
    ).toBe(false)
    expect(
      productImportOptionsSchema({ ...inspectData, isCsv: true }).safeParse({
        ...options,
        conversions: { ...options.main, sheetId: '2' },
      }).success
    ).toBe(false)
  })
  it('only submits resolved selected parents and all their children', () => {
    expect(productImportPayload(previewData, [2, 3, 999]).items).toEqual([
      {
        rowNumber: 2,
        sku: 'BIA-1',
        productName: 'Bia',
        description: null,
        unitId: 'base-unit',
        categoryId: 'category',
        isLotTracked: false,
        shelfLifeDays: null,
        unitConversions: [
          {
            unitId: 'box-unit',
            conversionFactor: 24,
            sourceRowNumber: 2,
            sourceSheetName: 'Quy đổi',
          },
        ],
      },
    ])
  })
  it('preserves exact decimal text through preview, confirmation payload and report', () => {
    const exact = '999999999999.123456'
    const data = {
      ...previewData,
      rows: [
        {
          ...row,
          unitConversions: [
            {
              ...row.unitConversions[0]!,
              conversionFactor: Number(exact),
              conversionFactorText: exact,
            },
          ],
        },
      ],
    }
    expect(productImportPayload(data, [2]).items[0]?.unitConversions?.[0]?.conversionFactor).toBe(
      exact
    )
    expect(productImportReportCsv(data)).toContain(exact)
  })
  it('blocks orphan file errors, unsupported version, invalid children and empty selection', () => {
    expect(selectedProductImportRows({ ...previewData, fileErrors: [issue] }, [2])).toEqual([])
    expect(selectedProductImportRows({ ...previewData, schemaVersion: 2 }, [2])).toEqual([])
    const childError = {
      ...row,
      unitConversions: [{ ...row.unitConversions[0]!, errors: [issue] }],
    }
    expect(selectedProductImportRows({ ...previewData, rows: [childError] }, [2])).toEqual([])
    expect(() => productImportPayload(previewData, [])).toThrow()
  })
  it('selects visible page without dropping other pages', () => {
    expect(toggleImportSelection([2, 50], [2, 3], false)).toEqual([50])
    expect(toggleImportSelection([50], [2, 3], true)).toEqual([50, 2, 3])
    expect(importSelectionState([2, 50], [2, 3])).toBe('indeterminate')
    expect(importSelectionState([2, 3], [2, 3])).toBe(true)
    expect(importSelectionState([], [])).toBe(false)
  })
  it('exports full source data and sanitizes spreadsheet injection/quotes/newlines', () => {
    const csv = productImportReportCsv({
      ...previewData,
      rows: [{ ...row, sku: '=HYPERLINK("url")', productName: ' +cmd\nquote"' }, invalid],
      warnings: [issue],
    })
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain("'=HYPERLINK(")
    expect(csv).toContain("' +cmd")
    expect(csv).toContain('quote""')
    expect(csv).toContain('Hàng lỗi')
    expect(csv).toContain('1 Thùng = 24 Lon')
    expect(csv).toContain('Cảnh báo tệp')
  })
})

describe('product import workflow', () => {
  it('announces the current step and focuses its heading after navigation', async () => {
    renderPage()
    await openReview()
    const heading = screen.getByRole('heading', { name: 'Bước 3: Kiểm tra' })
    await waitFor(() => expect(heading).toHaveFocus())
    expect(
      screen
        .getByRole('navigation', { name: 'Tiến trình nhập hàng hóa' })
        .querySelector('[aria-current=step]')
    ).toHaveTextContent('Kiểm tra')
    await userEvent.click(screen.getByRole('button', { name: 'Nhập 1 sản phẩm' }))
    await userEvent.click(screen.getByRole('button', { name: 'Quay lại kiểm tra' }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Nhập 1 sản phẩm' })).toHaveFocus()
    )
  })
  it('filters mapping without changing selected columns and blocks ambiguous mapping', async () => {
    renderPage()
    await userEvent.upload(
      screen.getByLabelText('Tệp vật tư hàng hóa'),
      new File(['x'], 'hang.xlsx')
    )
    await screen.findByLabelText('sku *')
    await userEvent.selectOptions(screen.getByLabelText('Lọc cột hàng hóa'), 'mapped')
    await userEvent.type(screen.getByLabelText('Tìm trường hàng hóa'), 'productName')
    expect(screen.getByLabelText('productName *')).toHaveValue('1')
    expect(screen.queryByLabelText('sku *')).not.toBeInTheDocument()
    await userEvent.clear(screen.getByLabelText('Tìm trường hàng hóa'))
    await userEvent.selectOptions(screen.getByLabelText('unit *'), '0')
    expect(await screen.findAllByText('Mơ hồ: trùng cột')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Kiểm tra dữ liệu' })).toBeDisabled()
    expect(productImportService.preview).not.toHaveBeenCalled()
  })
  it('focuses and describes the first invalid field on form submission', async () => {
    renderPage()
    await userEvent.upload(
      screen.getByLabelText('Tệp vật tư hàng hóa'),
      new File(['x'], 'hang.xlsx')
    )
    await userEvent.selectOptions(await screen.findByLabelText('sku *'), '')
    fireEvent.submit(document.getElementById('product-import-mapping')!)
    await waitFor(() => expect(screen.getByLabelText('sku *')).toHaveFocus())
    expect(screen.getByLabelText('sku *')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('sku *')).toHaveAccessibleDescription(/Ghép đủ các cột bắt buộc/)
  })
  it('uses a single CSV table even when its header cannot be suggested', async () => {
    const csv = structuredClone(inspectData)
    csv.isCsv = true
    csv.sheets[0]!.mainHeaderCandidates = []
    vi.mocked(productImportService.inspect).mockResolvedValueOnce(csv)
    renderPage()
    await userEvent.upload(
      screen.getByLabelText('Tệp vật tư hàng hóa'),
      new File(['x'], 'hang.csv')
    )
    await screen.findByLabelText('sku *')
    expect(screen.queryByLabelText('Trang tính hàng hóa')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Trang tính quy đổi (tùy chọn)')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Dòng tiêu đề — Hàng hóa')).toHaveValue(1)
    expect(screen.getByRole('button', { name: 'Kiểm tra dữ liệu' })).toBeDisabled()
  })
  it('maps custom late headers and populated columns with blank headings', async () => {
    const data = structuredClone(inspectData)
    data.isCsv = true
    const sheet = data.sheets[0]!
    sheet.mainHeaderCandidates = []
    sheet.sampleRows = [{ rowNumber: 1, values: { '0': 'Instructions' } }]
    sheet.columns = ['A', 'B', 'C', 'D', 'E'].map((letter, columnIndex) => ({
      columnIndex,
      letter,
      header: '',
    }))
    sheet.mappingRows = [
      {
        rowNumber: 8,
        values: { '0': 'Custom SKU', '1': 'Custom Name', '2': 'Custom Unit', '3': 'Custom Group' },
      },
      {
        rowNumber: 9,
        values: { '0': '001', '1': 'Beer', '2': 'LON', '3': 'BEER', '4': 'Description' },
      },
    ]
    vi.mocked(productImportService.inspect).mockResolvedValueOnce(data)
    renderPage()
    await userEvent.upload(
      screen.getByLabelText('Tệp vật tư hàng hóa'),
      new File(['x'], 'hang.csv')
    )
    fireEvent.change(await screen.findByLabelText('Dòng tiêu đề — Hàng hóa'), {
      target: { value: '8' },
    })
    const select = screen.getByLabelText('productName *')
    expect(within(select).getByRole('option', { name: 'B — Custom Name' })).toBeInTheDocument()
    expect(within(select).getByRole('option', { name: 'E — Không có tên' })).toBeInTheDocument()
    await userEvent.selectOptions(select, '1')
    expect(screen.getAllByText('Beer')[0]).toBeVisible()
  })
  it('links invalid checkbox to its reason and exposes conversion details', async () => {
    renderPage()
    await openReview()
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 3' })).toHaveAccessibleDescription(
      /Không thể chọn dòng có lỗi/
    )
    await userEvent.click(screen.getAllByText('1 đơn vị quy đổi')[0]!)
    expect(screen.getAllByText('1 THUNG — Thùng = 24 LON — Lon')[0]).toBeVisible()
    expect(screen.getAllByText('LON — Lon')[0]).toBeVisible()
    expect(screen.getAllByText('DU — Đồ uống')[0]).toBeVisible()
  })
  it('resets result pagination and retains the shared table footer', async () => {
    vi.mocked(productImportService.preview).mockResolvedValueOnce({
      ...previewData,
      rows: Array.from({ length: 22 }, (_, index) => ({
        ...row,
        rowNumber: index + 2,
        sku: `BIA-${index}`,
      })),
    })
    renderPage()
    await openReview()
    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    await userEvent.click(screen.getByRole('button', { name: 'Nhập 22 sản phẩm' }))
    await userEvent.click(screen.getByRole('button', { name: 'Xác nhận nhập' }))
    const result = await screen.findByRole('region', { name: 'Kết quả từng sản phẩm' })
    expect(within(result).getByText('BIA-0')).toBeInTheDocument()
    expect(within(result).queryByText('BIA-20')).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Bước 4: Kết quả' })).toHaveFocus()
    )
    await userEvent.click(within(result).getByRole('button', { name: 'Trang sau' }))
    expect(within(result).getByText('BIA-20')).toBeInTheDocument()
  })
  it.each(['pending', 'denied', 'error'])(
    'does not call import APIs when permission is %s',
    (state) => {
      auth.isPending = state === 'pending'
      auth.isError = state === 'error'
      auth.data.permissions = []
      renderPage()
      expect(productImportService.inspect).not.toHaveBeenCalled()
      expect(productImportService.template).not.toHaveBeenCalled()
      expect(productImportService.preview).not.toHaveBeenCalled()
      expect(productService.importProducts).not.toHaveBeenCalled()
    }
  )
  it('invalid rows cannot be selected and partial header is indeterminate', async () => {
    vi.mocked(productImportService.preview).mockResolvedValueOnce({
      ...previewData,
      rows: [row, invalid, { ...row, rowNumber: 4 }],
    })
    renderPage()
    await openReview()
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 3' })).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Chọn dòng 2' }))
    expect(
      screen.getByRole('checkbox', { name: 'Chọn dòng hợp lệ trên trang này' })
    ).toBePartiallyChecked()
  })
  it('preserves selection through search and page changes', async () => {
    vi.mocked(productImportService.preview).mockResolvedValueOnce({
      ...previewData,
      rows: Array.from({ length: 22 }, (_, index) => ({
        ...row,
        rowNumber: index + 2,
        sku: `BIA-${index}`,
      })),
    })
    renderPage()
    await openReview()
    await userEvent.click(screen.getByRole('checkbox', { name: 'Chọn dòng 2' }))
    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }))
    await userEvent.click(screen.getByRole('checkbox', { name: 'Chọn dòng hợp lệ trên trang này' }))
    await userEvent.type(screen.getByLabelText('Tìm trong bản xem trước'), 'BIA-0')
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 2' })).not.toBeChecked()
    expect(screen.getByText(/Đã chọn 19 sản phẩm hợp lệ/)).toBeInTheDocument()
  })
  it('changing mapping invalidates old preview and selected rows', async () => {
    renderPage()
    await openReview()
    await userEvent.click(screen.getByRole('button', { name: 'Quay lại ghép cột' }))
    await userEvent.selectOptions(screen.getByLabelText('sku *'), '')
    expect(screen.queryByRole('button', { name: 'Nhập 1 sản phẩm' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Kiểm tra dữ liệu' })).toBeDisabled()
    expect(await screen.findByText('Ghép đủ các cột bắt buộc.')).toBeInTheDocument()
    expect(productImportService.preview).toHaveBeenCalledTimes(1)
  })
  it('no selection or blocking file error cannot commit', async () => {
    vi.mocked(productImportService.preview).mockResolvedValueOnce({
      ...previewData,
      fileErrors: [issue],
    })
    renderPage()
    await openReview()
    expect(screen.getByRole('button', { name: 'Nhập 0 sản phẩm' })).toBeDisabled()
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 2' })).toBeDisabled()
  })
  it('confirms only selected payload, counts children and invalidates without reload', async () => {
    const { client } = renderPage()
    const invalidate = vi.spyOn(client, 'invalidateQueries')
    await openReview()
    await save()
    expect(productService.importProducts).toHaveBeenCalledWith(
      productImportPayload(previewData, [2])
    )
    expect(await screen.findByText('Đã hoàn tất nhập sản phẩm')).toBeInTheDocument()
    expect(screen.getByText('Đã nhập 1 sản phẩm và 1 đơn vị quy đổi.')).toBeInTheDocument()
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.products.all })
  })
  it.each([400, 409])(
    'retains preview on %s and does not retry automatically',
    async (statusCode) => {
      vi.mocked(productService.importProducts).mockRejectedValueOnce({
        statusCode,
        message: 'Mã đã tồn tại.',
      })
      renderPage()
      await openReview()
      await save()
      expect(await screen.findByRole('button', { name: 'Kiểm tra lại' })).toBeInTheDocument()
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Kiểm tra lại' })).toHaveFocus()
      )
      expect(screen.getByRole('button', { name: 'Nhập 1 sản phẩm' })).toBeDisabled()
      expect(productService.importProducts).toHaveBeenCalledTimes(1)
      expect(screen.queryByText('Đã hoàn tất nhập sản phẩm')).not.toBeInTheDocument()
    }
  )
  it('marks disconnected/server error as unknown, not definitely failed', async () => {
    vi.mocked(productService.importProducts).mockRejectedValueOnce({
      statusCode: 500,
      message: 'Network Error',
    })
    renderPage()
    await openReview()
    await save()
    expect(await screen.findByText(/Chưa xác định kết quả lưu do kết nối/)).toBeInTheDocument()
    expect(productService.importProducts).toHaveBeenCalledTimes(1)
  })
  it.each(['inspect', 'preview', 'commit'])('blocks the workspace on 403 at %s', async (stage) => {
    const error = { statusCode: 403, message: 'Không có quyền.' }
    if (stage === 'inspect') vi.mocked(productImportService.inspect).mockRejectedValueOnce(error)
    else if (stage === 'preview')
      vi.mocked(productImportService.preview).mockRejectedValueOnce(error)
    else vi.mocked(productService.importProducts).mockRejectedValueOnce(error)
    renderPage()
    if (stage === 'inspect')
      await userEvent.upload(
        screen.getByLabelText('Tệp vật tư hàng hóa'),
        new File(['x'], 'a.xlsx')
      )
    else if (stage === 'preview') {
      await userEvent.upload(
        screen.getByLabelText('Tệp vật tư hàng hóa'),
        new File(['x'], 'a.xlsx')
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Kiểm tra dữ liệu' }))
    } else {
      await openReview()
      await save()
    }
    expect(await screen.findByText(/Quyền nhập tệp đã bị thu hồi/)).toBeInTheDocument()
  })
  it('locks duplicate submit and file changes while pending', async () => {
    let resolve!: (value: Awaited<ReturnType<typeof productService.importProducts>>) => void
    vi.mocked(productService.importProducts).mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      })
    )
    renderPage()
    await openReview()
    await save()
    const confirm = screen.getByRole('button', { name: 'Đang nhập…' })
    expect(confirm).toBeDisabled()
    fireEvent.click(confirm)
    expect(screen.getByRole('button', { name: 'Chọn tệp khác', hidden: true })).toBeDisabled()
    expect(productService.importProducts).toHaveBeenCalledTimes(1)
    await act(async () => resolve({ isSuccess: true, statusCode: 200, message: '', data: null }))
  })
  it('protects reload and navigation without persisting the file', async () => {
    const storage = vi.spyOn(Storage.prototype, 'setItem')
    renderPage()
    await openReview()
    const event = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    fireEvent.click(screen.getByRole('link', { name: 'Về danh sách vật tư hàng hóa' }))
    expect(window.confirm).toHaveBeenCalled()
    expect(screen.getByRole('checkbox', { name: 'Chọn dòng 2' })).toBeInTheDocument()
    expect(storage).not.toHaveBeenCalled()
  })
  it('handles template failure without losing the file selection screen', async () => {
    vi.mocked(productImportService.template).mockRejectedValueOnce({
      statusCode: 500,
      message: 'Không thể tải mẫu.',
    })
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Mẫu cơ bản' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Mẫu cơ bản' })).toBeEnabled())
    expect(screen.getByLabelText('Tệp vật tư hàng hóa')).toBeInTheDocument()
  })
  it('includes ignored columns and sheets in explicit confirmation', async () => {
    vi.mocked(productImportService.preview).mockResolvedValueOnce({
      ...previewData,
      warnings: [{ ...issue, message: 'Bỏ qua cột Ghi chú và trang Thông tin.' }],
    })
    renderPage()
    await openReview()
    await userEvent.click(screen.getByRole('button', { name: 'Nhập 1 sản phẩm' }))
    expect(screen.getByRole('alertdialog')).toHaveTextContent(
      'Bỏ qua cột Ghi chú và trang Thông tin.'
    )
    expect(productService.importProducts).not.toHaveBeenCalled()
  })
  it('CSV tab selector passes an actual tab and changing delimiter invalidates inspection', async () => {
    vi.mocked(productImportService.inspect).mockResolvedValue({
      ...inspectData,
      isCsv: true,
      csvDelimiter: ',',
    })
    renderPage()
    await userEvent.upload(
      screen.getByLabelText('Tệp vật tư hàng hóa'),
      new File(['x'], 'hang.csv')
    )
    await screen.findByRole('button', { name: 'Kiểm tra dữ liệu' })
    await userEvent.selectOptions(screen.getByLabelText('Dấu phân cách CSV'), '\t')
    await waitFor(() => expect(productImportService.inspect).toHaveBeenCalledTimes(2))
    expect(productImportService.inspect).toHaveBeenCalledWith(
      expect.any(File),
      '\t',
      expect.any(AbortSignal)
    )
    await userEvent.selectOptions(screen.getByLabelText('Dấu phân cách CSV'), ';')
    await waitFor(() => expect(productImportService.inspect).toHaveBeenCalledTimes(3))
  })
  it('ignores late preview of an old mapping revision', async () => {
    let resolveOld!: (value: ProductImportPreview) => void
    let oldSignal!: AbortSignal
    vi.mocked(productImportService.preview).mockImplementationOnce((_file, _options, signal) => {
      oldSignal = signal
      return new Promise((done) => {
        resolveOld = done
      })
    })
    const { Wrapper } = wrapper()
    const options = defaultProductImportOptions(inspectData)
    const file = new File(['x'], 'hang.xlsx')
    const hook = renderHook(
      ({ revision }) => useProductImportPreview('session', revision, file, options),
      { initialProps: { revision: 1 }, wrapper: Wrapper }
    )
    await waitFor(() => expect(productImportService.preview).toHaveBeenCalled())
    hook.rerender({ revision: 2 })
    await waitFor(() => expect(hook.result.current.data?.rows[0]?.sku).toBe('BIA-1'))
    await act(async () => resolveOld({ ...previewData, rows: [{ ...row, sku: 'OLD' }] }))
    expect(oldSignal.aborted).toBe(true)
    expect(hook.result.current.data?.rows[0]?.sku).toBe('BIA-1')
  })
  it('revoked effective permission unmounts the file workflow', async () => {
    const page = renderPage()
    await openReview()
    auth.data.permissions = []
    page.rerender(<ProductImportPage />)
    expect(screen.getByText(/Bạn không có quyền nhập vật tư/)).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })
  it('discards the file workspace when the tenant changes', async () => {
    const page = renderPage()
    await openReview()
    auth.data.tenantId = 'another-tenant'
    page.rerender(<ProductImportPage />)
    expect(screen.getByLabelText('Tệp vật tư hàng hóa')).toBeInTheDocument()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(productService.importProducts).not.toHaveBeenCalled()
  })
  it('isolates late file A response and aborts it when switching to B', async () => {
    let resolveA!: (value: ProductImportInspect) => void
    let signalA!: AbortSignal
    vi.mocked(productImportService.inspect).mockImplementationOnce((_file, _delimiter, signal) => {
      signalA = signal
      return new Promise((done) => {
        resolveA = done
      })
    })
    const { Wrapper } = wrapper()
    const hook = renderHook(({ id, file }) => useProductImportInspect(id, file, 'auto'), {
      initialProps: { id: 'A', file: new File(['A'], 'a.xlsx') },
      wrapper: Wrapper,
    })
    await waitFor(() => expect(productImportService.inspect).toHaveBeenCalled())
    hook.rerender({ id: 'B', file: new File(['B'], 'b.xlsx') })
    await waitFor(() => expect(hook.result.current.data?.sheets[0]?.sheetName).toBe('Hàng hóa'))
    await act(async () =>
      resolveA({ ...inspectData, sheets: [{ ...inspectData.sheets[0]!, sheetName: 'Tệp A cũ' }] })
    )
    expect(signalA.aborted).toBe(true)
    expect(hook.result.current.data?.sheets[0]?.sheetName).toBe('Hàng hóa')
  })
})
