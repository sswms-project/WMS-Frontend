# Platform Services x Warehouse Modules Integration Specification

> Status: Ready for implementation
>
> Updated: 2026-09-04
>
> Frontend baseline: `origin/dev` at `fc95bb9`
>
> Backend baseline: `origin/dev` at `7440f6b`
>
> Target branches (create from `dev` when implementation starts):
>
> - FE: `feat/platform-services-business-integration`
> - BE: `feat/platform-services-business-integration`

## 1. Goal

Integrate the existing Platform Services notification and audit capabilities into the real warehouse write workflows without changing their business rules.

The integration is complete when:

- important warehouse state changes are recorded in the existing `AuditLogs` table;
- actionable events create persisted notifications for the correct active users;
- persisted notifications are delivered through the existing SignalR channel after the transaction commits;
- notification links resolve to routes that actually exist in the frontend;
- tenant isolation, warehouse assignment, effective permissions, and maker-checker constraints remain intact;
- retries of guarded state transitions do not produce duplicate audit or notification records;
- low-stock notifications are generated from stock-changing operations, not from GET endpoints;
- existing business, API, and UI behavior remains unchanged when realtime delivery is unavailable.

This document replaces the earlier generic assumptions with the classes, handlers, states, permissions, notification types, and routes currently present in the repositories.

## 2. Confirmed Current Architecture

### 2.1 Backend platform services already available

| Capability                | Current implementation                                                                 | Decision                                                       |
| ------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Audit persistence         | `IAuditLog.RecordStateChangeAsync` implemented by `WorkflowAuditLogger`                | Reuse; do not create another audit subsystem                   |
| Notification persistence  | `Domain.Notification` through `IUnitOfWork.Repository<Notification>()`                 | Reuse                                                          |
| Realtime delivery         | `INotificationRealtimePublisher` implemented by `SignalRNotificationRealtimePublisher` | Reuse                                                          |
| Notification query        | `GetNotificationsQueryHandler`, scoped by current `TenantId` and `UserId`              | Reuse                                                          |
| Audit query               | `GetAuditLogsQueryHandler`, currently tenant-scoped                                    | Extend with warehouse scope in Phase 1                         |
| Tenant context            | `IUserContext`                                                                         | Reuse                                                          |
| Warehouse authorization   | `IWarehouseAccessPolicy` and `IWarehouseAssignmentReader`                              | Reuse                                                          |
| Effective permissions     | `IPermissionService`, `TenantPermissionPolicy`, role and tenant-role permissions       | Recipient resolution must follow the same rules                |
| Transaction boundary      | Handler mutates entities, stages audit/notification, then saves once                   | Preserve                                                       |
| Realtime failure behavior | Publisher catches SignalR failures and logs a warning                                  | Preserve; persisted data and business result remain successful |

There is no general domain-event or outbox pipeline in the current backend. Do not introduce a large event-driven rewrite for this integration.

The approved pattern is the one already used by Delivery, Subscription, and Platform Administration:

```text
Validate permission / tenant / warehouse / state
    -> mutate business entities
    -> stage audit record
    -> stage persisted notifications
    -> save or commit once
    -> publish SignalR events after successful save/commit
```

If SignalR publishing fails, `SignalRNotificationRealtimePublisher` logs the failure and does not fail the completed command. The persisted notification remains available through the notification API and is fetched on reconnect.

Audit and persisted notification records are part of the business transaction. Do not catch database persistence failures and pretend the command succeeded.

### 2.2 Existing data contracts

`Notification` currently contains:

```text
Id, TenantId, UserId, Type, Title, Message,
IsRead, ReferenceType, ReferenceId, CreatedAt
```

`AuditLog` currently contains:

```text
Id, TenantId, UserId, Action, EntityType, EntityId,
Description, OldValue, NewValue, Reason, CreatedAt, ExpireAt
```

`NotificationType` currently contains:

```text
LowStock
TaskAssigned
DeliveryUpdate
POUpdate
TenantStatusUpdate
SubscriptionPlanUpdate
SubscriptionPaymentUpdate
```

Notification types are stored as strings with a maximum length of 50. Adding enum values does not itself require a schema migration.

### 2.3 Frontend platform services already available

- `/notifications` provides filters, paging, unread state, and mark-as-read actions.
- `/audit-logs` provides tenant audit search and detail display.
- `NotificationRealtimeProvider` validates SignalR events, invalidates notification queries, and shows a generic toast.
- `getNotificationReferenceRoute` currently supports only `PurchaseOrder`, `Tenant`, `SubscriptionPlan`, and `Payment`.
- Realtime payload intentionally contains only `notificationId`, `type`, and `createdAt`; the UI refetches persisted data.

Do not redesign the Notification Center, Audit Log, header bell, or SignalR payload for this work.

## 3. Corrections to the Original Draft

The following generic assumptions must not be implemented:

- Do not create uppercase audit actions such as `PURCHASE_ORDER_APPROVED`. Existing actions use `Create`, `Update`, `Submit`, `Approve`, `Reject`, `Dispatch`, `Receive`, `Finalize`, and similar trigger strings.
- Do not add a Stock Adjustment `Submit` workflow. `CreateStockAdjustmentCommandHandler` creates a `Pending` adjustment that is directly approved or rejected.
- Do not add a Customer Return `Submit` workflow. `RecordReturnCommandHandler` creates a `Requested` return that is directly approved or rejected.
- Do not add a Transfer `Submit` workflow. `CreateTransferCommandHandler` creates `PendingSourceApproval` directly.
- Do not add separate outbound pick events. The current stock-changing command is `IssueStockCommandHandler`.
- Do not create forecasting notifications or audit entries from forecast GET requests. Forecasting and scheduled replenishment are currently calculated queries with no persisted suggestion/review command.
- Do not assume tenant-level or warehouse-level alert-rule entities exist. The current threshold is `Product.MinStockThreshold`; `LowStockAlert` exists but has no evaluator.
- Do not create links to nonexistent transfer, outbound-order, return, or delivery detail pages.
- Do not add notification/audit behavior to read, search, dashboard, report, barcode download, or forecast query handlers.
- Do not modify the completed Subscription/PayOS integration in this branch.

## 4. Integration Scope and Current Coverage

Legend:

- `Existing`: already implemented and only needs regression coverage.
- `Add`: required in this integration.
- `None`: intentionally no user notification.
- `Deferred`: not part of the first production slice.

### 4.1 P0 approval and cross-warehouse workflows

| Workflow handler                         | Current audit                             | Required audit                                  | Required notification                                                     |
| ---------------------------------------- | ----------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------- |
| `SubmitPurchaseOrderCommandHandler`      | Existing: `Submit`                        | Keep                                            | Add: eligible approvers for the PO warehouse, excluding maker             |
| `ApprovePurchaseOrderCommandHandler`     | Existing: `Approve`                       | Keep                                            | Add: PO `CreatedBy` when different from actor                             |
| `RejectPurchaseOrderCommandHandler`      | Existing: `Reject` + reason               | Keep                                            | Add: PO `CreatedBy` when different from actor                             |
| `SubmitInboundReceiptCommandHandler`     | Existing: `Submit`                        | Keep                                            | Add: eligible receipt approvers in the receipt warehouse, excluding maker |
| `ApproveInboundReceiptCommandHandler`    | Existing: receipt `Approve`, PO `Receive` | Keep                                            | Add: receipt `CreatedBy`; no broad put-away broadcast                     |
| `RejectInboundReceiptCommandHandler`     | Existing: `Reject` + reason               | Keep                                            | Add: receipt `CreatedBy`                                                  |
| `CreateStockAdjustmentCommandHandler`    | Existing: `Create` -> `Pending`           | Keep                                            | Add: eligible adjustment approvers in the warehouse, excluding maker      |
| `ApproveStockAdjustmentCommandHandler`   | Existing: `Approve`                       | Keep                                            | Add: adjustment `CreatedBy`                                               |
| `RejectStockAdjustmentCommandHandler`    | Existing: `Reject` + reason               | Keep                                            | Add: adjustment `CreatedBy`                                               |
| `CreateTransferCommandHandler`           | Missing                                   | Add: `Create`, empty -> `PendingSourceApproval` | Add: users allowed to approve in source warehouse, excluding maker        |
| `ApproveTransferCommandHandler`          | Existing: `Approve`                       | Keep                                            | Add: transfer `CreatedBy`                                                 |
| `RejectTransferCommandHandler`           | Existing: `Reject` + reason               | Keep                                            | Add: transfer `CreatedBy`                                                 |
| `DispatchTransferCommandHandler`         | Existing: `Dispatch`                      | Keep                                            | Add: users allowed to receive in destination warehouse                    |
| `ReceiveTransferCommandHandler`          | Existing: `Receive`, variance reason      | Keep                                            | Add: creator and source-side approver when different from actor           |
| Low-stock evaluation after stock changes | Missing                                   | Add alert open/resolved audit                   | Add once per newly opened actionable alert                                |

### 4.2 P1 operational workflows

| Workflow handler                         | Current audit                       | Required audit                      | Required notification                                              |
| ---------------------------------------- | ----------------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| `CreateCycleCountCommandHandler`         | Existing: `Create` -> `Scheduled`   | Keep                                | Add: `AssignedTo` using `TaskAssigned`                             |
| `SubmitCycleCountCommandHandler`         | Existing: `Submit`                  | Keep                                | Add: eligible finalizers in the warehouse, excluding submitter     |
| `RequestCycleCountRecountCommandHandler` | Existing: `RequestRecount` + reason | Keep                                | Add: assigned counter                                              |
| `FinalizeCycleCountCommandHandler`       | Existing: `Finalize`                | Keep                                | Add: assigned/submitting users when different from actor           |
| `RecordCycleCountItemCommandHandler`     | None                                | None per count line                 | None                                                               |
| `CreateOutboundOrderCommandHandler`      | Missing                             | Add: `Create`, empty -> `Pending`   | None by default                                                    |
| `IssueStockCommandHandler`               | Existing: `IssueStock`              | Keep                                | Add to creator only when actor differs                             |
| `RecordReturnCommandHandler`             | Missing                             | Add: `Create`, empty -> `Requested` | Add: eligible return approvers in order warehouse, excluding maker |
| `ApproveReturnCommandHandler`            | Existing: `Approve`                 | Keep                                | Add: return `CreatedBy`                                            |
| `RejectReturnCommandHandler`             | Existing: `Reject` + reason         | Keep                                | Add: return `CreatedBy`                                            |
| `UpdateDeliveryStatusCommandHandler`     | Existing: `UpdateDelivery`          | Keep                                | Expand current behavior as defined below                           |
| `AssignManagerToWarehouseCommandHandler` | Missing                             | Add: `AssignManager` on `Warehouse` | Add: newly assigned manager                                        |

Delivery notification rules:

- `AssignedToTransport`: notify only the newly assigned delivery staff using `TaskAssigned`.
- `Shipping`: no notification by default.
- `Delivered`: notify order creator when actor differs.
- `Failed`: retain the existing notification to order creator when actor differs and include the failure reason.
- A retry that fails the transition guard must not create another notification.

### 4.3 P2 audit-only coverage

Add audit records, but no user notifications by default, for:

- Warehouse create, update, deactivate.
- Zone, rack, and slot create, update, deactivate.
- `SaveWarehouseLayoutSceneCommandHandler`: one `UpdateLayout` audit per confirmed save, never per drag operation.
- Product create, update, stock-policy update, and completed import summary.
- Supplier create, update, deactivate, and reactivate.
- Inventory reserve and release.
- Damaged-stock reporting.
- Inbound receipt draft update and put-away already have audit records; keep them audit-only.

Use one summary audit for product import. Do not create one audit per imported row.

### 4.4 Explicitly excluded

- Subscription, PayOS, tenant status, and subscription-plan notifications: already integrated.
- Organization/staff lifecycle except warehouse-manager assignment.
- Platform Administration.
- Authentication and security audit changes.
- Forecast generation, replenishment suggestion review, and draft PO generation: corresponding write workflows do not exist.
- Dashboard/report export tracking until an explicit export command and policy exist.
- New transfer/outbound/return detail screens.
- Email, SMS, mobile push, Kafka/RabbitMQ, and a transactional outbox.

## 5. Audit Contract

### 5.1 Preserve current naming

Use the current `IAuditLog.RecordStateChangeAsync` contract and exact domain entity names:

```text
PurchaseOrder
InboundReceipt
StockAdjustment
StockTransfer
OutboundOrder
Return
CycleCount
Warehouse
Zone
Rack
Slot
Product
Supplier
InventoryBalance
LowStockAlert
```

Existing action strings remain unchanged. New actions should follow the same verb style:

```text
Create
Update
Deactivate
Reactivate
AssignManager
UpdateLayout
Reserve
ReleaseReservation
ReportDamaged
OpenLowStockAlert
ResolveLowStockAlert
```

Use `Reason` only for rejection, failure, variance, damage, or other meaningful operator-provided context. Never store tokens, credentials, passwords, payment secrets, full request headers, or sensitive customer data.

### 5.2 Warehouse-scoped audit gap

The current `AuditLog` has no `WarehouseId`, so `GetAuditLogsQueryHandler` cannot enforce assigned-warehouse visibility. This is a real platform gap and must be fixed before warehouse events are considered fully integrated.

Required changes:

1. Add nullable `WarehouseId` to `AuditLog`.
2. Add an optional warehouse argument to `IAuditLog.RecordStateChangeAsync` and pass it from warehouse-scoped handlers.
3. Add an index suitable for tenant/warehouse/time filtering.
4. Keep historical records with `WarehouseId = null`; do not attempt unsafe polymorphic SQL backfills.
5. Update audit response/query filters only if the UI needs an explicit warehouse filter. Authorization must be enforced server-side regardless of UI filters.

Visibility rules:

- System Admin: platform logs where `TenantId` is null.
- Tenant Owner: all logs for the active tenant.
- Warehouse Manager with `audit-logs:view`: logs for actively assigned warehouses.
- Warehouse Staff: no Audit Log access under the current permission policy.
- Tenant-wide records with no warehouse remain visible to Tenant Owner only.

Do not infer warehouse access solely from an entity ID inside the controller.

## 6. Notification Contract

### 6.1 Notification types

Keep all existing values and add only these warehouse categories:

```text
InboundUpdate
StockAdjustmentUpdate
TransferUpdate
OutboundUpdate
ReturnUpdate
CycleCountUpdate
WarehouseUpdate
```

Use existing types where they are already semantically correct:

- Purchase Order: `POUpdate`
- Low stock: `LowStock`
- Delivery: `DeliveryUpdate`
- Direct assignment: `TaskAssigned`

Update the FE `NOTIFICATION_TYPES`, filter labels, Zod schema, test fixtures, and type-dependent rendering in the same change.

### 6.2 Canonical reference types and routes

Persist exact backend entity names in `ReferenceType`.

| Notification context | ReferenceType     | Existing FE route                                    |
| -------------------- | ----------------- | ---------------------------------------------------- |
| Purchase order       | `PurchaseOrder`   | `/purchase-orders/{id}`                              |
| Inbound receipt      | `InboundReceipt`  | `/inbound/receipts/{id}`                             |
| Stock adjustment     | `StockAdjustment` | `/inventory/stock-adjustments/{id}`                  |
| Cycle count          | `CycleCount`      | `/inventory/cycle-counts/{id}`                       |
| Warehouse assignment | `Warehouse`       | `/warehouses/{id}`                                   |
| Low stock            | `Product`         | `/products/{id}`                                     |
| Transfer             | `StockTransfer`   | `/transfers` (list fallback; no detail route exists) |
| Outbound workflow    | `OutboundOrder`   | `/orders` (list fallback; no detail route exists)    |
| Delivery workflow    | `OutboundOrder`   | `/delivery`                                          |
| Customer return      | `Return`          | `/returns` (list fallback; no detail route exists)   |

Because `OutboundOrder` maps to different destinations for outbound and delivery notifications, change the frontend route resolver to accept the whole notification (at minimum `type`, `referenceType`, and `referenceId`) rather than mapping by `referenceType` alone.

If a route does not exist, use the valid list page. Do not construct fictional `/{id}` routes. Backend authorization remains authoritative if the target is no longer accessible.

### 6.3 Notification content

Titles and messages must include a user-recognizable business code where available:

- `PONumber`
- `ReceiptCode`
- `TransferCode`
- `OrderCode`
- `ReturnCode`

Stock Adjustment and Cycle Count currently have no display code; use a short ID only when necessary. Do not expose raw internal IDs as the primary message when a business code exists.

Rejection and delivery-failure notifications may include the validated reason. Do not expose unrelated entity details.

## 7. Recipient Resolution

Do not hard-code role IDs or query recipients in controllers.

Add a shared Application abstraction such as `INotificationRecipientResolver`, with an Infrastructure implementation optimized for the existing schema. It must resolve recipients from:

- active `User`;
- active `UserTenant` membership in the event tenant;
- current role and effective tenant-role permissions;
- active `WarehouseUser` assignment when the event is warehouse-scoped;
- explicit maker/creator/assignee IDs for result and assignment notifications.

The resolver must follow `PermissionService` and `TenantPermissionPolicy` semantics rather than assuming every Warehouse Manager has every permission.

### 7.1 Permission-based recipients

| Event                 | Required effective permission | Warehouse scope          |
| --------------------- | ----------------------------- | ------------------------ |
| PO submitted          | `purchase-orders:approve`     | PO warehouse             |
| Receipt submitted     | `inbound-receipts:approve`    | Receipt warehouse        |
| Adjustment created    | `stock-adjustments:approve`   | Adjustment warehouse     |
| Transfer created      | `transfers:approve`           | Source warehouse         |
| Transfer dispatched   | `transfers:receive`           | Destination warehouse    |
| Return recorded       | `returns:approve`             | Outbound order warehouse |
| Cycle count submitted | `cycle-counts:finalize`       | Cycle-count warehouse    |
| Low stock opened      | `inventory:view`              | Affected warehouse       |

Tenant Owner remains eligible for tenant-level approval events according to existing business rules and does not require a `WarehouseUser` assignment. For a warehouse-scoped manager or staff recipient, an active assignment is mandatory.

Exclude the current actor where a self-notification has no value. Maker-checker approval requests must exclude the maker. Always distinct recipient IDs before creating notifications.

### 7.2 Direct recipients

For approval results, use the entity's existing identity fields:

- `PurchaseOrder.CreatedBy`
- `InboundReceipt.CreatedBy`
- `StockAdjustment.CreatedBy`
- `StockTransfer.CreatedBy`
- `Return.CreatedBy`
- `OutboundOrder.CreatedBy`
- `CycleCount.AssignedTo` / `SubmittedBy`

Before staging a direct notification, confirm that the user and tenant membership are still active. Do not fall back to broadcasting to all tenant users when the original user is inactive.

## 8. Shared Notification Staging Pattern

Add a small cross-cutting Application service for staging persisted notifications; do not build a CRUD service and do not inject services into controllers.

Conceptual contract:

```text
Stage notifications
    input: tenant, type, title, message, reference, recipient IDs
    behavior: validate/distinct recipients and add Notification entities
    output: staged notifications for post-commit realtime publishing
```

Each handler remains responsible for deciding that a meaningful business event occurred. The shared service owns only recipient-safe notification creation.

Handler sequence:

1. Load and validate the business entity.
2. Enforce tenant, warehouse, permission, and transition rules.
3. Capture previous state.
4. Apply the existing business mutation.
5. Stage the audit record.
6. Resolve recipients and stage notifications.
7. Call the handler's existing save/conflict-handling method exactly once.
8. For explicit transactions, publish only after `CommitTransactionAsync` succeeds.
9. Publish each staged notification with `INotificationRealtimePublisher`.

Do not call `EnsureSaveAsync` inside the shared notification service.

## 9. Low-Stock Lifecycle

`LowStockAlert` currently exists and dashboards count open alerts, but no command or job creates/resolves alerts. Implement the first version around actual stock mutations.

### 9.1 Threshold and scope

- Evaluate per `(TenantId, WarehouseId, ProductId)`.
- Use aggregate available quantity for the product in the warehouse.
- Use `Product.MinStockThreshold` as the current threshold source.
- Only evaluate active products and active warehouses.
- Do not evaluate from inventory GET/dashboard/report queries.

### 9.2 State transitions

```text
available <= threshold and no active alert
    -> create LowStockAlert(Open)
    -> audit OpenLowStockAlert
    -> notify eligible warehouse recipients once

available <= threshold and Open/Acknowledged alert exists
    -> update quantity if needed
    -> no duplicate notification

available > threshold and Open/Acknowledged alert exists
    -> mark Resolved
    -> audit ResolveLowStockAlert
    -> no notification by default
```

Add a filtered unique index preventing more than one non-resolved warehouse alert for the same tenant, warehouse, and product. Clean existing duplicates in the generated migration before adding the index.

### 9.3 Stock-changing integration points

Evaluate only impacted product/warehouse pairs after their balances have been mutated and before the final save/commit:

- `ApproveStockAdjustmentCommandHandler`
- `ReportDamagedStockCommandHandler`
- `PutAwayStockCommandHandler`
- `DispatchTransferCommandHandler` for source warehouse
- `ReceiveTransferCommandHandler` for destination warehouse
- `IssueStockCommandHandler`
- `ApproveReturnCommandHandler` when stock is restored

The evaluator must return staged notifications so the handler can publish realtime only after successful persistence.

## 10. Idempotency and Concurrency

The current warehouse commands do not expose a general command ID or idempotency key. This integration must not claim global command idempotency that the business commands do not provide.

Use the protections already present:

- state-transition guards reject replay after a successful transition;
- row-version/conflict helpers protect adjustment, transfer, outbound, return, and related mutations;
- notification creation occurs only inside the successful transition branch;
- recipients are distinct;
- low-stock active-alert uniqueness prevents alert spam.

If a create command itself is retried and creates a second business entity, that is a broader API idempotency concern and is outside this integration. There must still be only one notification set per actual created entity.

## 11. Backend Implementation Phases

### Phase 0 — Baseline inspection

- [x] Confirm existing audit abstraction and persistence behavior.
- [x] Confirm existing notification entity, query, and mark-read behavior.
- [x] Confirm SignalR routing and best-effort failure behavior.
- [x] Inventory warehouse command handlers and existing audit coverage.
- [x] Confirm current permission and warehouse-assignment infrastructure.
- [x] Confirm low-stock entity exists but evaluator does not.
- [x] Confirm forecasting/replenishment is query-only.

### Phase 1 — Shared contracts and database support

- [ ] Add `WarehouseId` to `AuditLog` and `IAuditLog` contract.
- [ ] Add warehouse/time audit indexes.
- [ ] Add low-stock non-resolved uniqueness constraint.
- [ ] Generate the migration with EF CLI; never hand-write it.
- [ ] Add `INotificationRecipientResolver` and implementation.
- [ ] Add shared notification staging service.
- [ ] Add new `NotificationType` values.
- [ ] Add focused unit tests for recipient resolution and staging.

### Phase 2 — P0 workflows

- [ ] Purchase Order submit/approve/reject notifications.
- [ ] Inbound Receipt submit/approve/reject notifications.
- [ ] Stock Adjustment create/approve/reject notifications.
- [ ] Transfer create audit and create/approve/reject/dispatch/receive notifications.
- [ ] Low-stock evaluator, persistence, deduplication, and P0 integration points.

### Phase 3 — Operational workflows

- [ ] Cycle Count assignment/submit/recount/finalize notifications.
- [ ] Outbound Order create audit and issue-completion notification.
- [ ] Customer Return create audit and approval notifications.
- [ ] Delivery assignment/delivered/failed notification behavior.
- [ ] Warehouse manager assignment audit and notification.

### Phase 4 — Audit-only commands

- [ ] Warehouse and warehouse-location audit coverage.
- [ ] Confirmed layout-save audit.
- [ ] Product and stock-policy audit coverage.
- [ ] Product import summary audit.
- [ ] Supplier audit coverage.
- [ ] Reservation/release/damaged-stock audit coverage.

## 12. Frontend Implementation Phases

### Phase FE-1 — Contract alignment

- [ ] Add new notification types to TypeScript and Zod sources of truth.
- [ ] Add Vietnamese filter labels for all new types.
- [ ] Update notification query/filter tests.

### Phase FE-2 — Reference routing

- [ ] Change route resolution to use notification type plus reference type/id.
- [ ] Add routes for Inbound Receipt, Stock Adjustment, Cycle Count, Warehouse, and Product.
- [ ] Add list fallbacks for Stock Transfer, Outbound Order, Delivery, and Return.
- [ ] Add unit tests for every supported notification context.
- [ ] Keep the action hidden when no safe route is available.

### Phase FE-3 — Query invalidation and QA

- [ ] Keep notification-list/bell invalidation on realtime events.
- [ ] Verify unread count, filters, mark-read, reconnect, and duplicate-toast behavior.
- [ ] Verify a notification link cannot reveal data when the API denies tenant/warehouse access.
- [ ] Do not add business state to Zustand; refetch through React Query.

## 13. Test Plan

### 13.1 Backend tests per integrated transition

For every P0/P1 workflow, cover:

- successful state change stages the expected audit action;
- notification is persisted only when required;
- recipient is in the same tenant;
- permission-based recipient has the effective permission;
- warehouse-scoped recipient has an active assignment;
- maker is excluded from approval-request recipients;
- creator/maker receives approval or rejection result when active;
- rejection/failure reason is preserved;
- invalid transition creates no success audit or notification;
- unauthorized tenant or warehouse access creates nothing;
- concurrency conflict creates no committed audit or notification;
- replay after a completed transition does not create duplicates;
- SignalR publisher failure does not undo persisted business, audit, or notification data.

Low-stock tests must additionally cover open, repeated-below-threshold, resolve, reopen, multiple warehouses, tenant isolation, and concurrent duplicate prevention.

### 13.2 Audit query tests

- System Admin sees platform logs only.
- Tenant Owner sees all logs in the current tenant.
- Warehouse Manager sees assigned-warehouse logs only.
- A manager cannot see another warehouse's operational audit.
- A tenant-wide null-warehouse log is not exposed to a manager.
- Cross-tenant records never appear.

### 13.3 Frontend tests

- Every backend notification type parses successfully.
- Every reference mapping points to an existing route.
- `OutboundOrder` resolves differently for `OutboundUpdate` and `DeliveryUpdate`.
- Unknown/inaccessible references do not render an unsafe link.
- Realtime event invalidates notification queries and shows at most one toast per event ID.
- Notification filters contain localized labels for the new types.

### 13.4 Regression commands

Backend:

```powershell
dotnet build SSWMS-API.slnx
dotnet test SSWMS-API.slnx --no-build
dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API --no-build
```

Frontend:

```powershell
pnpm install --frozen-lockfile
pnpm lint
pnpm test -- --run
pnpm build
pnpm typecheck
```

Run `pnpm build` before standalone `pnpm typecheck` in a completely clean checkout so Next.js generates `.next/types` used by global route/page types.

## 14. Migration Rules

Entity/configuration changes in this spec require an EF-generated migration for:

- nullable `AuditLog.WarehouseId` and its foreign key/indexes;
- filtered uniqueness for active warehouse `LowStockAlert` records;
- any additional persistence field proven necessary during implementation.

Required process:

1. Change Domain entity and EF configuration.
2. Build successfully.
3. Run `dotnet ef migrations add <MigrationName> --project Infrastructure --startup-project API`.
4. Inspect generated migration, designer, and snapshot.
5. Run `has-pending-model-changes`.
6. Never manually create or edit a migration to imitate EF output.

## 15. Acceptance Criteria

- [ ] P0 approval workflows generate the specified persisted notifications.
- [ ] Existing workflow audit entries remain correct and new missing audit entries are present.
- [ ] Audit visibility follows tenant and assigned-warehouse scope.
- [ ] Maker and checker identities remain traceable through entity fields and audit actors.
- [ ] Notification recipients are active, authorized, correctly scoped, and deduplicated.
- [ ] Realtime publishing occurs only after successful save/commit.
- [ ] Realtime failure does not fail a completed business operation.
- [ ] Low-stock alerts open, deduplicate, resolve, and reopen correctly.
- [ ] No GET/search/report/forecast request creates notification or audit data.
- [ ] Every notification reference opens a real FE route or a safe list fallback.
- [ ] No existing Subscription/PayOS, RBAC, inventory calculation, or maker-checker behavior is rewritten.
- [ ] EF migration is generated by CLI and the model has no pending changes.
- [ ] Existing and new BE/FE automated tests pass.
- [ ] Visual QA passes for Tenant Owner, Warehouse Manager, and Warehouse Staff notification flows.

## 16. Progress Summary

| Area                            | Status      | Notes                                               |
| ------------------------------- | ----------- | --------------------------------------------------- |
| Current architecture inspection | Complete    | Based on FE `fc95bb9` and BE `7440f6b`              |
| Spec aligned with actual code   | Complete    | Generic/nonexistent workflows removed               |
| Integration branches            | Not started | Create both branches from current `dev`             |
| Shared BE infrastructure        | Not started | Recipient resolver, staging, audit warehouse scope  |
| P0 workflow integration         | Not started | Purchase, inbound, adjustment, transfer, low stock  |
| P1 operational integration      | Not started | Cycle count, outbound, return, delivery, assignment |
| P2 audit coverage               | Not started | Warehouse/catalog/inventory writes                  |
| FE contract and routing         | Not started | New types and safe deep links                       |
| Automated and visual QA         | Not started | Execute after implementation                        |

## 17. Definition of Done

Warehouse modules remain the owners of business decisions and state transitions. Platform Services only records successful, meaningful actions and communicates actionable results. The implementation must use the existing unit-of-work, audit, notification, SignalR, tenant, permission, and warehouse-access mechanisms; it must not introduce a parallel subsystem or broaden access beyond the current business rules.
