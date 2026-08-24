# WMS-177 - Purchase Order & Inbound Frontend and API Completion Spec

## Document Control

| Item                   | Value                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Scope                  | Complete the frontend epic WMS-177 and the backend contract required for UC-PO-01 through UC-PO-06 and UC-IB-01 through UC-IB-06 |
| Frontend branch        | `feat/wms-177-purchase-order-inbound`                                                                                            |
| Frontend base          | `dev` at `a8d7e76`                                                                                                               |
| Backend branch         | `feat/wms-110-purchase-order-inbound-completion`                                                                                 |
| Backend base           | `dev` at `6bfb42d`                                                                                                               |
| Existing backend merge | `ae9ff21 feat(WMS-110): add Purchase Order & Inbound module - controllers and features (#60)`                                    |
| Frontend epic          | WMS-177 - `[Frontend] Purchase Order & Inbound`                                                                                  |
| Backend epic           | WMS-110 - `[Backend] Purchase Order & Inbound`                                                                                   |
| Related business rules | BR-17, BR-21, BR-22, BR-25, BR-26                                                                                                |
| Status                 | Implementation complete; automated verification passed, visual Browser QA blocked by local Codex runtime                         |
| Last updated           | 2026-08-24                                                                                                                       |

## 1. Objective

Deliver a complete purchase-to-receipt workflow for a tenant:

1. Browse, search, create, edit, submit, approve, and reject purchase orders.
2. Find approved purchase orders that are ready to receive.
3. Record partial or complete goods receipts, including damaged quantity.
4. Submit, approve, or reject a receipt with maker-checker separation.
5. Browse stock waiting for put-away and distribute it into one or more active slots.
6. Keep every lifecycle and inventory change tenant-scoped, warehouse-scoped, auditable, and safe under concurrent requests.

The frontend must be a compact operational workspace rather than a marketing page. Desktop favors tables and side panels for scanning; mobile uses readable list items and full-width task flows.

## 2. Sources of Truth

The implementation must be checked against all sources below, in this order when they disagree:

1. UC registry in `Report3_ProjectTracking`, rows UC-57 through UC-68.
2. BR sheet entries BR-17, BR-21, BR-22, BR-25, and BR-26.
3. Current domain and API behavior in the backend repository.
4. Jira epic WMS-177 and its 12 child tasks.
5. `docs/USE_CASE_TRACKING.md` in the backend repository.

`docs/USE_CASE_TRACKING.md` was last audited on 2026-08-11, before backend PR #60. Its Purchase Order & Inbound section is therefore a historical snapshot, not the current implementation status. Update it only after the completed APIs and tests have been verified.

## 3. Jira Scope

| Jira    | UC       | Deliverable                        |
| ------- | -------- | ---------------------------------- |
| WMS-187 | UC-PO-01 | Browse and Search Purchase Orders  |
| WMS-192 | UC-PO-02 | View Purchase Order Details        |
| WMS-189 | UC-PO-03 | Create Purchase Order              |
| WMS-193 | UC-PO-04 | Edit Draft Purchase Order          |
| WMS-188 | UC-PO-05 | Submit Purchase Order for Approval |
| WMS-191 | UC-PO-06 | Approve or Reject Purchase Order   |
| WMS-190 | UC-IB-01 | View Receiving Tasks               |
| WMS-197 | UC-IB-02 | Receive Goods                      |
| WMS-194 | UC-IB-03 | Submit Goods Receipt for Approval  |
| WMS-198 | UC-IB-04 | Approve or Reject Goods Receipt    |
| WMS-195 | UC-IB-05 | View Pending Put-away Tasks        |
| WMS-199 | UC-IB-06 | Put Away Stock                     |

## 4. Confirmed Product Decisions

1. Purchase order creation and editing use route-backed full pages because line-item editing is too dense for a dialog.
2. Inbound work uses one `/inbound` workspace with route-backed tabs for receiving, receipt approval, and put-away.
3. The backend is the final authority for tenant scope, warehouse assignment, permission, allowed actions, lifecycle transitions, and quantities.
4. The frontend may hide actions by role for usability, but must still handle `403` and `409` responses without losing form data.
5. Rejection requires a reason and returns the document to `Draft` for correction. The immutable audit trail preserves the rejected transition and reason.
6. Partial receiving is supported. Cumulative accepted quantity may never exceed ordered quantity.
7. Damaged quantity is recorded but is not available for put-away.
8. One receipt line may be put away into multiple slots over multiple operations.
9. Hard delete is not exposed for purchase orders, receipts, or inventory movements.
10. Server paging is fixed at 10 rows per page for the first release; page-size selection is out of scope.
11. URL query state stores page, search, and filters for list workspaces so refresh and Back navigation are predictable.
12. No optimistic lifecycle transition is used. The UI waits for the server result and then invalidates related queries.

## 5. Explicit Non-Goals

- Sending a purchase order to an external supplier system.
- Real payment, procurement budgeting, tax, discount, or multi-currency accounting.
- File attachments, supplier quotations, or purchase contracts.
- Offline receiving or native scanner SDK integration.
- Hard deletion of operational records.
- Automatic slot recommendation or warehouse path optimization.
- Batch import of purchase orders or receipts.
- Direct label-printer integration.

## 6. Current Backend Audit

### 6.1 Merge status

Backend `dev` contains PR #60 through commit `ae9ff21`. Controllers, commands, handlers, workflows, contracts, and a small set of unit tests exist. The module is present, but the twelve UCs are not operationally complete.

### 6.2 Existing endpoint inventory

| Endpoint                                        | Current state                                                | Audit result                                                     |
| ----------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `GET /api/purchase-orders`                      | Exists with basic paging/search/status/supplier/date filters | Partial                                                          |
| `GET /api/purchase-orders/{id}`                 | Exists                                                       | Partial response and scope                                       |
| `POST /api/purchase-orders`                     | Exists                                                       | Partial validation; warehouse is discarded                       |
| `PUT /api/purchase-orders/{id}`                 | Exists                                                       | Draft check exists; validation and warehouse handling incomplete |
| `POST /api/purchase-orders/{id}/submit`         | Exists                                                       | Partial                                                          |
| `POST /api/purchase-orders/{id}/approve`        | Exists                                                       | Partial                                                          |
| `POST /api/purchase-orders/{id}/reject`         | Exists                                                       | No reason body; wrong correction lifecycle                       |
| `GET /api/purchase-orders/{id}/allowed-actions` | Exists                                                       | Useful, but only models part of authorization                    |
| `POST /api/inbound-receipts`                    | Exists                                                       | Runtime/blocking contract defects                                |
| `GET /api/inbound-receipts/{id}`                | Exists                                                       | Partial response and scope                                       |
| `POST /api/inbound-receipts/{id}/submit`        | Exists                                                       | Creation currently skips Draft, so flow is unreachable           |
| `POST /api/inbound-receipts/{id}/approve`       | Exists                                                       | Posts stock to an invalid pre-put-away slot                      |
| `POST /api/inbound-receipts/{id}/reject`        | Exists                                                       | No reason body; changes to Cancelled                             |
| `GET /api/inbound-receipts/putaway-tasks`       | Exists                                                       | Unpaged and cannot track remaining quantity correctly            |
| `POST /api/inbound-receipts/{id}/putaway`       | Exists                                                       | No allocation quantity; cannot support multiple slots safely     |
| Receiving-task list                             | Missing                                                      | Required by UC-IB-01                                             |
| Receipt list/approval inbox                     | Missing                                                      | Required to discover pending receipts for UC-IB-04               |

### 6.3 Confirmed blockers

1. `CreatePurchaseOrderCommand` accepts `WarehouseId`, but `PurchaseOrder` has no `WarehouseId` property and the handler does not persist it.
2. PO list ignores `WarehouseId` and creator filtering. Search replaces the other filters instead of combining with them.
3. PO list returns empty supplier/creator/line values because related data is not projected.
4. PO detail omits warehouse, supplier ID, line ID, product name, expected date, approval data, received progress, and history.
5. Create/update handlers do not enforce active tenant-owned supplier, active tenant-owned products, active warehouse, warehouse assignment, duplicate products, or expected date.
6. PO approval sets `Approved`, while receipt creation only accepts `Confirmed`; no endpoint transitions a PO to `Confirmed`. Receiving is therefore unreachable.
7. PO and receipt reject commands cannot accept a reason.
8. Receipt creation sets status directly to `PendingApproval`, making UC-IB-03 Draft-to-submit unreachable.
9. Receipt creation assigns `WarehouseId = Guid.Empty` and each item `SlotId = Guid.Empty`, while both columns have required foreign keys. A relational database can reject the write.
10. Receipt request cannot record damaged quantity or exception reason.
11. Cumulative quantity across earlier receipts is not checked.
12. Receipt approval posts inventory through `StockLevel`, while the Inventory module and warehouse safeguards use `InventoryBalance`. This creates two competing stock sources of truth.
13. Receipt approval tries to post to a slot before put-away. Put-away then only changes the receipt item's slot and does not create the actual relocation/inbound movement.
14. Put-away lines have no quantity, so one receipt line cannot be split across slots and remaining quantity cannot be calculated.
15. Put-away does not validate tenant, warehouse hierarchy, slot lifecycle, slot capacity, damaged quantity, or cumulative put-away quantity.
16. Several handlers rely only on global tenant filters and do not enforce the caller's active warehouse assignment.
17. Existing tests are mostly fake-repository unit tests and do not cover SQL foreign keys, transactions, paging projections, cumulative quantities, or cross-tenant/warehouse access.

Because these blockers affect core state transitions and persistence, WMS-177 must not build its production UI around the current response DTOs.

## 7. Required Backend Completion

All work in this section belongs on `feat/wms-110-purchase-order-inbound-completion` and must follow the backend `.rules` and `AGENTS.md` conventions: CQRS, `ISender`-only controllers, Contract response models, FluentValidation, typed exceptions, primary constructors, and focused tests.

### 7.1 Persistence model

Required schema changes:

- Add `WarehouseId` and `Warehouse` navigation to `PurchaseOrder`.
- Add rejection/correction metadata where it cannot be reconstructed safely from audit data.
- Add `DamagedQuantity`, `ExceptionReason`, and `PutAwayQuantity` to `InboundReceiptItem`.
- Make the pre-put-away receipt item location nullable, or remove `SlotId` from receipt items if all destination allocations are represented by stock movements.
- Add indexes for tenant + warehouse + status + created date on PO and receipt task queries.
- Add a migration and update the model snapshot. Do not use `Guid.Empty` as a foreign-key placeholder.

Migration handling for existing development data:

- Backfill a PO warehouse only when a tenant warehouse can be identified deterministically.
- Keep unmatched legacy rows visible to privileged users as data requiring remediation; do not silently assign them across tenants.
- New writes must always require a valid active warehouse.

### 7.2 Canonical inventory behavior

Use `InventoryBalance` as the canonical quantity source because current inventory queries, reservations, ABC analysis, and warehouse deactivation safeguards already read it. `StockMovement` remains the immutable movement ledger.

- Receipt approval marks usable accepted quantity as pending put-away; it must not post stock to `Guid.Empty` or a destination slot not yet selected.
- Put-away creates an `Inbound` stock movement for each allocation and atomically increments the destination `InventoryBalance`.
- Increment `InboundReceiptItem.PutAwayQuantity` for each accepted allocation.
- Update `Slot.CurrentOccupancy` consistently with the canonical balance strategy.
- Complete the receipt only when every usable quantity has been put away.
- Use a transaction and concurrency handling so duplicate retries cannot double-post stock.
- Every movement references the receipt item or another stable line-level identifier, not only the receipt header.

### 7.3 Purchase order contract

#### List

`GET /api/purchase-orders`

| Query                    | Rule                                                |
| ------------------------ | --------------------------------------------------- |
| `pageNumber`, `pageSize` | Positive; `pageSize` capped server-side             |
| `searchTerm`             | PO number, supplier name, or creator name           |
| `status`                 | Valid PO status or validation error                 |
| `supplierId`             | Tenant-owned supplier                               |
| `warehouseId`            | Tenant-owned and assignment-scoped warehouse        |
| `creatorId`              | Tenant user                                         |
| `dateFrom`, `dateTo`     | Inclusive created-date range; from cannot exceed to |

Return a dedicated paged summary with IDs and populated labels:

```ts
interface PurchaseOrderSummaryResponse {
  id: string
  poNumber: string
  warehouseId: string | null
  warehouseCode: string | null
  warehouseName: string | null
  supplierId: string
  supplierName: string
  status: PurchaseOrderStatus
  createdBy: string
  createdByName: string
  expectedDate: string | null
  createdAt: string
  lineCount: number
  orderedQuantity: number
  receivedQuantity: number
}
```

#### Detail

`GET /api/purchase-orders/{id}` returns:

- Header IDs and labels for warehouse, supplier, creator, and approver.
- Expected date, created/modified/submitted/approved timestamps when available.
- Each line's `id`, product ID, SKU, product name, unit, ordered quantity, unit price, approved received quantity, and remaining quantity.
- Server-computed `allowedActions`.
- Compact immutable lifecycle history including actor, action, reason, old/new state, and timestamp.

#### Create and update

```ts
interface SavePurchaseOrderRequest {
  warehouseId: string
  supplierId: string
  expectedDate: string | null
  lines: Array<{
    productId: string
    quantity: number
    unitPrice: number | null
  }>
}
```

Validation:

- Warehouse, supplier, and products belong to the tenant and are active.
- Manager must have an active assignment to the selected warehouse; Tenant Owner uses tenant-wide scope.
- At least one line; product IDs unique; quantity greater than zero; unit price null or non-negative.
- Only Draft POs are editable.
- Route ID is authoritative for update.

#### Lifecycle commands

- `POST /api/purchase-orders/{id}/submit`: Draft to PendingApproval after revalidating the complete draft.
- `POST /api/purchase-orders/{id}/approve`: PendingApproval to Approved; maker cannot be checker.
- `POST /api/purchase-orders/{id}/reject` with `{ reason }`: PendingApproval to Draft; maker cannot be checker; reason required.
- Receipt creation accepts an Approved PO. `Confirmed` may remain as a legacy status but must not block the UC flow.
- Every transition records BR-26 audit data.

### 7.4 Inbound contract

#### Receiving tasks

`GET /api/inbound-receipts/receiving-tasks`

- Server-paged with search, warehouse, supplier, and expected-date filters.
- Includes only Approved or PartiallyReceived POs with remaining quantity.
- Returns PO header data and line-level ordered, approved-received, pending-received, and remaining quantities.
- Applies tenant and active warehouse-assignment scope.

#### Receipt list and detail

`GET /api/inbound-receipts`

- Server-paged with receipt code/PO number search, warehouse, creator, status, and date filters.
- Supports the manager approval inbox using `status=PendingApproval`.

`GET /api/inbound-receipts/{id}` returns header labels, line IDs, PO-line IDs, SKU/product labels, ordered, received, damaged, usable, put-away, and remaining put-away quantities, allowed actions, and lifecycle history.

#### Create draft and submit

```ts
interface CreateInboundReceiptRequest {
  purchaseOrderId: string
  lines: Array<{
    poLineId: string
    receivedQuantity: number
    damagedQuantity: number
    exceptionReason: string | null
  }>
}
```

- Create as Draft in the PO warehouse.
- Received quantity must be positive and cannot exceed remaining ordered quantity.
- Damaged quantity is between zero and received quantity.
- Exception reason is required when damaged quantity is greater than zero.
- Unknown, duplicate, wrong-PO, wrong-warehouse, inactive-product, and cross-tenant lines are rejected.
- `POST /api/inbound-receipts/{id}/submit` moves Draft to PendingApproval after revalidation.

#### Approve or reject

- `POST /api/inbound-receipts/{id}/approve`: PendingApproval to Approved; manager is assigned to the warehouse; maker cannot be checker; cumulative quantity is rechecked inside the transaction.
- Update PO to `PartiallyReceived` or `Received` from approved receipt totals.
- `POST /api/inbound-receipts/{id}/reject` with `{ reason }`: PendingApproval to Draft for correction; maker cannot be checker; reason required.
- Audit every decision.

#### Put-away tasks and command

`GET /api/inbound-receipts/putaway-tasks`

- Server-paged and warehouse-scoped.
- Includes approved receipts with usable quantity greater than put-away quantity.
- Returns receipt, PO, warehouse, product, and remaining quantities required by the UI.

```ts
interface PutAwayStockRequest {
  lines: Array<{
    inboundReceiptItemId: string
    slotId: string
    quantity: number
  }>
}
```

Validation:

- Quantity is positive and no greater than the item's remaining put-away quantity.
- Slot is active; all ancestor locations and warehouse are active.
- Slot belongs to the receipt warehouse.
- Destination capacity can accept the allocation.
- Repeated item IDs are allowed only when they target distinct allocations and their sum remains valid.
- All balance, occupancy, movement, put-away quantity, receipt status, and audit writes commit atomically.

### 7.5 Permissions

Use consistent permission keys and assign them through the existing admin permission screen:

| Capability                       | Permission                 |
| -------------------------------- | -------------------------- |
| Browse/detail PO                 | `purchase-orders:view`     |
| Create PO                        | `purchase-orders:create`   |
| Edit Draft PO                    | `purchase-orders:edit`     |
| Submit PO                        | `purchase-orders:submit`   |
| Approve PO                       | `purchase-orders:approve`  |
| Reject PO                        | `purchase-orders:reject`   |
| Browse/detail receipts and tasks | `inbound-receipts:view`    |
| Create/edit receipt Draft        | `inbound-receipts:create`  |
| Submit receipt                   | `inbound-receipts:submit`  |
| Approve receipt                  | `inbound-receipts:approve` |
| Reject receipt                   | `inbound-receipts:reject`  |
| Put away stock                   | `inbound-receipts:putaway` |

Remove inconsistent use of `purchase-orders:create-receipt` and `purchase-orders:view-receipt` after role permissions have been migrated or reassigned. System Admin receives scanned permissions automatically; tenant roles are assigned through RBAC.

## 8. Access Matrix

Backend permission and warehouse scope remain authoritative.

| Capability             |          Tenant Owner           |           Warehouse Manager            |     Warehouse Staff      |
| ---------------------- | :-----------------------------: | :------------------------------------: | :----------------------: |
| Browse/view POs        |        Yes, tenant-wide         |        Yes, assigned warehouses        | Yes, assigned warehouses |
| Create/edit/submit PO  | Optional by assigned permission |        Yes, assigned warehouses        |      No by default       |
| Approve/reject PO      |   Yes, maker-checker enforced   | Secondary only if explicitly permitted |            No            |
| View receiving tasks   |     Oversight if permitted      |        Yes, assigned warehouses        | Yes, assigned warehouses |
| Create/submit receipt  |     Optional by permission      |         Optional by permission         | Yes, assigned warehouses |
| Approve/reject receipt |     Oversight if permitted      |      Yes, maker-checker enforced       |            No            |
| View/perform put-away  |     Optional by permission      |        Yes, assigned warehouses        | Yes, assigned warehouses |

## 9. Frontend Information Architecture

### 9.1 Routes

| Route                                     | Purpose                                   |
| ----------------------------------------- | ----------------------------------------- |
| `/purchase-orders`                        | Paged PO directory                        |
| `/purchase-orders/new`                    | Create Draft PO                           |
| `/purchase-orders/[purchaseOrderId]`      | PO detail, progress, history, and actions |
| `/purchase-orders/[purchaseOrderId]/edit` | Edit Draft PO                             |
| `/inbound`                                | Receiving task list, default tab          |
| `/inbound/receipts`                       | Receipt history and approval inbox        |
| `/inbound/receipts/[receiptId]`           | Receipt detail and lifecycle actions      |
| `/inbound/putaway`                        | Pending put-away queue                    |
| `/inbound/putaway/[receiptId]`            | Multi-slot put-away workspace             |

Add `Mua hàng` and `Nhập kho` navigation entries with Lucide icons. Do not place both modules under a vague `Đơn hàng` route.

### 9.2 Feature structure

```text
src/features/purchase-order/
  components/
  hooks/
  pages/
  schemas/
  services/
  types/
  utils/

src/features/inbound/
  components/
  hooks/
  pages/
  schemas/
  services/
  types/
  utils/
```

Page components own React Query hooks, router state, mutation orchestration, and toast decisions. Display components receive typed data and callbacks only. Services remain plain objects using `axiosClient`, unwrap only the HTTP layer, and do not catch errors.

## 10. Frontend API and Cache Design

Extend `API_ENDPOINTS`, `APP_ROUTES`, route permissions, and `queryKeys` without changing unrelated modules.

```ts
purchaseOrders: {
  all,
  lists,
  list(params),
  details,
  detail(id),
  allowedActions(id),
}

inboundReceipts: {
  all,
  lists,
  list(params),
  detail(id),
  receivingTasks(params),
  putawayTasks(params),
}
```

Invalidation rules:

- Save PO: PO lists and PO detail.
- Submit/approve/reject PO: PO detail, allowed actions, PO lists, receiving tasks.
- Save receipt: receipt lists/detail and receiving tasks.
- Submit/approve/reject receipt: receipt lists/detail, PO detail/list, receiving tasks, put-away tasks.
- Put away: receipt detail/list, put-away tasks, inventory queries, warehouse layout/location data, and dashboard summaries.

Use `placeholderData` for server-paged lists. Disable repeated pagination/action clicks while the relevant request is pending.

## 11. UI and Interaction Design

### 11.1 Skill usage

Before implementation and review, apply:

- `shadcn`: compose existing Card, Table, Sheet, Dialog, AlertDialog, Field, Select, Command/Popover where already available, Badge, Tooltip, Skeleton, Empty, and Pagination primitives.
- `vercel-react-best-practices`: parallelize independent queries, keep props serializable, avoid derived-state effects, memoize only expensive stable projections, and prevent request waterfalls.
- `vercel-composition-patterns`: split workspaces into focused sections and avoid large boolean-prop components.
- `web-design-guidelines`: keyboard flow, visible focus, labels, status not conveyed by color alone, icon-button tooltips/aria-labels, responsive text, and no horizontal document overflow.

Follow Fresh Logistics tokens from `src/app/index.css`. Do not add a new palette, gradients, decorative cards, nested cards, or a dependency without approval. Card radius remains 8px or less.

### 11.2 Purchase order directory

- Page header: `Đơn mua hàng`, concise description, and `Tạo đơn mua` for eligible users.
- Toolbar: search input and `Bộ lọc` Sheet; active filters appear as removable compact chips.
- Desktop: fixed-layout table with PO number, supplier, warehouse, status, expected date, received progress, creator, and actions.
- Mobile: list items with PO number, status, supplier/warehouse, date, and received summary; no horizontal table scrolling.
- Loading skeleton, empty search result, no-data onboarding, permission error, generic error/retry, and stale-page loading states are distinct.

### 11.3 PO form

- Sections are unframed page bands: basic information, supplier/warehouse, and editable line table.
- Searchable supplier and product selectors use server search and show only active choices.
- Desktop line editor is a dense table; mobile renders one editable line item at a time.
- Commands: `Lưu nháp`, `Lưu và gửi duyệt`, and `Hủy`.
- Unsaved navigation shows a confirmation dialog. Server validation stays inline and user input is preserved after errors.
- Quantity and price inputs use numeric controls with clear units and no implicit rounding.

### 11.4 PO detail and approval

- One status badge in the header, not repeated across cards.
- Header band shows supplier, warehouse, expected date, creator, and ordered/received summary.
- Line table shows ordered, received, remaining, and unit price.
- Timeline shows immutable lifecycle events.
- Only server-allowed actions render. Submit uses confirmation; approve/reject use accessible dialogs. Reject requires a reason field.
- Mutation errors remain in the dialog; successful actions close it and show a Vietnamese toast.

### 11.5 Inbound workspace

- Top tabs: `Chờ nhận hàng`, `Phiếu nhập`, `Chờ cất hàng`.
- Each tab keeps independent URL search/filter/page state.
- Receiving task items emphasize remaining quantities and expected date.
- Receipt approval inbox emphasizes maker, damage/exception data, and quantity differences.
- Put-away queue emphasizes remaining usable quantity and warehouse.

### 11.6 Receive goods

- Open from one PO receiving task; PO lines are the fixed source of truth.
- Staff enters actual received and damaged quantities. A damaged quantity reveals a required reason field.
- SKU/barcode search only resolves products belonging to the selected PO; unknown codes show an inline message without adding a line.
- Keep a visible ordered/previously received/remaining comparison beside each entry.
- Allow `Lưu nháp` and `Gửi duyệt` as separate commands.

### 11.7 Put-away workspace

- Header shows receipt, PO, warehouse, and total remaining quantity.
- Each product line can add multiple destination allocations.
- Slot selector is filtered to active slots in the receipt warehouse and displays code, hierarchy, available capacity, and occupancy status.
- Show assigned total versus remaining total continuously.
- Submit remains disabled until every entered allocation is positive and within current limits.
- A server conflict refreshes capacity data while preserving the user's allocations for correction.

### 11.8 Responsive behavior

- Desktop at 1280px: two-pane detail/task views are allowed when both panes remain readable.
- Tablet: filters move to Sheet and detail metadata wraps into two columns.
- Mobile at 390px: one column, full-width primary actions, sticky bottom action bar only when it does not obscure content, and list items replace tables.
- Dialogs that contain long forms become responsive Sheets/Drawers using existing primitives.
- No text overlap, clipped status badge, nested scroll trap, or document-level horizontal overflow.

## 12. Form Validation Matrix

Zod schemas must mirror backend FluentValidation messages and limits.

| Form                | Client validation                                                              |
| ------------------- | ------------------------------------------------------------------------------ |
| PO filter           | Valid dates; valid status; page reset after filter change                      |
| PO header           | Warehouse and supplier required; expected date valid                           |
| PO line             | Product required/unique; quantity > 0; unit price null or >= 0                 |
| PO rejection        | Trimmed reason required with shared max length                                 |
| Receipt line        | Received > 0; damaged between 0 and received; reason required for damage       |
| Receipt rejection   | Trimmed reason required with shared max length                                 |
| Put-away allocation | Receipt item, slot, and quantity required; quantity > 0; sums within remaining |

Client checks improve feedback but never replace server validation for state, scope, cumulative quantity, capacity, or concurrency.

## 13. Error and State Model

| HTTP/result                       | UI behavior                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------- |
| `400` validation                  | Map field errors; keep form and focus first invalid field                              |
| `401`                             | Existing auth refresh/logout behavior                                                  |
| `403`                             | Inline permission state or action-specific message; do not claim the record is missing |
| `404`                             | Route-level not-found state with back action                                           |
| `409` lifecycle/quantity/capacity | Keep dialog/form open, show backend message, offer refresh where relevant              |
| `412`/concurrency if introduced   | Refresh latest data and require explicit retry                                         |
| Network/`500`                     | Error state with retry; log through `logger`                                           |
| Empty data                        | Purpose-specific Empty state, not an error illustration                                |

All visible application copy is Vietnamese. API error strings may be normalized through a small feature-owned mapping when backend messages are technical.

## 14. Testing Strategy

### 14.1 Backend unit and relational tests

- PO create/update active supplier, product, warehouse, assignment, duplicate line, and Draft-only rules.
- Combined PO filters, stable ordering, paging, and populated projection.
- Tenant and warehouse assignment isolation for every query/command.
- Submit/approve/reject transitions, required reason, idempotency policy, and maker-checker.
- Receipt Draft creation, damage validation, cumulative quantity, and concurrent approval recheck.
- Receiving-task, receipt-list, and put-away-task paging/projections.
- Put-away split allocation, wrong warehouse, inactive slot/ancestor, insufficient capacity, duplicate retry, and partial completion.
- Transaction rollback proves no partial balance/movement/occupancy/status write.
- Audit assertions for every lifecycle and inventory event.
- SQL Server or SQLite relational regression tests cover required foreign keys and query translation; do not rely only on fake repositories.

### 14.2 Frontend utility/schema tests

- Query serialization and page reset behavior.
- Status label/tone mapping.
- Ordered/received/damaged/usable/remaining calculations.
- PO, receipt, rejection, and allocation Zod boundary cases.
- Server field-error mapping.

### 14.3 Frontend component/page tests

- Loading, error, empty, populated, stale-page loading, and permission states.
- Desktop table and mobile item rendering.
- Filter Sheet accessibility and query updates.
- PO add/remove line, duplicate prevention, dirty-navigation confirmation, save Draft, and submit.
- Allowed action visibility and approve/reject callback payloads.
- Receipt actual/damaged validation and Draft/submit actions.
- Approval inbox maker-checker and error states.
- Multi-slot allocation totals and capacity conflicts.
- Mutation invalidation uses the correct query-key families.

### 14.4 Verification commands

Backend:

```powershell
dotnet test Application.Tests/Application.Tests.csproj
dotnet test
dotnet build --configuration Release
dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API
git diff --check
```

Frontend:

```powershell
pnpm test
pnpm lint
pnpm build
pnpm exec prettier --check .
git diff --check
```

### 14.5 Browser QA

Use the Browser skill after both local servers are healthy. Test Tenant Owner, Warehouse Manager, and Warehouse Staff with separate users so maker-checker is real.

Scenarios:

1. Create Draft PO, edit lines, refresh detail, and submit.
2. Verify the maker cannot approve; a different authorized user approves.
3. Create two partial receipts and confirm cumulative quantity never exceeds ordered.
4. Record damaged goods and verify only usable quantity reaches put-away.
5. Reject and correct both a PO and a receipt.
6. Split one receipt line across two slots, then finish it in a later operation.
7. Trigger inactive slot, wrong warehouse, capacity, stale state, `403`, and network retry paths.
8. Verify lists at 0, 1, 10, 11, and 100+ records.
9. QA desktop 1280px and mobile 390px in light and dark mode.
10. Confirm no horizontal overflow, text overlap, duplicate status badge, inaccessible icon button, or focus trap.

If Browser runtime is unavailable, record the blocker and do not claim visual QA is complete.

## 15. Implementation Order

### Phase 1 - Backend contract repair

1. Persistence migration and canonical inventory decision.
2. PO list/detail/create/update validation and warehouse scope.
3. PO workflow, rejection reason, history, and tests.
4. Receiving-task/list/detail contracts.
5. Receipt Draft/submit/approval/rejection and cumulative rules.
6. Put-away allocation, inventory transaction, movement audit, and tests.
7. Permission cleanup, OpenAPI smoke, migration/model check, and tracking-doc update.

Do not start production FE forms against unstable DTOs. FE shell, routes, and static composition may proceed, but service/types should follow an agreed backend contract.

### Phase 2 - Frontend foundation

1. Routes, navigation, route-role map, API endpoints, query keys, status dictionaries.
2. Purchase-order and inbound types, services, hooks, and Zod schemas.
3. Shared operational patterns: responsive list/table, status badge, filter Sheet, lifecycle timeline, confirmation/rejection dialog.

### Phase 3 - Purchase order UCs

1. WMS-187 directory.
2. WMS-192 detail.
3. WMS-189 create.
4. WMS-193 edit Draft.
5. WMS-188 submit.
6. WMS-191 approve/reject.

### Phase 4 - Inbound UCs

1. WMS-190 receiving tasks.
2. WMS-197 receive goods.
3. WMS-194 submit receipt.
4. WMS-198 approve/reject receipt.
5. WMS-195 put-away queue.
6. WMS-199 put-away workspace.

### Phase 5 - Hardening and delivery

1. Full automated verification.
2. Browser QA and accessibility review.
3. Update this progress tracker and backend `docs/USE_CASE_TRACKING.md` from verified evidence.
4. Commit backend and frontend separately with focused messages.

## 16. Definition of Done

- All twelve UC flows can be completed with real backend data.
- No handler stores `Guid.Empty` in required foreign keys.
- PO and receipt data are tenant- and warehouse-assignment-scoped.
- Maker-checker is enforced server-side for staff and managers; Tenant Owner may self-approve to
  avoid deadlocking a single-owner tenant.
- Active supplier/product and Draft-only edit rules match BR-21.
- Receiving and cumulative quantity rules match BR-22.
- Inventory never becomes negative or exceeds receiving/slot limits; every put-away writes a movement per BR-17.
- Lifecycle and inventory changes create immutable audit entries per BR-26.
- All pages have loading, empty, error, permission, and success states.
- Desktop and mobile layouts pass visual and keyboard QA.
- BE tests/build/migration check and FE tests/lint/build/format all pass.
- `docs/USE_CASE_TRACKING.md` reflects verified reality rather than folder presence.

## 17. Progress Tracker

### Discovery and planning

- [x] Read FE and BE `.rules` and `AGENTS.md` guidance.
- [x] Read UC registry and related BR entries.
- [x] Inspect Jira WMS-177 and its 12 child tasks.
- [x] Confirm backend PR #60 is present in `dev`.
- [x] Audit current controllers, handlers, validators, workflows, contracts, entities, and tests.
- [x] Compare current code with backend `docs/USE_CASE_TRACKING.md`.
- [x] Create FE branch `feat/wms-177-purchase-order-inbound` from `dev`.
- [x] Create BE branch `feat/wms-110-purchase-order-inbound-completion` from `dev`.
- [x] Write implementation specification.

### Backend completion

- [x] Approve final DTO and lifecycle contract.
- [x] Add migration and persistence changes.
- [x] Complete PO APIs and validation.
- [x] Complete receiving and receipt APIs.
- [x] Complete safe multi-slot put-away.
- [x] Complete authorization, assignment scope, audit, and concurrency.
- [x] Add relational and workflow tests.
- [x] Pass backend verification.

### Frontend implementation

- [x] Build feature foundations and routes.
- [x] Complete WMS-187, WMS-192, WMS-189, WMS-193, WMS-188, and WMS-191.
- [x] Complete WMS-190, WMS-197, WMS-194, WMS-198, WMS-195, and WMS-199.
- [x] Complete responsive, accessibility, error, and permission states.
- [x] Pass frontend verification.

### QA and delivery

- [x] Complete authenticated API smoke tests.
- [ ] Complete desktop/mobile light/dark browser QA.
- [x] Update backend use-case tracking from verified results.
- [ ] Commit and push BE and FE branches separately.

## 18. Work Log

### 2026-08-24 - Discovery and contract audit

- Synced both repositories to their current `dev` state before branch creation.
- Confirmed WMS-110 backend work is present in `dev` through PR #60 / commit `ae9ff21`.
- Found that the backend tracking document predates PR #60 and understates file coverage.
- Found that current code overstates operational coverage because several workflows are unreachable or violate relational and inventory constraints.
- Identified backend completion as a prerequisite for reliable WMS-177 integration.
- Created the frontend and backend feature branches listed in Document Control.
- Added this specification only. No application feature code was changed.

### 2026-08-24 - Backend completion

- Added the relational model and migration required for warehouse-scoped purchase orders, cumulative receiving, damaged quantities, pending put-away quantities, and concurrency tokens.
- Completed server-paged purchase-order, receiving-task, receipt, and put-away projections with tenant and warehouse scope.
- Completed Draft, submit, maker-checker approve/reject, partial receiving, and transactional multi-slot put-away workflows.
- Standardized inbound authorization on `inbound-receipts:*` permissions and updated `docs/USE_CASE_TRACKING.md` to 12/12 implemented UCs.
- Added workflow and SQLite relational regression coverage. All 50 backend tests passed; Debug build and EF pending-model check passed. Release build passed with three unrelated pre-existing warnings.

### 2026-08-24 - Frontend implementation and verification

- Added the Purchase Order and Inbound routes, role guards, navigation, API clients, React Query hooks, Zod schemas, operational states, pagination, lifecycle timeline, and responsive desktop/mobile compositions.
- Completed the six purchase-order screens and lifecycle actions plus receiving tasks, goods receipt, receipt approval, put-away queue, and multi-slot allocation workspace.
- Restored Staff invitation files omitted by an earlier `dev` merge because their broken imports prevented the repository baseline from compiling; updated the associated stale tests to the backend contract already present in `dev`.
- All 204 frontend tests passed and the production build generated every WMS-177 route successfully.
- Authenticated Tenant Owner smoke tests returned `200` for warehouses, purchase orders, receiving tasks, receipt history, put-away tasks, active products, and active suppliers after the new permissions were assigned and the stale Redis permission cache was cleared.
- Codex Browser could not start because its local runtime failed with `failed to write kernel assets: The system cannot find the path specified. (os error 3)`. Desktop/mobile and light/dark screenshot QA therefore remains explicitly incomplete.

### 2026-08-24 - Seed data and end-to-end workflow QA

- Seeded the shared development tenant with an active QA supplier, product, unit, category, Warehouse Staff assignment, and a second storage slot in warehouse `NHS-01`. Product and unit/category prerequisites were inserted directly because those modules are owned by a separate frontend workstream.
- Fixed role-assignment reads that truncated role permissions at 100 rows, invalidated permission caches across tenant query filters, and batched permission assignment validation. The Tenant Owner role now round-trips all 74 assigned permissions, and backend RBAC regression coverage was added.
- Replaced RFC-only UUID validation in Purchase Order and Inbound forms with the shared .NET GUID schema. SQL Server GUID values whose variant bits are not RFC 4122 now remain valid after selecting a warehouse, supplier, product, PO line, receipt item, or slot.
- Fixed SQL Server receipt/PO history materialization by moving rejection-reason enrichment after the relational audit projection. The detail endpoint now returns lifecycle history without generating an all-NULL SQL `CASE` expression.
- Completed an authenticated maker-checker smoke flow with Warehouse Manager as PO maker, Tenant Owner as PO approver, Warehouse Staff as receipt maker/put-away operator, and Warehouse Manager as receipt approver. Self-approval returned `403`; reject, correction, resubmission, and approval histories were preserved.
- Verified partial receiving (`4` received, `1` damaged, `3` put away), final receiving (`2` received and put away), PO transition `Approved -> PartiallyReceived -> Received`, and both receipts reaching `Completed`.
- Verified the completed PO disappears from receiving tasks, completed receipts disappear from put-away tasks, and inventory contains `5` usable units across the two target slots (`1 + 4`) with three inbound stock movements.
- Retained the successful QA records for manual UI inspection and removed the earlier incomplete PO created while diagnosing the maker-checker role path.
- Corrected the desktop PO directory column sizing so long PO identifiers cannot overlap supplier content. The PO cell now has a stable width, truncation fallback, full-value tooltip, and matching mobile overflow protection, backed by a component regression test.
- Final verification passed: backend `53/53` tests, Release build with zero errors, and no pending EF model changes; frontend `205/205` tests, lint, production build, focused Prettier checks, and `git diff --check` passed. One unrelated Warehouse Designer timing test required a local 10-second timeout to remain stable under the full parallel suite.
- Browser QA was retried and remains blocked by the same Codex Browser `os error 3`; automated tests, authenticated API smoke tests, and production builds are the available verification evidence.

### 2026-08-24 - Review remediation

- Added Draft receipt editing, retry-safe create-and-submit behavior, permission-aware lifecycle
  actions, complete legacy PO status rendering, and debounced server-search lookup controls.
- Allowed Tenant Owner self-approval while retaining maker-checker for non-owner actors; synchronized
  command handlers and domain workflow definitions and added regression coverage.
- Persisted rejection reasons per audit event and added a follow-up migration that backfills legacy
  warehouse, receipt-line, received/put-away quantity, and latest rejection-event data.
- Hardened put-away against duplicate allocations and aggregate slot-capacity overflow; canonical
  inventory balance updates are grouped by product and slot.
- Authenticated smoke created, edited, submitted, and owner-approved a new PO and receipt. Repeated
  rejection history preserved both distinct reasons, and server-side warehouse/supplier/product
  searches returned the expected QA records.
- Final automated verification passed: backend `59/59` tests, Release build, migration SQL check,
  and EF pending-model check; frontend `207/207` tests, lint, production build, Prettier, and
  `git diff --check`.
- Removed request-object serialization from backend slow-request warnings after authenticated QA
  revealed that login passwords were being written to development logs; regression coverage now
  verifies that request secrets are absent.
- The Browser `os error 3` workaround is present in Codex configuration. This active task's browser
  transport had already terminated and requires a fresh task/app reload before desktop/mobile visual
  QA can be completed; the QA checkbox therefore remains open.

## 19. Open Risks and Review Gates

1. **Inventory source of truth:** backend review must approve `InventoryBalance` as canonical before implementing receipt approval/put-away.
2. **Legacy PO warehouse migration:** deployment data must be audited before making `WarehouseId` required.
3. **Role versus permission visibility:** current auth profile exposes role but not permission keys; backend remains authoritative and FE must handle `403` gracefully.
4. **Concurrent receiving:** cumulative quantities must be checked in the approving transaction, not only during Draft creation.
5. **Concurrent put-away:** destination capacity and remaining receipt quantity must be rechecked atomically.
6. **API contract freeze:** FE service/type implementation begins after the backend response models in Sections 7.3 and 7.4 are approved.
7. **Product prerequisite API:** the current Product create handler attempts to insert no-tracking Unit and Category navigation entities and can fail with duplicate primary keys. WMS-177 was verified with an active product seeded directly; the Product Catalog owner should correct that handler in its own workstream.
8. **Inventory display enrichment:** inventory balances and movement quantities are correct, but the current inventory list projection returns blank product, warehouse, slot, and actor display fields. This does not affect WMS-177 state transitions or stock ledger quantities, but the Inventory Control workstream should repair its read model.
