import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { formatQuantity } from '@/features/inbound-request/utils/inbound-request-format'
import type { TransferPickAlternative, TransferPickSheetLine } from '../../types/transfer.types'
import type { PickScanState } from '../../utils/transfer-scan'
import { ScanInput, type ScanResult } from './ScanInput'
import { ScanPreferencesBar } from './ScanPreferencesBar'
import { formatTransferLocation } from '../../utils/transfer-location'

interface PickEntryDialogProps {
  readonly line: TransferPickSheetLine | null
  readonly scan: PickScanState
  readonly quantity: number
  readonly maximumQuantity: number
  readonly quantityError: string | null
  readonly isPending: boolean
  /** Quét từng đơn vị: mỗi lần quét mã hàng cộng 1 vào số lượng. */
  readonly eachUnit?: boolean
  readonly onScanSlot: (code: string) => ScanResult
  readonly onScanProduct: (code: string) => ScanResult
  readonly onQuantityChange: (value: number) => void
  readonly onUseAlternative: (alternative: TransferPickAlternative) => void
  readonly onRescan: () => void
  readonly onConfirm: () => void
  readonly onOpenChange: (open: boolean) => void
}

export function PickEntryDialog({
  line,
  scan,
  quantity,
  maximumQuantity,
  quantityError,
  isPending,
  eachUnit = false,
  onScanSlot,
  onScanProduct,
  onQuantityChange,
  onUseAlternative,
  onRescan,
  onConfirm,
  onOpenChange,
}: PickEntryDialogProps) {
  const isReady = scan.step === 'ready'
  const offered = scan.offeredAlternative
  const quantityRef = useRef<HTMLInputElement>(null)
  // Quét xong mã hàng thì con trỏ nhảy sang số lượng để nhân viên chỉ cần Enter xác nhận.
  useEffect(() => {
    // Quét từng đơn vị: con trỏ ở lại ô mã hàng để quét tiếp.
    if (!isReady || eachUnit) return
    quantityRef.current?.focus()
    quantityRef.current?.select()
  }, [isReady, eachUnit])
  return (
    <Dialog open={Boolean(line)} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        {line ? (
          <div className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Lấy hàng</DialogTitle>
              <DialogDescription>
                <span className="font-mono" translate="no">
                  {line.sku}
                </span>{' '}
                · {line.productName} · còn cần lấy {formatQuantity(line.remainingQuantity)}{' '}
                {line.baseUnitName}
              </DialogDescription>
            </DialogHeader>

            <ScanPreferencesBar showEachUnit />
            <ScanInput
              id="pick-scan-slot"
              label="1. Quét mã vị trí"
              autoFocus
              focusWhen={scan.step === 'slot'}
              confirmedValue={scan.suggestion ? formatTransferLocation(scan.suggestion) : undefined}
              error={scan.step === 'slot' ? scan.error : null}
              disabled={isPending}
              onScan={onScanSlot}
            />
            {offered ? (
              <div className="bg-muted flex flex-wrap items-center justify-between gap-2 border p-3 text-sm">
                <span>
                  <strong className="font-mono">{formatTransferLocation(offered)}</strong> có đúng
                  hàng (còn {formatQuantity(offered.availableQuantity)}). Lấy ở vị trí này thay?
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onUseAlternative(offered)}
                >
                  Lấy thay
                </Button>
              </div>
            ) : null}

            <ScanInput
              id="pick-scan-product"
              label="2. Quét mã hàng"
              focusWhen={scan.step === 'product'}
              description={
                eachUnit
                  ? `Mỗi lần quét tính 1 đơn vị (đã quét ${formatQuantity(quantity)}/${formatQuantity(maximumQuantity)}). Nhấn Enter khi ô trống để xác nhận lấy.`
                  : undefined
              }
              onEmptyEnter={eachUnit && isReady && !isPending ? onConfirm : undefined}
              confirmedValue={isReady ? scan.productCode : undefined}
              error={scan.step === 'product' ? scan.error : null}
              disabled={scan.step === 'slot' || isPending}
              onScan={onScanProduct}
            />

            <Field data-invalid={Boolean(quantityError)}>
              <FieldLabel htmlFor="pick-quantity">3. Số lượng lấy</FieldLabel>
              <Input
                id="pick-quantity"
                ref={quantityRef}
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="h-11 text-base tabular-nums"
                disabled={!isReady || isPending}
                value={Number.isFinite(quantity) ? quantity : ''}
                aria-invalid={Boolean(quantityError)}
                onChange={(event) => onQuantityChange(event.target.valueAsNumber)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' || !isReady || isPending) return
                  event.preventDefault()
                  onConfirm()
                }}
              />
              <FieldDescription>
                Tự điền theo số cần lấy tại vị trí này (tối đa {formatQuantity(maximumQuantity)}).
                Nếu thực tế ít hơn, lấy phần có và dùng Đổi vị trí/lô hoặc Báo quản lý cho phần còn
                lại.
              </FieldDescription>
              <FieldError>{quantityError}</FieldError>
            </Field>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="h-11"
                disabled={isPending}
                onClick={onRescan}
              >
                Quét lại
              </Button>
              <Button
                type="button"
                className="h-11"
                disabled={!isReady || isPending}
                onClick={onConfirm}
              >
                {isPending ? 'Đang ghi nhận…' : 'Xác nhận lấy'}
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
