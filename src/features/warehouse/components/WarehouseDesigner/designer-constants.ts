import {
  Archive,
  Box,
  DoorOpen,
  DoorClosed,
  ArrowRight,
  LogOut,
  Forklift,
  PackageCheck,
  PackageSearch,
  PanelsTopLeft,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import type { WarehouseLayoutDecorationType } from '../../types/warehouse-layout-scene.types'

export interface DecorationOption {
  type: WarehouseLayoutDecorationType
  label: string
  icon: LucideIcon
}

export const LAYOUT_DRAG_DATA_TYPE = 'application/x-sswms-layout-object'

export type LayoutPaletteDragData =
  | { kind: 'zone' }
  | { kind: 'rack' }
  | { kind: 'decoration'; type: WarehouseLayoutDecorationType; label: string }

export function writeLayoutDragData(dataTransfer: DataTransfer, payload: LayoutPaletteDragData) {
  dataTransfer.effectAllowed = 'copy'
  dataTransfer.setData(LAYOUT_DRAG_DATA_TYPE, JSON.stringify(payload))
}

export function readLayoutDragData(dataTransfer: DataTransfer): LayoutPaletteDragData | null {
  const value = dataTransfer.getData(LAYOUT_DRAG_DATA_TYPE)
  if (!value) return null
  try {
    const payload = JSON.parse(value) as LayoutPaletteDragData
    if (payload.kind === 'zone' || payload.kind === 'rack') return payload
    if (
      payload.kind === 'decoration' &&
      DECORATION_OPTIONS.some((option) => option.type === payload.type)
    )
      return payload
  } catch {
    return null
  }
  return null
}

export const LAYOUT_COLOR_SWATCHES = [
  '#C7E8C0',
  '#B9DDF2',
  '#FFE0A8',
  '#E4D2F4',
  '#F3C5C1',
  '#D3DDD0',
] as const

export const DECORATION_OPTIONS: DecorationOption[] = [
  { type: 'Door', label: 'Cửa ra vào', icon: DoorOpen },
  { type: 'DoubleDoor', label: 'Cửa đôi', icon: DoorClosed },
  { type: 'Aisle', label: 'Lối đi', icon: PanelsTopLeft },
  { type: 'DirectionArrow', label: 'Mũi tên chỉ hướng', icon: ArrowRight },
  { type: 'Exit', label: 'Lối ra', icon: LogOut },
  { type: 'Forklift', label: 'Xe nâng', icon: Forklift },
  { type: 'Receiving', label: 'Khu nhận hàng', icon: Forklift },
  { type: 'Packing', label: 'Khu đóng gói', icon: PackageCheck },
  { type: 'Picking', label: 'Khu lấy hàng', icon: PackageSearch },
  { type: 'Damaged', label: 'Hàng hư hỏng', icon: TriangleAlert },
  { type: 'Office', label: 'Văn phòng', icon: Archive },
  { type: 'Other', label: 'Khu vực khác', icon: Box },
]

export function getDecorationLabel(type: WarehouseLayoutDecorationType): string {
  return DECORATION_OPTIONS.find((option) => option.type === type)?.label ?? type
}
