import {
  Archive,
  Box,
  DoorOpen,
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
  { type: 'Aisle', label: 'Lối đi', icon: PanelsTopLeft },
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
