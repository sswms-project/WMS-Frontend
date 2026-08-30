import { Archive, LoaderCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ProductResponse } from '../types/product.types'

interface ProductArchiveDialogProps {
  readonly product: ProductResponse
  readonly isPending: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}

export function ProductArchiveDialog({
  product,
  isPending,
  onOpenChange,
  onConfirm,
}: ProductArchiveDialogProps) {
  return (
    <AlertDialog open onOpenChange={(open) => !isPending && onOpenChange(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <Archive className="text-destructive" aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>Lưu trữ sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Sản phẩm <strong>{product.productName}</strong> sẽ không xuất hiện trong các giao dịch
            mới. Bạn có thể khôi phục sau.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            <Archive className="size-4" aria-hidden="true" />
            Lưu trữ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
