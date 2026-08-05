# WMS-52 Subscription Billing Completion Specification

**Status:** Approved design, awaiting implementation plan

**Branch:** `feat/wms-52-subscription-billing-completion` from `origin/dev`

**Goal:** Complete the TenantOwner subscription and billing experience by adding safe upgrade guidance, payment-history filters, client-side invoice export, and a clear read-only experience for expired tenants.

## Scope

### Included

- Prevent a TenantOwner from initiating a downgrade in the plan-selection UX.
- Filter payment history by plan, payment status, and inclusive creation-date range.
- Generate a downloadable PDF invoice and a printable invoice view in the browser from invoice JSON supplied by Backend.
- Disable invoice actions for payments that are not completed.
- Surface an expired-subscription read-only state throughout tenant write workflows while preserving account and billing access.
- Retain the current subscription page structure, responsiveness, shadcn/ui primitives, and design tokens.

### Excluded

- Changing Backend payment or subscription business rules.
- Legal e-invoice fields, tax calculations, digital signatures, or payment-gateway integration.
- Editing the existing Backend QuestPDF invoice endpoint. The Frontend will use invoice JSON instead.
- Replacing the existing subscription page or private shell.

## Backend Contract

The Frontend integrates with commit `71f441d` on Backend branch `feat/wms-02-payment-history-invoice-data`. No additional Backend change is required for this scope.

### Payment history

`GET /api/payments` accepts the existing paging and search parameters plus:

| Parameter  | Type                                | Frontend behavior                                                    |
| ---------- | ----------------------------------- | -------------------------------------------------------------------- |
| `status`   | `Completed`, `Pending`, or `Failed` | Omit when the user selects all statuses.                             |
| `planId`   | GUID                                | Omit when all plans are selected.                                    |
| `dateFrom` | ISO 8601 `DateTimeOffset`           | Use the selected date at local start of day.                         |
| `dateTo`   | ISO 8601 `DateTimeOffset`           | Use the selected date at local end of day so that date is inclusive. |

The response item includes `planId` and `planName` as payment-time snapshots. Legacy rows can have either value as `null`; they remain visible in the unfiltered result and display a clear fallback label.

### Invoice data

`GET /api/payments/{paymentId}/invoice-data` returns:

```ts
interface InvoiceDataResponse {
  paymentId: string
  subscriptionId: string
  planId: string | null
  planName: string | null
  invoiceNumber: string
  amount: number
  status: string
  paidAt: string | null
  createdAt: string
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
}
```

The Frontend must use these snapshots instead of current subscription or plan data. A later plan change must never alter a historical invoice.

## Experience Design

### Plan selection and upgrade

- The current plan remains disabled and labeled `Đang sử dụng`.
- A plan is a downgrade when its price is lower than the current plan price. Its action is disabled and explains `Không hỗ trợ hạ gói` with an accessible tooltip.
- A plan with the same price but different limits is available unless it is the current plan. The API remains authoritative for final validation.
- The existing upgrade confirmation dialog is used only for eligible plans.

### Payment history filters

- Keep the current invoice-number search and pagination.
- Add a compact filter row using existing shadcn `Select`, `Popover`, `Calendar`, `Button`, and `Tooltip` primitives:
  - Plan select: `Tất cả gói` plus plans returned by the authenticated plan query.
  - Status select: `Tất cả trạng thái`, `Đã thanh toán`, `Đang xử lý`, `Thất bại`.
  - Date range: an optional start and end date, with a reset action.
- Search is applied on submit. Select and date filters apply explicitly through the same filter action, not on every keystroke.
- Any applied filter or search resets pagination to the first page. The query key includes every applied filter so cached pages do not leak between filter states.
- Validate the date range before querying. If end date precedes start date, keep the current results, mark the control invalid, and show a Vietnamese inline message.
- The table adds a `Gói dịch vụ` column using `planName`; a missing historical snapshot displays `Không xác định`.
- Loading, error, empty, disabled, and paginated states remain visible and accessible at mobile and desktop widths.

### Invoice PDF and print

- Add `@react-pdf/renderer` through `pnpm` to generate a client-side PDF. Do not add a second PDF library.
- Add a feature-local invoice document component that consumes only `InvoiceDataResponse` plus the authenticated user’s display name/email when available.
- PDF filename: `<invoiceNumber>.pdf`, falling back to `invoice.pdf` if the number is empty.
- Add two action buttons per completed payment:
  - Download PDF: creates the PDF in the browser and downloads it.
  - Print: opens a route or print-only window with the same invoice content, waits for render, then calls `window.print()`.
- A print stylesheet sets A4 dimensions, hides application navigation and action controls, and preserves high-contrast text in print output.
- Both actions are disabled when the payment status is not `Completed`. The tooltip communicates that an invoice is available only after payment completion.
- Both actions are disabled while that payment’s invoice data or PDF is being prepared; the pending label identifies the active action.
- Legacy invoice rows with missing snapshot values remain exportable if completed. Missing values render `Không có dữ liệu lịch sử`, never data from the current plan.
- The export is a billing receipt based on available data. It must not claim tax, legal e-invoice, company address, or other information that Backend does not provide.

### Expired read-only UX

- Derive `isReadOnly` from `GET /subscriptions/me`: a tenant is read-only only when the logged-in user is a `TenantOwner` and `subscription.isExpired` is true.
- Provide this state at the private tenant shell through a dedicated feature-level context or hook. The state is server data and continues to be owned by React Query; it is not copied into Zustand.
- Show a persistent but compact destructive banner in the private area: the tenant is read-only until renewal succeeds, with a link to `/subscription`.
- Disable tenant data-writing actions: create, edit, delete, import, confirm, submit, and bulk mutation controls. Controls show an explanation via tooltip or nearby helper text.
- Permit viewing/searching/exporting operational data, profile and security changes, and all subscription/billing actions including renew, eligible upgrade, payment filters, PDF download, and print.
- Backend remains the final authorization boundary. A failed write request must still show the existing API error toast if the UI state is stale.
- Apply the UI guard to each current tenant-scoped write surface discovered during implementation. Do not block SystemAdmin platform administration or public/auth routes.

## Frontend Boundaries

| Area                                   | Responsibility                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/features/subscription/types`      | API DTOs and typed applied payment query.                                                         |
| `src/features/subscription/services`   | Axios requests for history filters and invoice JSON.                                              |
| `src/features/subscription/hooks`      | React Query query/mutation wrappers and query invalidation.                                       |
| `src/features/subscription/pages`      | Coordinates filter state, dialogs, export actions, and navigation.                                |
| `src/features/subscription/components` | Presentational filter bar, history table, invoice document, print view, and plan-card states.     |
| Private-area access module             | Shares expired read-only state and banner without storing server data in Zustand.                 |
| Existing write components              | Receive an explicit disabled/read-only signal; no direct subscription API call in each component. |

Next.js route `page.tsx` files remain thin wrappers. API calls stay in the subscription service, server state stays in React Query, and visual components receive data and callbacks through props.

## Error Handling

- Follow the existing `console.error(error)` plus Sonner `toast.error(...)` pattern for failed queries, invoice data requests, PDF generation, and print-window failures.
- A failed invoice request does not open a blank print view or download a partial file.
- A failed filtered query preserves the filters so the user can retry with the same criteria.
- If no subscription is returned, the read-only guard is inactive and the existing subscription empty state remains responsible for guidance.

## Accessibility and Visual Constraints

- Use semantic shadcn controls, visible labels or `aria-label`s, keyboard-operable calendar/select controls, and tooltips that supplement rather than replace labels.
- Use only semantic Tailwind design tokens from `src/app/index.css`; no hard-coded feature colors.
- Keep controls responsive: filters stack at narrow widths, tables remain horizontally scrollable with a stable minimum width, and action labels do not overflow.
- Reuse the existing product-oriented card/table visual language. Do not introduce marketing cards, decorative gradients, or nested cards.

## Acceptance Criteria

- [ ] A TenantOwner cannot select or submit an upgrade to a lower-price plan from the UI.
- [ ] Payment history sends `planId`, `status`, `dateFrom`, and `dateTo` only when selected, together with current paging/search fields.
- [ ] Changing applied search/filter values returns to page one and refreshes results for the new query key.
- [ ] A completed payment can download a client-generated PDF and open a printable invoice view based on invoice JSON snapshots.
- [ ] Pending and failed payments cannot download or print an invoice.
- [ ] Historical invoices do not show a plan changed after payment; absent legacy fields render an explicit fallback.
- [ ] An expired TenantOwner sees a private-area read-only banner, has tenant write controls disabled, and can still renew/manage billing and account security.
- [ ] SystemAdmin and non-TenantOwner experiences are not unintentionally restricted.
- [ ] The changed Frontend code passes `pnpm lint` and `pnpm build` before commit.

## Tracking

- [ ] Add typed payment-filter and invoice-data contracts.
- [ ] Integrate payment history query parameters and responsive filter controls.
- [ ] Add downgrade eligibility utility and disabled plan presentation.
- [ ] Add client PDF document, download action, and print view.
- [ ] Add expired read-only provider/banner and apply it to tenant write actions.
- [ ] Perform responsive/manual acceptance checks, `pnpm lint`, `pnpm build`, GitNexus change analysis, and selective commit.

## Implementation Risks

- Payment snapshots are nullable for legacy records. The UI must never substitute current-plan data.
- The expired read-only guard improves UX but cannot be treated as security enforcement.
- PDF rendering is client-only. Keep PDF document components outside server rendering paths and handle loading state before opening print/download actions.
- The authenticated plan list may not include a retired historical plan. Such payments remain searchable and visible; only the `All plans` filter is guaranteed to include legacy/retired-plan rows.
