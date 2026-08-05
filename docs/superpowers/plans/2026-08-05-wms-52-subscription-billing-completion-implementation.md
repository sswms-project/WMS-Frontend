# WMS-52 Subscription Billing Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the TenantOwner subscription and billing UI by adding downgrade protection, payment filters, client-generated invoice PDF/print, and expired-subscription read-only UX.

**Architecture:** Keep Next.js route files as thin wrappers and keep orchestration in feature pages. Subscription API contracts, React Query hooks, invoice PDF components, and filter utilities stay under `src/features/subscription`; private read-only state is derived from the existing `/subscriptions/me` React Query cache through a feature provider mounted in the private layout. Dashboard read-only controls are guarded with backward-compatible optional props so manager/staff behavior does not change.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4 tokens, shadcn/ui, TanStack Query, Axios, Sonner, `@react-pdf/renderer`, Vitest + Testing Library, `pnpm`.

## Global Constraints

- Work in `D:\FPTUniversity\Ki9\SEP490\SSWMS_Project\SSWMS-Frontend` on branch `feat/wms-52-subscription-billing-completion`.
- Use `pnpm` only.
- Next.js route `page.tsx` files remain thin wrappers.
- Logic belongs in `src/features`; presentational subscription UI belongs in `src/features/subscription/components/SubscriptionPage`.
- Use existing shadcn/ui primitives from `src/components/ui` before creating custom primitives.
- Use semantic Tailwind design tokens from `src/app/index.css`; do not add hard-coded colors in new code.
- Do not store subscription server data in Zustand.
- Do not stage or commit local GitNexus files: `AGENTS.md`, `CLAUDE.md`, `.claude/`.
- Run GitNexus impact before editing any existing function/class/method symbol.
- Run GitNexus `detect_changes` before committing.
- Backend contract is `GET /api/payments` with `planId`, `status`, `dateFrom`, `dateTo`, and `GET /api/payments/{paymentId}/invoice-data`.
- Historical payment `planId`, `planName`, `subscriptionStartDate`, and `subscriptionEndDate` are nullable and must never be replaced with current-plan data.
- Invoice export is a billing receipt, not a legal e-invoice.

---

## File Structure

Create:

- `vitest.config.ts` configures Vitest, React plugin, jsdom, and `@` alias.
- `src/test/setup.ts` installs `@testing-library/jest-dom/vitest`.
- `src/features/subscription/utils/payment-history-query.ts` builds typed payment query params and inclusive local date-time-offset strings.
- `src/features/subscription/utils/subscription-eligibility.ts` contains downgrade/current-plan eligibility helpers.
- `src/features/subscription/utils/subscription-billing.test.ts` tests query, date, invoice filename, status, and downgrade helpers.
- `src/features/subscription/components/SubscriptionPage/PaymentHistoryFilters.tsx` renders plan/status/date/search filter form.
- `src/features/subscription/components/SubscriptionPage/InvoicePdfDocument.tsx` renders the PDF receipt using `@react-pdf/renderer`.
- `src/features/subscription/components/SubscriptionPage/InvoicePrintView.tsx` renders print-screen HTML using the same invoice data.
- `src/features/subscription/pages/InvoicePrintPage.tsx` fetches invoice JSON for print route and calls `window.print()` after render.
- `src/app/(private)/subscription/invoices/[paymentId]/print/page.tsx` thin route wrapper for print view.
- `src/features/subscription/components/SubscriptionReadOnlyProvider.tsx` provides `isReadOnly` derived from `/subscriptions/me`.
- `src/features/subscription/components/SubscriptionReadOnlyBanner.tsx` displays compact private-area expired banner.

Modify:

- `package.json` adds `@react-pdf/renderer` dependency and Vitest test tooling/scripts.
- `src/routes/api-endpoints.ts` adds `payments.invoiceData(paymentId)`.
- `src/lib/query-keys.ts` broadens payment query params and adds invoice detail key.
- `src/features/subscription/types/subscription.types.ts` adds filter, status, invoice, customer, and action-state types.
- `src/features/subscription/services/subscription.service.ts` removes blob invoice download path from UI flow and adds `getInvoiceData`.
- `src/features/subscription/hooks/use-subscription.ts` adds invoice query/mutation hooks and keeps existing subscription hooks.
- `src/features/subscription/utils/format-subscription.ts` adds payment completion/snapshot fallback helpers.
- `src/features/subscription/components/SubscriptionPage/index.ts` exports new subscription components.
- `src/features/subscription/pages/index.ts` exports `InvoicePrintPage`.
- `src/features/subscription/pages/SubscriptionPage.tsx` coordinates filters, downgrade eligibility, download PDF, and print open.
- `src/features/subscription/components/SubscriptionPage/PaymentHistoryTable.tsx` adds plan column, filter component, and disabled invoice actions.
- `src/features/subscription/components/SubscriptionPage/PlanCard.tsx` adds disabled downgrade state and tooltip.
- `src/app/(private)/layout.tsx` mounts read-only provider and banner.
- `src/features/dashboard/components/shared/QuickActionsBar.tsx` supports optional disabled/read-only action IDs.
- `src/features/dashboard/components/shared/AlertCard.tsx` supports optional disabled action and token-safe styling.
- `src/features/dashboard/components/tenant/TenantOwnerDashboard.tsx` reads read-only context and disables tenant write CTAs.

GitNexus pre-plan impact notes:

- `SubscriptionPage`, `PaymentHistoryTable`, `PlanCard`, and `PrivateLayout`: LOW risk.
- `QuickActionsBar` and `AlertCard`: HIGH risk because they are called by tenant, manager, and staff dashboards. Their changes must be additive optional props with unchanged default behavior.

---

### Task 1: Test Harness And Pure Billing Utilities

**Files:**

- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Modify: `src/features/subscription/types/subscription.types.ts`
- Modify: `src/features/subscription/utils/format-subscription.ts`
- Create: `src/features/subscription/utils/payment-history-query.ts`
- Create: `src/features/subscription/utils/subscription-eligibility.ts`
- Create: `src/features/subscription/utils/subscription-billing.test.ts`

**Interfaces:**

- Produces:
  - `PAYMENT_STATUS_VALUES: readonly ['Completed', 'Pending', 'Failed']`
  - `type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]`
  - `type PaymentStatusFilter = 'all' | PaymentStatus`
  - `interface PaymentHistoryFilterState`
  - `interface AppliedPaymentHistoryFilters`
  - `interface PaymentHistoryQuery extends QueryInfo`
  - `buildPaymentHistoryQuery(filters, pageIndex, pageSize): PaymentHistoryQuery`
  - `isInvalidPaymentDateRange(filters): boolean`
  - `isCompletedPayment(status: string): boolean`
  - `formatHistoricalPlanName(planName: string | null): string`
  - `formatInvoiceSnapshotValue(value: string | null): string`
  - `isDowngradePlan(currentPlanPrice: number | undefined, candidatePlan: SubscriptionPlanResponse): boolean`
  - `getPlanActionState(plan, currentPlan, isPending): PlanActionState`
- Consumes existing:
  - `QueryInfo`, `OrderType`
  - `SubscriptionPlanResponse`

- [ ] **Step 1: Run GitNexus impact for existing symbols**

Run:

```powershell
pnpm exec gitnexus analyze --force
```

Then call GitNexus impact before editing these existing symbols:

```ts
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'buildInvoiceFileName',
  file_path: 'src/features/subscription/utils/format-subscription.ts',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'formatPaymentStatus',
  file_path: 'src/features/subscription/utils/format-subscription.ts',
  kind: 'Function',
  direction: 'upstream',
})
```

Expected: risk is not HIGH/CRITICAL. If HIGH/CRITICAL appears, stop and report affected callers before editing.

- [ ] **Step 2: Install dependencies**

Run:

```powershell
pnpm add @react-pdf/renderer
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package.json` and `pnpm-lock.yaml` update.

- [ ] **Step 3: Add test scripts**

Edit `package.json` scripts to include:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Keep existing `dev`, `build`, `start`, `lint`, `format`, and `prepare` scripts unchanged.

- [ ] **Step 4: Create Vitest config**

Create `vitest.config.ts`:

```ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
```

- [ ] **Step 5: Create test setup**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Extend subscription types**

Add these exports to `src/features/subscription/types/subscription.types.ts`:

```ts
export const PAYMENT_STATUS_VALUES = ['Completed', 'Pending', 'Failed'] as const

export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number]

export type PaymentStatusFilter = 'all' | PaymentStatus

export type InvoiceActionKind = 'download' | 'print'

export interface PaymentHistoryFilterState {
  readonly searchText: string
  readonly planId: string
  readonly status: PaymentStatusFilter
  readonly dateFrom?: Date
  readonly dateTo?: Date
}

export interface AppliedPaymentHistoryFilters {
  readonly searchText: string
  readonly planId?: string
  readonly status?: PaymentStatus
  readonly dateFrom?: string
  readonly dateTo?: string
}

export interface PaymentHistoryQuery extends QueryInfo {
  readonly planId?: string
  readonly status?: PaymentStatus
  readonly dateFrom?: string
  readonly dateTo?: string
}

export interface InvoiceDataResponse {
  readonly paymentId: string
  readonly subscriptionId: string
  readonly planId: string | null
  readonly planName: string | null
  readonly invoiceNumber: string
  readonly amount: number
  readonly status: string
  readonly paidAt: string | null
  readonly createdAt: string
  readonly subscriptionStartDate: string | null
  readonly subscriptionEndDate: string | null
}

export interface InvoiceCustomerSnapshot {
  readonly displayName?: string
  readonly email?: string
}

export interface InvoiceActionState {
  readonly paymentId: string
  readonly kind: InvoiceActionKind
}

export interface PlanActionState {
  readonly disabled: boolean
  readonly label: string
  readonly tooltip?: string
}
```

Update `PaymentResponse` to include backend snapshots:

```ts
export interface PaymentResponse {
  id: string
  subscriptionId: string
  planId: string | null
  planName: string | null
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
}
```

Delete the old alias line:

```ts
export type PaymentHistoryQuery = QueryInfo
```

- [ ] **Step 7: Write failing utility tests**

Create `src/features/subscription/utils/subscription-billing.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type {
  PaymentHistoryFilterState,
  SubscriptionPlanResponse,
} from '../types/subscription.types'
import {
  buildInvoiceFileName,
  formatHistoricalPlanName,
  formatInvoiceSnapshotValue,
  isCompletedPayment,
} from './format-subscription'
import { buildPaymentHistoryQuery, isInvalidPaymentDateRange } from './payment-history-query'
import { getPlanActionState, isDowngradePlan } from './subscription-eligibility'

function createPlan(overrides: Partial<SubscriptionPlanResponse>): SubscriptionPlanResponse {
  return {
    id: 'plan-id',
    planName: 'Standard',
    price: 100000,
    billingCycle: 'Monthly',
    maxWarehouses: 1,
    maxUsers: 5,
    enableForecasting: false,
    enableBarcode: true,
    enableLayoutDesigner: false,
    status: 'Active',
    ...overrides,
  }
}

describe('subscription billing helpers', () => {
  it('builds payment history query with paging and selected filters only', () => {
    const filters: PaymentHistoryFilterState = {
      searchText: ' INV-001 ',
      planId: 'plan-123',
      status: 'Completed',
      dateFrom: new Date(2026, 7, 5, 12, 20, 10),
      dateTo: new Date(2026, 7, 6, 8, 0, 0),
    }

    const query = buildPaymentHistoryQuery(filters, 2, 10)

    expect(query.top).toBe(10)
    expect(query.skip).toBe(20)
    expect(query.searchText).toBe('INV-001')
    expect(query.planId).toBe('plan-123')
    expect(query.status).toBe('Completed')
    expect(query.dateFrom).toContain('2026-08-05T00:00:00')
    expect(query.dateTo).toContain('2026-08-06T23:59:59')
  })

  it('omits all-plan and all-status filters', () => {
    const query = buildPaymentHistoryQuery({ searchText: ' ', planId: 'all', status: 'all' }, 0, 10)

    expect(query.searchText).toBeUndefined()
    expect(query.planId).toBeUndefined()
    expect(query.status).toBeUndefined()
  })

  it('detects invalid date ranges', () => {
    expect(
      isInvalidPaymentDateRange({
        searchText: '',
        planId: 'all',
        status: 'all',
        dateFrom: new Date(2026, 7, 7),
        dateTo: new Date(2026, 7, 6),
      })
    ).toBe(true)
  })

  it('identifies completed payments case-insensitively', () => {
    expect(isCompletedPayment('Completed')).toBe(true)
    expect(isCompletedPayment('completed')).toBe(true)
    expect(isCompletedPayment('Pending')).toBe(false)
  })

  it('uses historical invoice fallbacks without current-plan substitution', () => {
    expect(formatHistoricalPlanName(null)).toBe('Không xác định')
    expect(formatInvoiceSnapshotValue(null)).toBe('Không có dữ liệu lịch sử')
    expect(buildInvoiceFileName('')).toBe('invoice.pdf')
  })

  it('blocks only lower-price plan changes', () => {
    expect(isDowngradePlan(200000, createPlan({ price: 100000 }))).toBe(true)
    expect(isDowngradePlan(100000, createPlan({ price: 100000, id: 'same-price' }))).toBe(false)
    expect(isDowngradePlan(undefined, createPlan({ price: 100000 }))).toBe(false)
  })

  it('returns accessible action copy for current, downgrade, and pending plans', () => {
    const currentPlan = createPlan({ id: 'current', planName: 'Current', price: 200000 })

    expect(
      getPlanActionState(createPlan({ id: 'current', price: 200000 }), currentPlan, false)
    ).toEqual({
      disabled: true,
      label: 'Đang sử dụng',
    })

    expect(
      getPlanActionState(createPlan({ id: 'lower', price: 100000 }), currentPlan, false)
    ).toEqual({
      disabled: true,
      label: 'Không hỗ trợ hạ gói',
      tooltip: 'Không hỗ trợ hạ gói',
    })

    expect(
      getPlanActionState(createPlan({ id: 'higher', price: 300000 }), currentPlan, true)
    ).toEqual({
      disabled: true,
      label: 'Đang xử lý...',
    })
  })
})
```

- [ ] **Step 8: Run tests and confirm failure**

Run:

```powershell
pnpm test -- src/features/subscription/utils/subscription-billing.test.ts
```

Expected: FAIL because `payment-history-query.ts`, `subscription-eligibility.ts`, and new helper exports do not exist.

- [ ] **Step 9: Implement payment query utility**

Create `src/features/subscription/utils/payment-history-query.ts`:

```ts
import { OrderType } from '@/types/api'
import type { PaymentHistoryFilterState, PaymentHistoryQuery } from '../types/subscription.types'

function padDatePart(value: number): string {
  return value.toString().padStart(2, '0')
}

function formatLocalDateTimeOffset(date: Date, endOfDay: boolean): string {
  const localDate = new Date(date)
  if (endOfDay) {
    localDate.setHours(23, 59, 59, 999)
  } else {
    localDate.setHours(0, 0, 0, 0)
  }

  const offsetMinutes = -localDate.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absoluteOffsetMinutes = Math.abs(offsetMinutes)
  const offsetHours = Math.floor(absoluteOffsetMinutes / 60)
  const offsetRemainderMinutes = absoluteOffsetMinutes % 60

  return [
    localDate.getFullYear(),
    '-',
    padDatePart(localDate.getMonth() + 1),
    '-',
    padDatePart(localDate.getDate()),
    'T',
    padDatePart(localDate.getHours()),
    ':',
    padDatePart(localDate.getMinutes()),
    ':',
    padDatePart(localDate.getSeconds()),
    sign,
    padDatePart(offsetHours),
    ':',
    padDatePart(offsetRemainderMinutes),
  ].join('')
}

export function isInvalidPaymentDateRange(filters: PaymentHistoryFilterState): boolean {
  if (!filters.dateFrom || !filters.dateTo) return false
  return filters.dateTo < filters.dateFrom
}

export function buildPaymentHistoryQuery(
  filters: PaymentHistoryFilterState,
  pageIndex: number,
  pageSize: number
): PaymentHistoryQuery {
  const normalizedSearchText = filters.searchText.trim()

  return {
    top: pageSize,
    skip: pageIndex * pageSize,
    searchText: normalizedSearchText || undefined,
    planId: filters.planId === 'all' ? undefined : filters.planId,
    status: filters.status === 'all' ? undefined : filters.status,
    dateFrom: filters.dateFrom ? formatLocalDateTimeOffset(filters.dateFrom, false) : undefined,
    dateTo: filters.dateTo ? formatLocalDateTimeOffset(filters.dateTo, true) : undefined,
    needTotalCount: true,
    orderBy: 'createdAt',
    orderType: OrderType.Descending,
  }
}
```

- [ ] **Step 10: Implement plan eligibility utility**

Create `src/features/subscription/utils/subscription-eligibility.ts`:

```ts
import type { PlanActionState, SubscriptionPlanResponse } from '../types/subscription.types'

export function isDowngradePlan(
  currentPlanPrice: number | undefined,
  candidatePlan: SubscriptionPlanResponse
): boolean {
  if (currentPlanPrice === undefined) return false
  return candidatePlan.price < currentPlanPrice
}

export function getPlanActionState(
  plan: SubscriptionPlanResponse,
  currentPlan: SubscriptionPlanResponse | undefined,
  isPending: boolean
): PlanActionState {
  if (currentPlan?.id === plan.id || currentPlan?.planName === plan.planName) {
    return { disabled: true, label: 'Đang sử dụng' }
  }

  if (isDowngradePlan(currentPlan?.price, plan)) {
    return {
      disabled: true,
      label: 'Không hỗ trợ hạ gói',
      tooltip: 'Không hỗ trợ hạ gói',
    }
  }

  if (isPending) {
    return { disabled: true, label: 'Đang xử lý...' }
  }

  return { disabled: false, label: 'Nâng cấp' }
}
```

- [ ] **Step 11: Extend format helpers**

Add to `src/features/subscription/utils/format-subscription.ts`:

```ts
export function isCompletedPayment(status: string): boolean {
  return status.toLowerCase() === 'completed'
}

export function formatHistoricalPlanName(planName: string | null): string {
  return planName?.trim() || 'Không xác định'
}

export function formatInvoiceSnapshotValue(value: string | null): string {
  return value?.trim() || 'Không có dữ liệu lịch sử'
}
```

Keep existing `buildInvoiceFileName(invoiceNumber: string): string` unchanged except ensure it accepts blank strings safely.

- [ ] **Step 12: Run utility tests**

Run:

```powershell
pnpm test -- src/features/subscription/utils/subscription-billing.test.ts
```

Expected: PASS.

- [ ] **Step 13: Run type/lint check for setup**

Run:

```powershell
pnpm lint
```

Expected: PASS.

- [ ] **Step 14: Commit Task 1**

Run GitNexus detect first:

```ts
mcp__gitnexus__detect_changes({ repo: 'WMS-Frontend', scope: 'all' })
```

Then stage only task files:

```powershell
git add package.json pnpm-lock.yaml vitest.config.ts src/test/setup.ts src/features/subscription/types/subscription.types.ts src/features/subscription/utils/format-subscription.ts src/features/subscription/utils/payment-history-query.ts src/features/subscription/utils/subscription-eligibility.ts src/features/subscription/utils/subscription-billing.test.ts
git commit -m "test(wms-52): add billing utility coverage"
```

Do not stage `AGENTS.md`, `CLAUDE.md`, or `.claude/`.

---

### Task 2: Payment History Filters And Downgrade UX

**Files:**

- Modify: `src/lib/query-keys.ts`
- Modify: `src/features/subscription/components/SubscriptionPage/index.ts`
- Create: `src/features/subscription/components/SubscriptionPage/PaymentHistoryFilters.tsx`
- Modify: `src/features/subscription/components/SubscriptionPage/PaymentHistoryTable.tsx`
- Modify: `src/features/subscription/components/SubscriptionPage/PlanCard.tsx`
- Modify: `src/features/subscription/pages/SubscriptionPage.tsx`

**Interfaces:**

- Consumes Task 1 helpers:
  - `PaymentHistoryFilterState`
  - `buildPaymentHistoryQuery`
  - `isInvalidPaymentDateRange`
  - `formatHistoricalPlanName`
  - `getPlanActionState`
- Produces:
  - Filter UI submit/reset flow.
  - `PaymentHistoryTable` table with plan column and action props for Task 3.

- [ ] **Step 1: Run GitNexus impact for existing symbols**

Run impact for each existing symbol before editing:

```ts
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'PaymentHistoryTable',
  file_path: 'src/features/subscription/components/SubscriptionPage/PaymentHistoryTable.tsx',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'PlanCard',
  file_path: 'src/features/subscription/components/SubscriptionPage/PlanCard.tsx',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'SubscriptionPage',
  file_path: 'src/features/subscription/pages/SubscriptionPage.tsx',
  kind: 'Function',
  direction: 'upstream',
})
```

Expected: `PaymentHistoryTable` LOW, `PlanCard` LOW, `SubscriptionPage` LOW. If not, report before editing.

- [ ] **Step 2: Update payment query key type**

Modify `src/lib/query-keys.ts`:

```ts
import type { QueryInfo } from '@/types/api'
import type { PaymentHistoryQuery } from '@/features/subscription/types/subscription.types'
```

Change payment list key:

```ts
payments: {
  all: ['payments'] as const,
  list: (params?: PaymentHistoryQuery) => ['payments', 'list', params] as const,
  invoiceData: (paymentId: string) => ['payments', 'invoice-data', paymentId] as const,
},
```

- [ ] **Step 3: Create payment filter component**

Create `src/features/subscription/components/SubscriptionPage/PaymentHistoryFilters.tsx`:

```tsx
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, RotateCcw, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  PaymentHistoryFilterState,
  PaymentStatusFilter,
  SubscriptionPlanResponse,
} from '../../types/subscription.types'

const statusOptions: readonly { readonly value: PaymentStatusFilter; readonly label: string }[] = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'Completed', label: 'Đã thanh toán' },
  { value: 'Pending', label: 'Đang xử lý' },
  { value: 'Failed', label: 'Thất bại' },
]

interface PaymentHistoryFiltersProps {
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly value: PaymentHistoryFilterState
  readonly dateRangeError?: string
  readonly onChange: (value: PaymentHistoryFilterState) => void
  readonly onSubmit: () => void
  readonly onReset: () => void
}

export function PaymentHistoryFilters({
  plans,
  value,
  dateRangeError,
  onChange,
  onSubmit,
  onReset,
}: PaymentHistoryFiltersProps) {
  return (
    <form
      className="grid min-w-0 gap-3 lg:grid-cols-[minmax(180px,1fr)_180px_180px_180px_auto_auto]"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="min-w-0 space-y-1.5">
        <Label htmlFor="payment-search">Mã hóa đơn</Label>
        <Input
          id="payment-search"
          value={value.searchText}
          placeholder="Tìm mã hóa đơn"
          onChange={(event) => onChange({ ...value, searchText: event.target.value })}
        />
      </div>

      <div className="min-w-0 space-y-1.5">
        <Label>Gói dịch vụ</Label>
        <Select value={value.planId} onValueChange={(planId) => onChange({ ...value, planId })}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả gói" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả gói</SelectItem>
            {plans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.planName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1.5">
        <Label>Trạng thái</Label>
        <Select
          value={value.status}
          onValueChange={(status) => onChange({ ...value, status: status as PaymentStatusFilter })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DatePickerField
        label="Từ ngày"
        value={value.dateFrom}
        invalid={Boolean(dateRangeError)}
        onChange={(dateFrom) => onChange({ ...value, dateFrom })}
      />

      <DatePickerField
        label="Đến ngày"
        value={value.dateTo}
        invalid={Boolean(dateRangeError)}
        onChange={(dateTo) => onChange({ ...value, dateTo })}
      />

      <div className="flex items-end gap-2">
        <Button type="submit" className="min-w-24">
          <Search className="size-4" aria-hidden="true" />
          Lọc
        </Button>
        <Button type="button" variant="outline" aria-label="Đặt lại bộ lọc" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {dateRangeError && (
        <p className="text-destructive text-sm lg:col-span-full">{dateRangeError}</p>
      )}
    </form>
  )
}

interface DatePickerFieldProps {
  readonly label: string
  readonly value?: Date
  readonly invalid: boolean
  readonly onChange: (value?: Date) => void
}

function DatePickerField({ label, value, invalid, onChange }: DatePickerFieldProps) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start gap-2 font-normal',
              invalid && 'border-destructive text-destructive'
            )}
            aria-invalid={invalid}
          >
            <CalendarIcon className="size-4" aria-hidden="true" />
            {value ? format(value, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} locale={vi} />
        </PopoverContent>
      </Popover>
    </div>
  )
}
```

- [ ] **Step 4: Export filter component**

Modify `src/features/subscription/components/SubscriptionPage/index.ts`:

```ts
export { PaymentHistoryFilters } from './PaymentHistoryFilters'
```

- [ ] **Step 5: Update PlanCard props and UI**

Modify `PlanCardProps`:

```ts
interface PlanCardProps {
  readonly plan: SubscriptionPlanResponse
  readonly actionState: PlanActionState
  readonly onUpgrade: (plan: SubscriptionPlanResponse) => void
}
```

Import `Tooltip`, `TooltipContent`, `TooltipTrigger` and `PlanActionState`.

Replace button footer with:

```tsx
<CardFooter>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="w-full">
        <Button
          type="button"
          variant={actionState.label === 'Đang sử dụng' ? 'outline' : 'default'}
          className="w-full"
          disabled={actionState.disabled}
          onClick={() => onUpgrade(plan)}
        >
          {actionState.label}
        </Button>
      </span>
    </TooltipTrigger>
    {actionState.tooltip && <TooltipContent>{actionState.tooltip}</TooltipContent>}
  </Tooltip>
</CardFooter>
```

Use the active/current card style when `actionState.label === 'Đang sử dụng'`.

- [ ] **Step 6: Update PaymentHistoryTable props**

Modify `PaymentHistoryTableProps`:

```ts
interface PaymentHistoryTableProps {
  readonly payments: readonly PaymentResponse[]
  readonly plans: readonly SubscriptionPlanResponse[]
  readonly totalCount: number
  readonly pageIndex: number
  readonly pageSize: number
  readonly filters: PaymentHistoryFilterState
  readonly dateRangeError?: string
  readonly isLoading: boolean
  readonly isError: boolean
  readonly invoiceActionState: InvoiceActionState | null
  readonly onFiltersChange: (filters: PaymentHistoryFilterState) => void
  readonly onFiltersSubmit: () => void
  readonly onFiltersReset: () => void
  readonly onPreviousPage: () => void
  readonly onNextPage: () => void
  readonly onRetry: () => void
  readonly onDownloadInvoice: (payment: PaymentResponse) => void
  readonly onPrintInvoice: (payment: PaymentResponse) => void
}
```

Import `PaymentHistoryFilters`, `SubscriptionPlanResponse`, `PaymentHistoryFilterState`, `InvoiceActionState`, `formatHistoricalPlanName`, `isCompletedPayment`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, and lucide `Printer`.

Replace the old search form in `CardHeader` with:

```tsx
<PaymentHistoryFilters
  plans={plans}
  value={filters}
  dateRangeError={dateRangeError}
  onChange={onFiltersChange}
  onSubmit={onFiltersSubmit}
  onReset={onFiltersReset}
/>
```

Add table column:

```tsx
<TableHead>Gói dịch vụ</TableHead>
```

Render each row:

```tsx
<TableCell>{formatHistoricalPlanName(payment.planName)}</TableCell>
```

Replace the PDF-only action cell with:

```tsx
<TableCell className="text-right">
  <div className="flex justify-end gap-2">
    <InvoiceActionButton
      label="PDF"
      icon="download"
      disabled={!isCompletedPayment(payment.status)}
      pending={
        invoiceActionState?.paymentId === payment.id && invoiceActionState.kind === 'download'
      }
      tooltip={
        !isCompletedPayment(payment.status) ? 'Chỉ có hóa đơn khi thanh toán hoàn tất' : undefined
      }
      onClick={() => onDownloadInvoice(payment)}
    />
    <InvoiceActionButton
      label="In"
      icon="print"
      disabled={!isCompletedPayment(payment.status)}
      pending={invoiceActionState?.paymentId === payment.id && invoiceActionState.kind === 'print'}
      tooltip={
        !isCompletedPayment(payment.status) ? 'Chỉ có hóa đơn khi thanh toán hoàn tất' : undefined
      }
      onClick={() => onPrintInvoice(payment)}
    />
  </div>
</TableCell>
```

Define helper component at bottom:

```tsx
interface InvoiceActionButtonProps {
  readonly label: string
  readonly icon: 'download' | 'print'
  readonly disabled: boolean
  readonly pending: boolean
  readonly tooltip?: string
  readonly onClick: () => void
}

function InvoiceActionButton({
  label,
  icon,
  disabled,
  pending,
  tooltip,
  onClick,
}: InvoiceActionButtonProps) {
  const Icon = icon === 'download' ? Download : Printer
  const button = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || pending}
      onClick={onClick}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {pending ? 'Đang xử lý...' : label}
    </Button>
  )

  if (!tooltip) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>{button}</span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}
```

- [ ] **Step 7: Update SubscriptionPage filter state**

In `src/features/subscription/pages/SubscriptionPage.tsx`, replace old search state with:

```ts
const defaultPaymentFilters: PaymentHistoryFilterState = {
  searchText: '',
  planId: 'all',
  status: 'all',
}
```

Inside component:

```ts
const [paymentFilters, setPaymentFilters] =
  useState<PaymentHistoryFilterState>(defaultPaymentFilters)
const [appliedPaymentFilters, setAppliedPaymentFilters] =
  useState<PaymentHistoryFilterState>(defaultPaymentFilters)
const [dateRangeError, setDateRangeError] = useState<string>()
```

Replace `paymentQuery`:

```ts
const paymentQuery = useMemo(
  () => buildPaymentHistoryQuery(appliedPaymentFilters, paymentPageIndex, PAYMENT_PAGE_SIZE),
  [appliedPaymentFilters, paymentPageIndex]
)
```

Add handlers:

```ts
const handleFiltersSubmit = () => {
  if (isInvalidPaymentDateRange(paymentFilters)) {
    setDateRangeError('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.')
    return
  }

  setDateRangeError(undefined)
  setPaymentPageIndex(0)
  setAppliedPaymentFilters(paymentFilters)
}

const handleFiltersReset = () => {
  setDateRangeError(undefined)
  setPaymentPageIndex(0)
  setPaymentFilters(defaultPaymentFilters)
  setAppliedPaymentFilters(defaultPaymentFilters)
}
```

- [ ] **Step 8: Update SubscriptionPage plan cards**

Import `getPlanActionState` and pass:

```tsx
const planActionState = getPlanActionState(plan, currentPlan, isActionPending)

<PlanCard
  key={plan.id}
  plan={plan}
  actionState={planActionState}
  onUpgrade={(selectedPlan) => {
    if (planActionState.disabled) return
    setDialogState({ type: 'upgrade', plan: selectedPlan })
  }}
/>
```

- [ ] **Step 9: Update PaymentHistoryTable call**

Pass new props:

```tsx
<PaymentHistoryTable
  payments={payments}
  plans={activePlans}
  totalCount={totalPayments}
  pageIndex={paymentPageIndex}
  pageSize={PAYMENT_PAGE_SIZE}
  filters={paymentFilters}
  dateRangeError={dateRangeError}
  isLoading={paymentsQuery.isLoading || paymentsQuery.isFetching}
  isError={paymentsQuery.isError}
  invoiceActionState={null}
  onFiltersChange={setPaymentFilters}
  onFiltersSubmit={handleFiltersSubmit}
  onFiltersReset={handleFiltersReset}
  onPreviousPage={() => setPaymentPageIndex((page) => Math.max(0, page - 1))}
  onNextPage={() => setPaymentPageIndex((page) => page + 1)}
  onRetry={() => paymentsQuery.refetch()}
  onDownloadInvoice={handleDownloadInvoice}
  onPrintInvoice={() => undefined}
/>
```

Task 3 replaces `invoiceActionState={null}` and `onPrintInvoice`.

- [ ] **Step 10: Run tests and lint**

Run:

```powershell
pnpm test -- src/features/subscription/utils/subscription-billing.test.ts
pnpm lint
```

Expected: PASS.

- [ ] **Step 11: Commit Task 2**

Run:

```ts
mcp__gitnexus__detect_changes({ repo: 'WMS-Frontend', scope: 'all' })
```

Then:

```powershell
git add src/lib/query-keys.ts src/features/subscription/components/SubscriptionPage/index.ts src/features/subscription/components/SubscriptionPage/PaymentHistoryFilters.tsx src/features/subscription/components/SubscriptionPage/PaymentHistoryTable.tsx src/features/subscription/components/SubscriptionPage/PlanCard.tsx src/features/subscription/pages/SubscriptionPage.tsx
git commit -m "feat(wms-52): add payment filters and downgrade guard"
```

---

### Task 3: Client Invoice Data, PDF Download, And Print Route

**Files:**

- Modify: `src/routes/api-endpoints.ts`
- Modify: `src/lib/query-keys.ts`
- Modify: `src/features/subscription/types/subscription.types.ts`
- Modify: `src/features/subscription/services/subscription.service.ts`
- Modify: `src/features/subscription/hooks/use-subscription.ts`
- Create: `src/features/subscription/components/SubscriptionPage/InvoicePdfDocument.tsx`
- Create: `src/features/subscription/components/SubscriptionPage/InvoicePrintView.tsx`
- Modify: `src/features/subscription/components/SubscriptionPage/index.ts`
- Create: `src/features/subscription/pages/InvoicePrintPage.tsx`
- Modify: `src/features/subscription/pages/index.ts`
- Create: `src/app/(private)/subscription/invoices/[paymentId]/print/page.tsx`
- Modify: `src/features/subscription/pages/SubscriptionPage.tsx`

**Interfaces:**

- Consumes Task 1 types/helpers:
  - `InvoiceDataResponse`
  - `InvoiceCustomerSnapshot`
  - `InvoiceActionState`
  - `buildInvoiceFileName`
  - `formatInvoiceSnapshotValue`
  - `isCompletedPayment`
- Produces:
  - `subscriptionService.getInvoiceData(paymentId: string)`
  - `useInvoiceDataQuery(paymentId, enabled)`
  - `useInvoiceDataMutation()`
  - `<InvoicePdfDocument invoice={invoice} customer={customer} />`
  - `<InvoicePrintPage paymentId={paymentId} />`

- [ ] **Step 1: Read Next dynamic route docs before route code**

Run:

```powershell
Get-Content -LiteralPath 'node_modules\\next\\dist\\docs\\app\\api-reference\\file-conventions\\page.mdx'
```

Expected: confirm whether `params` is a Promise for this Next version. If docs path is missing, run:

```powershell
rg "params.*Promise" node_modules/next/dist/docs -g "page.mdx"
```

- [ ] **Step 2: Run GitNexus impact for existing symbols**

Run:

```ts
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'useDownloadInvoiceMutation',
  file_path: 'src/features/subscription/hooks/use-subscription.ts',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'downloadInvoice',
  file_path: 'src/features/subscription/services/subscription.service.ts',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'SubscriptionPage',
  file_path: 'src/features/subscription/pages/SubscriptionPage.tsx',
  kind: 'Function',
  direction: 'upstream',
})
```

Expected: no HIGH/CRITICAL. `downloadInvoice` may be hard for GitNexus to identify because it is an object property; if ambiguous, use context on `subscriptionService`.

- [ ] **Step 3: Add endpoint**

Modify `src/routes/api-endpoints.ts`:

```ts
payments: {
  history: '/payments',
  invoice: (paymentId: string) => `/payments/${paymentId}/invoice`,
  invoiceData: (paymentId: string) => `/payments/${paymentId}/invoice-data`,
},
```

Keep `invoice` for backward compatibility; the UI will use `invoiceData`.

- [ ] **Step 4: Add service method**

In `src/features/subscription/services/subscription.service.ts`, import `InvoiceDataResponse` and add:

```ts
getInvoiceData: (paymentId: string) =>
  axiosClient
    .get<ApiResponse<InvoiceDataResponse>>(API_ENDPOINTS.payments.invoiceData(paymentId))
    .then((response) => response.data),
```

Remove `DownloadInvoiceRequestDto`, `DownloadInvoiceResponseDto`, `getFileNameFromDisposition`, and `downloadInvoice` only if no UI code still imports them after this task.

- [ ] **Step 5: Add hooks**

In `src/features/subscription/hooks/use-subscription.ts`, import `InvoiceDataResponse` and add:

```ts
export function useInvoiceDataQuery(paymentId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.payments.invoiceData(paymentId),
    queryFn: () => subscriptionService.getInvoiceData(paymentId).then((response) => response.data),
    enabled,
  })
}

export function useInvoiceDataMutation() {
  return useMutation<InvoiceDataResponse, ApiErrorResponse, string>({
    mutationFn: (paymentId) =>
      subscriptionService.getInvoiceData(paymentId).then((response) => response.data),
    onError: (error) => {
      console.error(error)
      toast.error(error.message ?? 'Không thể chuẩn bị hóa đơn. Vui lòng thử lại.')
    },
  })
}
```

- [ ] **Step 6: Create PDF document**

Create `src/features/subscription/components/SubscriptionPage/InvoicePdfDocument.tsx`:

```tsx
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { InvoiceCustomerSnapshot, InvoiceDataResponse } from '../../types/subscription.types'
import {
  formatCurrency,
  formatDate,
  formatHistoricalPlanName,
  formatInvoiceSnapshotValue,
  formatPaymentStatus,
} from '../../utils/format-subscription'

interface InvoicePdfDocumentProps {
  readonly invoice: InvoiceDataResponse
  readonly customer: InvoiceCustomerSnapshot
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    color: '#18232f',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  brand: {
    fontSize: 20,
    fontWeight: 700,
  },
  muted: {
    color: '#3f5442',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 12,
  },
  section: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#d5ecc8',
    paddingVertical: 7,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#eaf7e2',
    fontSize: 13,
    fontWeight: 700,
  },
  note: {
    marginTop: 24,
    fontSize: 10,
    color: '#3f5442',
    lineHeight: 1.5,
  },
})

export function InvoicePdfDocument({ invoice, customer }: InvoicePdfDocumentProps) {
  const customerName = customer.displayName?.trim() || 'TenantOwner'
  const customerEmail = customer.email?.trim() || 'Không có dữ liệu lịch sử'

  return (
    <Document title={invoice.invoiceNumber || 'invoice'}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>KOVIA</Text>
            <Text style={styles.muted}>Warehouse Management SaaS</Text>
          </View>
          <View>
            <Text>Biên nhận thanh toán</Text>
            <Text style={styles.muted}>{invoice.invoiceNumber || 'invoice'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Thông tin hóa đơn</Text>
          <InvoiceRow label="Khách hàng" value={customerName} />
          <InvoiceRow label="Email" value={customerEmail} />
          <InvoiceRow label="Gói dịch vụ" value={formatHistoricalPlanName(invoice.planName)} />
          <InvoiceRow label="Trạng thái" value={formatPaymentStatus(invoice.status)} />
          <InvoiceRow label="Ngày tạo" value={formatDate(invoice.createdAt)} />
          <InvoiceRow label="Ngày thanh toán" value={formatDate(invoice.paidAt)} />
          <InvoiceRow
            label="Bắt đầu subscription"
            value={formatInvoiceSnapshotValue(
              invoice.subscriptionStartDate ? formatDate(invoice.subscriptionStartDate) : null
            )}
          />
          <InvoiceRow
            label="Kết thúc subscription"
            value={formatInvoiceSnapshotValue(
              invoice.subscriptionEndDate ? formatDate(invoice.subscriptionEndDate) : null
            )}
          />
        </View>

        <View style={styles.totalRow}>
          <Text>Tổng thanh toán</Text>
          <Text>{formatCurrency(invoice.amount)}</Text>
        </View>

        <Text style={styles.note}>
          Biên nhận này được tạo từ dữ liệu thanh toán hiện có của hệ thống. Tài liệu này không phải
          hóa đơn điện tử hợp pháp, không bao gồm thuế, chữ ký số hoặc thông tin pháp lý ngoài dữ
          liệu Backend cung cấp.
        </Text>
      </Page>
    </Document>
  )
}

function InvoiceRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.muted}>{label}</Text>
      <Text>{value}</Text>
    </View>
  )
}
```

- [ ] **Step 7: Create print view component**

Create `src/features/subscription/components/SubscriptionPage/InvoicePrintView.tsx`:

```tsx
import { Badge } from '@/components/ui/badge'
import type { InvoiceCustomerSnapshot, InvoiceDataResponse } from '../../types/subscription.types'
import {
  formatCurrency,
  formatDate,
  formatHistoricalPlanName,
  formatInvoiceSnapshotValue,
  formatPaymentStatus,
} from '../../utils/format-subscription'

interface InvoicePrintViewProps {
  readonly invoice: InvoiceDataResponse
  readonly customer: InvoiceCustomerSnapshot
}

export function InvoicePrintView({ invoice, customer }: InvoicePrintViewProps) {
  const customerName = customer.displayName?.trim() || 'TenantOwner'
  const customerEmail = customer.email?.trim() || 'Không có dữ liệu lịch sử'

  return (
    <main className="bg-background min-h-screen px-4 py-8 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 16mm;
          }
          body {
            background: white !important;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
      <section className="border-border bg-card text-foreground mx-auto max-w-3xl rounded-md border p-6 print:border-0 print:bg-white print:p-0">
        <header className="border-border flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xl font-semibold">KOVIA</p>
            <p className="text-muted-foreground text-sm">Warehouse Management SaaS</p>
          </div>
          <div className="text-left sm:text-right">
            <Badge>Biên nhận thanh toán</Badge>
            <p className="mt-2 font-mono text-sm">{invoice.invoiceNumber || 'invoice'}</p>
          </div>
        </header>

        <div className="grid gap-3 py-6">
          <PrintRow label="Khách hàng" value={customerName} />
          <PrintRow label="Email" value={customerEmail} />
          <PrintRow label="Gói dịch vụ" value={formatHistoricalPlanName(invoice.planName)} />
          <PrintRow label="Trạng thái" value={formatPaymentStatus(invoice.status)} />
          <PrintRow label="Ngày tạo" value={formatDate(invoice.createdAt)} />
          <PrintRow label="Ngày thanh toán" value={formatDate(invoice.paidAt)} />
          <PrintRow
            label="Bắt đầu subscription"
            value={formatInvoiceSnapshotValue(
              invoice.subscriptionStartDate ? formatDate(invoice.subscriptionStartDate) : null
            )}
          />
          <PrintRow
            label="Kết thúc subscription"
            value={formatInvoiceSnapshotValue(
              invoice.subscriptionEndDate ? formatDate(invoice.subscriptionEndDate) : null
            )}
          />
        </div>

        <div className="bg-muted print:border-border flex items-center justify-between rounded-md p-4 font-semibold print:border print:bg-white">
          <span>Tổng thanh toán</span>
          <span>{formatCurrency(invoice.amount)}</span>
        </div>

        <p className="text-muted-foreground mt-6 text-xs leading-5">
          Biên nhận này được tạo từ dữ liệu thanh toán hiện có của hệ thống. Tài liệu này không phải
          hóa đơn điện tử hợp pháp, không bao gồm thuế, chữ ký số hoặc thông tin pháp lý ngoài dữ
          liệu Backend cung cấp.
        </p>
      </section>
    </main>
  )
}

function PrintRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="border-border flex flex-col gap-1 border-b py-2 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
```

- [ ] **Step 8: Export invoice components**

Modify `src/features/subscription/components/SubscriptionPage/index.ts`:

```ts
export { InvoicePdfDocument } from './InvoicePdfDocument'
export { InvoicePrintView } from './InvoicePrintView'
```

- [ ] **Step 9: Create print page**

Create `src/features/subscription/pages/InvoicePrintPage.tsx`:

```tsx
'use client'

import { useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth.store'
import { InvoicePrintView } from '../components/SubscriptionPage'
import { useInvoiceDataQuery } from '../hooks/use-subscription'

interface InvoicePrintPageProps {
  readonly paymentId: string
}

export function InvoicePrintPage({ paymentId }: InvoicePrintPageProps) {
  const user = useAuthStore((state) => state.user)
  const invoiceQuery = useInvoiceDataQuery(paymentId, Boolean(paymentId))

  useEffect(() => {
    if (!invoiceQuery.data) return
    const printTimer = window.setTimeout(() => window.print(), 250)
    return () => window.clearTimeout(printTimer)
  }, [invoiceQuery.data])

  if (invoiceQuery.isLoading) {
    return (
      <main className="mx-auto max-w-3xl space-y-3 p-6">
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-96 w-full" />
      </main>
    )
  }

  if (invoiceQuery.isError || !invoiceQuery.data) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <Alert variant="destructive">
          <AlertTitle>Không thể tải hóa đơn</AlertTitle>
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Vui lòng thử lại trước khi in.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => invoiceQuery.refetch()}
            >
              Tải lại
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    )
  }

  return (
    <InvoicePrintView
      invoice={invoiceQuery.data}
      customer={{ displayName: user?.fullName ?? user?.email, email: user?.email }}
    />
  )
}
```

- [ ] **Step 10: Export print page**

Modify `src/features/subscription/pages/index.ts`:

```ts
export { InvoicePrintPage } from './InvoicePrintPage'
```

- [ ] **Step 11: Create thin route wrapper**

Create `src/app/(private)/subscription/invoices/[paymentId]/print/page.tsx`:

```tsx
import { InvoicePrintPage } from '@/features/subscription/pages'

interface SubscriptionInvoicePrintRoutePageProps {
  readonly params: Promise<{
    readonly paymentId: string
  }>
}

export default async function SubscriptionInvoicePrintRoutePage({
  params,
}: SubscriptionInvoicePrintRoutePageProps) {
  const { paymentId } = await params
  return <InvoicePrintPage paymentId={paymentId} />
}
```

If Step 1 shows `params` is not a Promise in this Next version, use:

```tsx
interface SubscriptionInvoicePrintRoutePageProps {
  readonly params: {
    readonly paymentId: string
  }
}

export default function SubscriptionInvoicePrintRoutePage({
  params,
}: SubscriptionInvoicePrintRoutePageProps) {
  return <InvoicePrintPage paymentId={params.paymentId} />
}
```

- [ ] **Step 12: Update SubscriptionPage invoice actions**

In `SubscriptionPage.tsx`, replace `useDownloadInvoiceMutation` with `useInvoiceDataMutation`; import `pdf` and `InvoicePdfDocument`.

Add state:

```ts
const [invoiceActionState, setInvoiceActionState] = useState<InvoiceActionState | null>(null)
const invoiceDataMutation = useInvoiceDataMutation()
const invoiceCustomer = useMemo(
  () => ({ displayName: user?.fullName ?? user?.email, email: user?.email }),
  [user?.email, user?.fullName]
)
```

Replace download handler:

```ts
const handleDownloadInvoice = async (payment: PaymentResponse) => {
  if (!isCompletedPayment(payment.status)) return

  setInvoiceActionState({ paymentId: payment.id, kind: 'download' })
  try {
    const invoice = await invoiceDataMutation.mutateAsync(payment.id)
    const blob = await pdf(<InvoicePdfDocument invoice={invoice} customer={invoiceCustomer} />).toBlob()
    downloadBlob(blob, buildInvoiceFileName(invoice.invoiceNumber))
  } catch (error) {
    console.error(error)
  } finally {
    setInvoiceActionState(null)
  }
}
```

Add print handler:

```ts
const handlePrintInvoice = async (payment: PaymentResponse) => {
  if (!isCompletedPayment(payment.status)) return

  setInvoiceActionState({ paymentId: payment.id, kind: 'print' })
  try {
    await invoiceDataMutation.mutateAsync(payment.id)
    const printWindow = window.open(
      `/subscription/invoices/${payment.id}/print`,
      '_blank',
      'noopener,noreferrer'
    )
    if (!printWindow) {
      throw new Error('Popup blocked')
    }
  } catch (error) {
    console.error(error)
  } finally {
    setInvoiceActionState(null)
  }
}
```

Pass:

```tsx
invoiceActionState = { invoiceActionState }
onPrintInvoice = { handlePrintInvoice }
```

- [ ] **Step 13: Run focused tests and build**

Run:

```powershell
pnpm test -- src/features/subscription/utils/subscription-billing.test.ts
pnpm lint
pnpm build
```

Expected: PASS.

- [ ] **Step 14: Commit Task 3**

Run:

```ts
mcp__gitnexus__detect_changes({ repo: 'WMS-Frontend', scope: 'all' })
```

Then:

```powershell
git add src/routes/api-endpoints.ts src/lib/query-keys.ts src/features/subscription/types/subscription.types.ts src/features/subscription/services/subscription.service.ts src/features/subscription/hooks/use-subscription.ts src/features/subscription/components/SubscriptionPage/InvoicePdfDocument.tsx src/features/subscription/components/SubscriptionPage/InvoicePrintView.tsx src/features/subscription/components/SubscriptionPage/index.ts src/features/subscription/pages/InvoicePrintPage.tsx src/features/subscription/pages/index.ts ":(literal)src/app/(private)/subscription/invoices/[paymentId]/print/page.tsx" src/features/subscription/pages/SubscriptionPage.tsx
git commit -m "feat(wms-52): generate invoices from client data"
```

---

### Task 4: Expired Subscription Read-Only Provider And Tenant Dashboard Guards

**Files:**

- Create: `src/features/subscription/components/SubscriptionReadOnlyProvider.tsx`
- Create: `src/features/subscription/components/SubscriptionReadOnlyBanner.tsx`
- Modify: `src/app/(private)/layout.tsx`
- Modify: `src/features/dashboard/types/index.ts`
- Modify: `src/features/dashboard/components/shared/QuickActionsBar.tsx`
- Modify: `src/features/dashboard/components/shared/AlertCard.tsx`
- Modify: `src/features/dashboard/components/tenant/TenantOwnerDashboard.tsx`

**Interfaces:**

- Produces:
  - `useSubscriptionReadOnly(): { isReadOnly: boolean; isLoading: boolean; reason: string }`
  - `<SubscriptionReadOnlyProvider>{children}</SubscriptionReadOnlyProvider>`
  - `<SubscriptionReadOnlyBanner />`
  - `QuickAction.readOnlyWrite?: boolean`
  - Optional props on dashboard components that default to unrestricted behavior.

- [ ] **Step 1: Run GitNexus impact for existing symbols**

Run:

```ts
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'PrivateLayout',
  file_path: 'src/app/(private)/layout.tsx',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'QuickActionsBar',
  file_path: 'src/features/dashboard/components/shared/QuickActionsBar.tsx',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'AlertCard',
  file_path: 'src/features/dashboard/components/shared/AlertCard.tsx',
  kind: 'Function',
  direction: 'upstream',
})
mcp__gitnexus__impact({
  repo: 'WMS-Frontend',
  target: 'TenantOwnerDashboard',
  file_path: 'src/features/dashboard/components/tenant/TenantOwnerDashboard.tsx',
  kind: 'Function',
  direction: 'upstream',
})
```

Expected:

- `PrivateLayout` LOW.
- `TenantOwnerDashboard` scoped to tenant dashboard.
- `QuickActionsBar` and `AlertCard` HIGH; continue only with additive optional props and unchanged default behavior.

- [ ] **Step 2: Create read-only provider**

Create `src/features/subscription/components/SubscriptionReadOnlyProvider.tsx`:

```tsx
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { USER_ROLES } from '@/config/roles'
import { useAuthStore } from '@/stores/auth.store'
import { useCurrentSubscriptionQuery } from '../hooks/use-subscription'

interface SubscriptionReadOnlyContextValue {
  readonly isReadOnly: boolean
  readonly isLoading: boolean
  readonly reason: string
}

const SubscriptionReadOnlyContext = createContext<SubscriptionReadOnlyContextValue | null>(null)

const READ_ONLY_REASON =
  'Subscription đã hết hạn. Vui lòng gia hạn để tiếp tục thao tác ghi dữ liệu.'

export function SubscriptionReadOnlyProvider({ children }: { readonly children: ReactNode }) {
  const user = useAuthStore((state) => state.user)
  const isTenantOwner = user?.role === USER_ROLES.TenantOwner
  const subscriptionQuery = useCurrentSubscriptionQuery(isTenantOwner)
  const isReadOnly = isTenantOwner && Boolean(subscriptionQuery.data?.isExpired)

  return (
    <SubscriptionReadOnlyContext.Provider
      value={{
        isReadOnly,
        isLoading: subscriptionQuery.isLoading,
        reason: READ_ONLY_REASON,
      }}
    >
      {children}
    </SubscriptionReadOnlyContext.Provider>
  )
}

export function useSubscriptionReadOnly(): SubscriptionReadOnlyContextValue {
  const context = useContext(SubscriptionReadOnlyContext)
  if (!context) {
    return {
      isReadOnly: false,
      isLoading: false,
      reason: READ_ONLY_REASON,
    }
  }
  return context
}
```

- [ ] **Step 3: Create banner**

Create `src/features/subscription/components/SubscriptionReadOnlyBanner.tsx`:

```tsx
'use client'

import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { APP_ROUTES } from '@/routes/app-routes'
import { useSubscriptionReadOnly } from './SubscriptionReadOnlyProvider'

export function SubscriptionReadOnlyBanner() {
  const { isReadOnly } = useSubscriptionReadOnly()

  if (!isReadOnly) return null

  return (
    <Alert variant="destructive" className="mb-3">
      <ShieldAlert className="size-4" aria-hidden="true" />
      <AlertTitle>Tenant đang ở chế độ chỉ đọc</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Gia hạn subscription để tiếp tục các thao tác tạo, sửa, xóa, nhập và xác nhận dữ liệu vận
          hành.
        </span>
        <Button asChild size="sm" variant="outline">
          <Link href={APP_ROUTES.subscription}>Gia hạn ngay</Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
```

- [ ] **Step 4: Mount provider in private layout**

Modify `src/app/(private)/layout.tsx`:

```tsx
import { SubscriptionReadOnlyBanner } from '@/features/subscription/components/SubscriptionReadOnlyBanner'
import { SubscriptionReadOnlyProvider } from '@/features/subscription/components/SubscriptionReadOnlyProvider'
```

Wrap sidebar area:

```tsx
<SubscriptionReadOnlyProvider>
  <SidebarProvider>
    <div className="print:hidden">
      <AppSidebar />
    </div>
    <SidebarInset className="min-w-0 overflow-x-hidden print:m-0 print:block">
      <div className="print:hidden">
        <AppHeader />
      </div>
      <div className="min-w-0 flex-1 p-3 sm:p-4 lg:p-5 print:p-0">
        <SubscriptionReadOnlyBanner />
        <PageTransition>{children}</PageTransition>
      </div>
    </SidebarInset>
  </SidebarProvider>
</SubscriptionReadOnlyProvider>
```

Then update the banner render to avoid printing it:

```tsx
<div className="print:hidden">
  <SubscriptionReadOnlyBanner />
</div>
```

- [ ] **Step 5: Extend QuickAction type**

Modify `src/features/dashboard/types/index.ts`:

```ts
export interface QuickAction {
  id: string
  label: string
  icon: string
  href: string
  description: string
  readOnlyWrite?: boolean
}
```

- [ ] **Step 6: Mark tenant write actions**

Modify `tenantOwnerQuickActions` in `src/features/dashboard/utils/sample-data.ts`:

```ts
{
  id: '1',
  label: 'Tạo đơn hàng',
  icon: 'package',
  href: '/orders/create',
  description: 'Tạo đơn hàng mới',
  readOnlyWrite: true,
},
```

Leave report/settings view actions without `readOnlyWrite`.

- [ ] **Step 7: Update QuickActionsBar with optional guard**

Modify props:

```ts
interface QuickActionsBarProps {
  readonly actions: QuickAction[]
  readonly readOnly?: boolean
  readonly readOnlyReason?: string
}
```

Import `Button`, `Tooltip`, `TooltipContent`, `TooltipTrigger`, and `cn`.

For each action:

```tsx
const disabled = Boolean(readOnly && action.readOnlyWrite)
```

If disabled, render:

```tsx
<Tooltip key={action.id}>
  <TooltipTrigger asChild>
    <span className="shrink-0">
      <Button type="button" variant="ghost" disabled className="gap-2 rounded-none px-3 py-2">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {action.label}
      </Button>
    </span>
  </TooltipTrigger>
  <TooltipContent>{readOnlyReason}</TooltipContent>
</Tooltip>
```

If not disabled, keep the existing `Link` behavior and classes. Default props must leave manager/staff dashboards unchanged.

- [ ] **Step 8: Update AlertCard with optional disabled action**

Modify props:

```ts
interface AlertCardProps {
  type: 'warning' | 'info' | 'success'
  title: string
  description: string
  actionLabel: string
  onAction?: () => void
  disabled?: boolean
  disabledReason?: string
}
```

Replace hard-coded color config with semantic token classes:

```ts
const alertConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-muted border-border',
    iconColor: 'text-destructive',
  },
  info: {
    icon: Zap,
    bg: 'bg-muted border-border',
    iconColor: 'text-tertiary',
  },
  success: {
    icon: CheckCircle,
    bg: 'bg-muted border-border',
    iconColor: 'text-primary',
  },
}
```

Wrap the button with tooltip only when disabled:

```tsx
const actionButton = (
  <Button size="sm" variant="default" className="mt-4" disabled={disabled} onClick={onAction}>
    {actionLabel}
  </Button>
)
```

Use:

```tsx
{
  disabled && disabledReason ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">{actionButton}</span>
      </TooltipTrigger>
      <TooltipContent>{disabledReason}</TooltipContent>
    </Tooltip>
  ) : (
    actionButton
  )
}
```

- [ ] **Step 9: Apply guard to tenant dashboard**

Modify `TenantOwnerDashboard.tsx`:

```ts
import { useSubscriptionReadOnly } from '@/features/subscription/components/SubscriptionReadOnlyProvider'
```

Inside component:

```ts
const { isReadOnly, reason: readOnlyReason } = useSubscriptionReadOnly()
```

Pass:

```tsx
<QuickActionsBar
  actions={tenantOwnerQuickActions}
  readOnly={isReadOnly}
  readOnlyReason={readOnlyReason}
/>
```

Pass disabled action:

```tsx
<AlertCard
  type="info"
  title="Đề xuất thông minh"
  description="Đề xuất nhập thêm SKU-182 tại Zone A — dự báo nhu cầu cao cho ca làm việc tiếp theo."
  actionLabel="Thực hiện nhập kho"
  disabled={isReadOnly}
  disabledReason={readOnlyReason}
/>
```

- [ ] **Step 10: Run tests/lint/build**

Run:

```powershell
pnpm test -- src/features/subscription/utils/subscription-billing.test.ts
pnpm lint
pnpm build
```

Expected: PASS.

- [ ] **Step 11: Commit Task 4**

Run:

```ts
mcp__gitnexus__detect_changes({ repo: 'WMS-Frontend', scope: 'all' })
```

Then:

```powershell
git add src/features/subscription/components/SubscriptionReadOnlyProvider.tsx src/features/subscription/components/SubscriptionReadOnlyBanner.tsx "src/app/(private)/layout.tsx" src/features/dashboard/types/index.ts src/features/dashboard/utils/sample-data.ts src/features/dashboard/components/shared/QuickActionsBar.tsx src/features/dashboard/components/shared/AlertCard.tsx src/features/dashboard/components/tenant/TenantOwnerDashboard.tsx
git commit -m "feat(wms-52): add expired tenant read-only ux"
```

---

### Task 5: Manual Verification, Final Build, And Branch Commit Hygiene

**Files:**

- Verify all changed files.
- Do not stage `AGENTS.md`, `CLAUDE.md`, `.claude/`.

**Interfaces:**

- Consumes all previous tasks.
- Produces final verified branch ready to push/PR.

- [ ] **Step 1: Check worktree**

Run:

```powershell
git status --short --branch
```

Expected:

- Code commits are ahead of `origin/dev`.
- Only local GitNexus files may remain unstaged:
  - `M AGENTS.md`
  - `M CLAUDE.md`
  - `?? .claude/`

- [ ] **Step 2: Run full verification**

Run:

```powershell
pnpm test
pnpm lint
pnpm build
```

Expected: all PASS.

- [ ] **Step 3: Start local app**

Run:

```powershell
pnpm dev
```

If port `3000` is busy, run:

```powershell
pnpm exec next dev --turbopack -p 3001
```

Expected: app starts on `http://localhost:3000` or `http://localhost:3001`.

- [ ] **Step 4: Manual subscription checks**

Use a TenantOwner account and check:

- `/subscription` renders current plan and active plans.
- Lower-price plans show disabled `Không hỗ trợ hạ gói`.
- Same-price non-current plan remains eligible.
- Payment filter submit sends selected `planId`, `status`, `dateFrom`, and `dateTo`.
- Invalid date range shows `Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.` and does not replace current results.
- Completed payment shows enabled PDF and print actions.
- Pending/Failed payment actions are disabled with tooltip.
- PDF download filename uses `<invoiceNumber>.pdf` or `invoice.pdf`.
- Print route `/subscription/invoices/{paymentId}/print` renders receipt and opens print dialog after data loads.

- [ ] **Step 5: Manual read-only checks**

Use or simulate an expired TenantOwner and check:

- Private layout shows compact destructive read-only banner with `/subscription` link.
- Tenant dashboard write CTAs are disabled.
- Report/settings view links remain usable.
- `/subscription` renew/payment/filter/PDF/print actions remain usable.
- SystemAdmin role permissions screen is not restricted by the TenantOwner read-only state.
- `/settings/security` account security actions remain usable.

- [ ] **Step 6: GitNexus final detect**

Run:

```ts
mcp__gitnexus__detect_changes({ repo: 'WMS-Frontend', scope: 'all' })
```

Expected:

- Affected scope is subscription billing and tenant dashboard read-only UI.
- No unexpected auth/public/admin restrictions.

- [ ] **Step 7: Final status**

Run:

```powershell
git status --short --branch
git log --oneline --decorate -5
```

Expected:

- Branch has task commits.
- Local GitNexus files are uncommitted.

Report exact verification results to the user.

---

## Self-Review Notes

Spec coverage:

- Downgrade guard: Task 1 utility + Task 2 `PlanCard`/`SubscriptionPage`.
- Payment filters: Task 1 query builder + Task 2 filter UI/query key.
- Invoice JSON/PDF/print: Task 3 endpoint/service/hooks/PDF/print route.
- Completed-only invoice actions: Task 2 table disabled action + Task 3 action handlers.
- Expired read-only: Task 4 provider/banner/dashboard guards.
- Verification: Task 5 lint/build/test/manual/GitNexus.

Risk handling:

- `QuickActionsBar` and `AlertCard` have HIGH GitNexus impact because they are shared by tenant, manager, and staff dashboards. The plan only adds optional props and keeps default behavior unrestricted.
- Read-only is UX only; Backend remains authoritative and existing API errors still surface.
- Historical invoice nullable data uses explicit fallbacks and never substitutes current subscription data.
