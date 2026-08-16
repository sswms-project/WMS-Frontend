'use client'

import {
  CircleCheck,
  CircleMinus,
  CircleOff,
  LayoutGrid,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  ScanBarcode,
  TrendingUp,
  Users,
  Warehouse,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/features/subscription/utils/format-subscription'
import { cn } from '@/lib/utils'
import type { SubscriptionPlanResponse } from '../../types/admin.types'

const BILLING_CYCLE_LABELS = {
  Monthly: 'Hàng tháng',
  Yearly: 'Hàng năm',
} as const

const FEATURE_LABELS = [
  { key: 'enableForecasting', label: 'Dự báo', icon: TrendingUp },
  { key: 'enableBarcode', label: 'Mã vạch', icon: ScanBarcode },
  { key: 'enableLayoutDesigner', label: 'Layout', icon: LayoutGrid },
] as const

interface SubscriptionPlanTableProps {
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly onEdit: (plan: SubscriptionPlanResponse) => void
  readonly onDeactivate: (plan: SubscriptionPlanResponse) => void
}

function PlanStatus({ status }: { readonly status: SubscriptionPlanResponse['status'] }) {
  const isActive = status === 'Active'
  const StatusIcon = isActive ? CircleCheck : CircleMinus

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-normal',
        isActive
          ? 'border-primary/25 bg-primary/5 text-primary'
          : 'bg-muted/40 text-muted-foreground'
      )}
    >
      <StatusIcon className="size-3" aria-hidden="true" />
      {isActive ? 'Đang cung cấp' : 'Ngừng cung cấp'}
    </Badge>
  )
}

function PlanFeatures({ plan }: { readonly plan: SubscriptionPlanResponse }) {
  const enabledFeatures = FEATURE_LABELS.filter((feature) => plan[feature.key])

  if (enabledFeatures.length === 0) {
    return <span className="text-muted-foreground">Không có</span>
  }

  return (
    <ul className="text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 whitespace-normal">
      {enabledFeatures.map((feature) => {
        const Icon = feature.icon

        return (
          <li key={feature.key} className="flex items-center gap-1">
            <Icon className="text-primary size-3" aria-hidden="true" />
            {feature.label}
          </li>
        )
      })}
    </ul>
  )
}

function PlanActions({
  plan,
  onEdit,
  onDeactivate,
}: {
  readonly plan: SubscriptionPlanResponse
  readonly onEdit: (plan: SubscriptionPlanResponse) => void
  readonly onDeactivate: (plan: SubscriptionPlanResponse) => void
}) {
  const isActive = plan.status === 'Active'

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-10 sm:size-8"
              aria-label={`Thao tác với gói ${plan.planName}`}
            >
              <MoreHorizontal
                className="transition-transform duration-200 group-aria-expanded/button:rotate-90 motion-reduce:transition-none"
                aria-hidden="true"
              />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent sideOffset={4}>Thao tác</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onSelect={() => onEdit(plan)}>
          <Pencil aria-hidden="true" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={!isActive}
          onSelect={() => onDeactivate(plan)}
        >
          <CircleOff aria-hidden="true" />
          Vô hiệu hóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PlanPrice({ plan }: { readonly plan: SubscriptionPlanResponse }) {
  return (
    <div>
      <p className="text-foreground text-sm font-semibold tabular-nums">
        {plan.price === 0 ? 'Miễn phí' : formatCurrency(plan.price)}
      </p>
      <p className="text-muted-foreground mt-0.5">{BILLING_CYCLE_LABELS[plan.billingCycle]}</p>
    </div>
  )
}

function PlanIdentity({ plan }: { readonly plan: SubscriptionPlanResponse }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="text-primary border-primary/20 bg-primary/5 group-hover/plan-row:border-primary/40 group-hover/plan-row:bg-primary/10 flex size-8 shrink-0 items-center justify-center border transition-colors duration-200 motion-reduce:transition-none">
        <PackageCheck className="size-4" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-foreground truncate text-sm font-semibold">{plan.planName}</p>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              aria-label={`Mã gói ${plan.id}`}
              className="text-muted-foreground focus-visible:ring-ring mt-0.5 inline-block max-w-32 truncate font-mono text-[11px] outline-none focus-visible:ring-1"
            >
              #{plan.id.slice(0, 8)}
            </span>
          </TooltipTrigger>
          <TooltipContent sideOffset={4}>{plan.id}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function PlanLimits({ plan }: { readonly plan: SubscriptionPlanResponse }) {
  return (
    <div className="space-y-1">
      <p className="text-foreground flex items-center gap-1.5">
        <Warehouse className="text-muted-foreground size-3.5" aria-hidden="true" />
        <span className="tabular-nums">{plan.maxWarehouses}</span> kho
      </p>
      <p className="text-muted-foreground flex items-center gap-1.5">
        <Users className="size-3.5" aria-hidden="true" />
        <span className="tabular-nums">{plan.maxUsers}</span> người dùng
      </p>
    </div>
  )
}

export function SubscriptionPlanTable({ plans, onEdit, onDeactivate }: SubscriptionPlanTableProps) {
  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[25%] pl-4">Gói dịch vụ</TableHead>
              <TableHead className="w-[16%]">Giá</TableHead>
              <TableHead className="w-[18%]">Giới hạn</TableHead>
              <TableHead>Tính năng</TableHead>
              <TableHead className="w-[15%]">Trạng thái</TableHead>
              <TableHead className="w-12 pr-3">
                <span className="sr-only">Thao tác</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow
                key={plan.id}
                className="group/plan-row hover:border-l-primary hover:bg-primary/[0.03] border-l-2 border-l-transparent"
              >
                <TableCell className="py-3 pl-4">
                  <PlanIdentity plan={plan} />
                </TableCell>
                <TableCell className="py-3">
                  <PlanPrice plan={plan} />
                </TableCell>
                <TableCell className="py-3">
                  <PlanLimits plan={plan} />
                </TableCell>
                <TableCell className="max-w-56 py-3">
                  <PlanFeatures plan={plan} />
                </TableCell>
                <TableCell className="py-3">
                  <PlanStatus status={plan.status} />
                </TableCell>
                <TableCell className="py-3 pr-3 text-right">
                  <PlanActions plan={plan} onEdit={onEdit} onDeactivate={onDeactivate} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y xl:hidden">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="group/plan-row hover:border-l-primary hover:bg-primary/[0.03] border-l-2 border-l-transparent px-3 py-4 transition-colors duration-200 motion-reduce:transition-none"
          >
            <div className="flex items-start justify-between gap-3">
              <PlanIdentity plan={plan} />
              <div className="flex shrink-0 items-center gap-2">
                <PlanStatus status={plan.status} />
                <PlanActions plan={plan} onEdit={onEdit} onDeactivate={onDeactivate} />
              </div>
            </div>

            <div className="bg-muted/20 mt-3 grid grid-cols-2 border-y text-xs">
              <div className="py-3 pr-3">
                <p className="text-muted-foreground">Giá</p>
                <div className="mt-1">
                  <PlanPrice plan={plan} />
                </div>
              </div>
              <div className="border-l py-3 pl-3">
                <p className="text-muted-foreground">Giới hạn</p>
                <div className="mt-1">
                  <PlanLimits plan={plan} />
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs">
              <p className="text-muted-foreground mb-1.5">Tính năng</p>
              <PlanFeatures plan={plan} />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
