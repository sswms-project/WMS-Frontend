import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import type { InboundDocumentReviewFormValues } from '../../../schemas/inbound-document-import.schema'
import type { InboundDocumentImport, ReceivingTask } from '../../../types/inbound.types'
import { ReviewStep } from './ReviewStep'

const purchaseOrderId = '10000000-0000-4000-8000-000000000001'
const purchaseOrderItemId = '20000000-0000-4000-8000-000000000001'
const productId = '50000000-0000-4000-8000-000000000001'

const task: ReceivingTask = {
  purchaseOrderId,
  poNumber: 'PO-001',
  warehouseId: '30000000-0000-4000-8000-000000000001',
  warehouseName: 'Kho trung tâm',
  supplierId: '40000000-0000-4000-8000-000000000001',
  supplierName: 'Nhà cung cấp An Tâm',
  expectedDate: '2026-09-05',
  orderedQuantity: 10,
  receivedQuantity: 0,
  remainingQuantity: 10,
  activeDocumentImportId: null,
  lines: [
    {
      purchaseOrderItemId,
      productId,
      productSKU: 'SKU-001',
      productName: 'Trà xanh',
      barcodeValue: null,
      orderedQuantity: 10,
      receivedQuantity: 0,
      remainingQuantity: 10,
    },
  ],
}

const importData: InboundDocumentImport = {
  id: '60000000-0000-4000-8000-000000000001',
  fileName: 'delivery.pdf',
  contentType: 'application/pdf',
  fileSize: 1024,
  status: 'ReadyForDraft',
  schemaVersion: '1.0',
  failureCode: null,
  failureMessage: null,
  extractionProvider: 'Gemini',
  extractionModel: 'gemini-3.6-flash',
  createdAt: '2026-09-05T00:00:00Z',
  reviewedAt: '2026-09-05T00:01:00Z',
  inboundReceiptId: null,
  duplicateFileDetected: false,
  review: {
    extraction: {
      schemaVersion: '1.0',
      documentNumber: null,
      purchaseOrderNumber: null,
      supplierName: null,
      documentDate: null,
      supplierDeliveryDate: null,
      warehouseCode: null,
      warehouseName: null,
      items: [],
    },
    purchaseOrderId,
    purchaseOrderNumber: 'PO-001',
    supplierId: task.supplierId,
    supplierName: task.supplierName,
    warehouseId: task.warehouseId,
    warehouseCode: 'WH-01',
    warehouseName: task.warehouseName,
    warehouseAddress: null,
    expectedReceiptDate: task.expectedDate,
    hasWarehouseMismatch: false,
    warehouseMismatchAcknowledged: false,
    lines: [
      {
        sourceLineNumber: 1,
        extractedSku: 'SKU-001',
        extractedProductName: 'Trà xanh',
        extractedUnitOfMeasure: 'Thùng',
        documentQuantity: 10,
        purchaseOrderItemId,
        productId,
        productSku: 'SKU-001',
        productName: 'Trà xanh',
        unitName: 'Thùng',
        orderedQuantity: 10,
        previouslyReceivedQuantity: 0,
        remainingQuantity: 10,
        confirmedQuantity: 10,
        damagedQuantity: 0,
        exceptionReason: null,
        status: 'Matched',
        isUserCorrected: false,
      },
    ],
    warnings: [],
    blockingErrors: [],
    canCreateDraft: true,
  },
}

function ReviewStepFixture({
  data = importData,
  onSaveReview = vi.fn(),
}: {
  readonly data?: InboundDocumentImport
  readonly onSaveReview?: () => void
}) {
  const form = useForm<InboundDocumentReviewFormValues>({
    defaultValues: {
      purchaseOrderId,
      acknowledgeWarehouseMismatch: data.review?.warehouseMismatchAcknowledged ?? false,
      lines: [
        {
          sourceLineNumber: 1,
          purchaseOrderItemId,
          confirmedQuantity: 10,
          damagedQuantity: 0,
          exceptionReason: '',
        },
      ],
    },
  })

  return (
    <ReviewStep
      task={task}
      importData={data}
      form={form}
      isSavingReview={false}
      isCreatingDraft={false}
      onSaveReview={onSaveReview}
      onCreateDraft={vi.fn()}
    />
  )
}

describe('ReviewStep', () => {
  it('requires unsaved edits to be reviewed before creating a draft receipt', async () => {
    const user = userEvent.setup()
    render(<ReviewStepFixture />)
    const createDraft = screen.getByRole('button', { name: 'Tạo phiếu nhập nháp' })
    expect(createDraft).toBeEnabled()

    const confirmedQuantity = screen.getByLabelText('Số lượng xác nhận')
    await user.clear(confirmedQuantity)
    await user.type(confirmedQuantity, '9')

    expect(createDraft).toBeDisabled()
    expect(createDraft).toHaveAttribute(
      'title',
      'Lưu và kiểm tra lại các thay đổi trước khi tạo phiếu.'
    )
  })

  it('requires the user to acknowledge a document warehouse mismatch before revalidation', async () => {
    const review = importData.review
    if (!review) throw new Error('Review fixture is required')
    const mismatchImport: InboundDocumentImport = {
      ...importData,
      status: 'NeedsReview',
      review: {
        ...review,
        extraction: {
          ...review.extraction,
          warehouseCode: {
            value: 'KHO-A',
            rawValue: 'KHO-A',
            confidence: null,
            source: 'AiExtracted',
            verificationStatus: 'Mismatch',
          },
          warehouseName: {
            value: 'Kho trung tâm A',
            rawValue: 'Kho trung tâm A',
            confidence: null,
            source: 'AiExtracted',
            verificationStatus: 'Mismatch',
          },
        },
        hasWarehouseMismatch: true,
        warehouseMismatchAcknowledged: false,
        canCreateDraft: false,
      },
    }
    const onSaveReview = vi.fn()
    const user = userEvent.setup()

    render(<ReviewStepFixture data={mismatchImport} onSaveReview={onSaveReview} />)

    const acknowledgement = screen.getByRole('checkbox', {
      name: /Tôi xác nhận sử dụng WH-01 · Kho trung tâm/,
    })
    const createDraft = screen.getByRole('button', { name: 'Tạo phiếu nhập nháp' })
    expect(acknowledgement).not.toBeChecked()
    expect(createDraft).toBeDisabled()
    expect(createDraft).toHaveAttribute('title', 'Xác nhận sử dụng kho của đơn mua để tiếp tục.')

    await user.click(acknowledgement)

    expect(acknowledgement).toBeChecked()
    expect(createDraft).toHaveAttribute(
      'title',
      'Lưu và kiểm tra lại các thay đổi trước khi tạo phiếu.'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu và kiểm tra lại' }))
    expect(onSaveReview).toHaveBeenCalledOnce()
  })
})
