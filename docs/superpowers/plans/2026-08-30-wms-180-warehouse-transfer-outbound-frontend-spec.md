# WMS-180 Warehouse Transfer & Outbound Frontend Specification

## 1. Document Control

| Field                   | Value                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jira                    | [WMS-180 - Frontend Warehouse Transfer & Outbound](https://ngocthiennguyen28052004-1779890740761.atlassian.net/browse/WMS-180)                    |
| Backend companion       | [WMS-127 - Backend Warehouse Transfer & Outbound](https://ngocthiennguyen28052004-1779890740761.atlassian.net/browse/WMS-127)                     |
| Checklist source        | [Report3_ProjectTracking](https://docs.google.com/spreadsheets/d/1JZHPvytTkcLCPws7zllLrkqNMNCujeHK5SK_FN3CnU8/edit?gid=1480330355#gid=1480330355) |
| Frontend branch         | `feat/wms-180-frontend-warehouse-transfer-outbound`                                                                                               |
| Backend contract branch | `feat/wms-127-complete-transfer-outbound-apis`                                                                                                    |
| Created                 | 2026-08-30                                                                                                                                        |
| Last updated            | 2026-08-30                                                                                                                                        |
| State                   | Ready for implementation                                                                                                                          |
| Accepted use cases      | `0 / 12`                                                                                                                                          |

This document is the implementation source of truth and progress tracker for WMS-180. Existing
scaffold code is recorded as baseline work, but a use case is counted as complete only after its
acceptance checklist and required verification pass.

## 2. Status Legend And Update Rules

Use these values consistently in progress tables:

- `Not started`: no implementation beyond shared scaffold.
- `In progress`: implementation exists but the acceptance checklist is incomplete.
- `Blocked`: work cannot continue until the named dependency is resolved.
- `Ready for QA`: implementation and automated tests pass; browser QA remains.
- `Done`: automated verification, permission checks, responsive QA, and acceptance criteria pass.

Progress-update rules:

- Check an item only when there is code or test evidence for it.
- Update the use-case status and the `Accepted use cases` count together.
- Record blockers in Section 14 with an owner/dependency and resolution condition.
- Add a dated entry to Section 16 after each meaningful implementation or verification session.
- Do not count routes, types, or placeholder components alone as a completed use case.

## 3. Scope

### In Scope

- Complete five Warehouse Transfer use cases: `WT-01` through `WT-05`.
- Complete five Outbound Order use cases: `OO-01` through `OO-05`.
- Complete two Delivery use cases: `DL-01` and `DL-02`.
- Add the full Customer module needed by the Outbound workflow.
- Add Returns as an operational workspace linked from Outbound.
- Synchronize all FE contracts and state transitions with the WMS-127 backend branch.
- Add route, navigation, permission, schema, service, hook/page, and responsive tests.
- Preserve the existing Fresh Logistics design system and fixed-viewport behavior.

### Out Of Scope

- Backend business-rule changes not required by the agreed WMS-127 contract.
- Customer deletion or archival; the current backend contract exposes create and update only.
- A separate top-level sidebar item for Returns or Delivery.
- New third-party UI or state-management dependencies.
- Redesigning unrelated Inventory, Purchase Order, Inbound, or Administration modules.

## 4. Rules And Implementation Constraints

Implementation must follow this priority:

1. Repository `.rules` and `AGENTS.md`.
2. `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/GIT_WORKFLOW.md`,
   `docs/AI_WORKFLOW.md`, and `src/app/index.css`.
3. Existing feature, React Query, React Hook Form, Zod, Axios, logger, and Sonner patterns.
4. Existing shadcn/ui primitives and Lucide icons.
5. React/Next.js performance practices: parallel independent queries, stable query keys, no
   request waterfalls introduced by presentation components, and no unnecessary client bundle.

Required architecture rules:

- Pages/hooks own query, mutation, permission, URL-filter, and form orchestration.
- Presentational components receive typed values and callbacks; they do not call services directly.
- API request/response types must match backend DTOs and validators rather than UI assumptions.
- Mutations log failures through the project logger, show a Sonner result, and invalidate all
  affected list/detail/inventory caches.
- Table bodies and workspaces scroll internally; the document must not gain accidental horizontal
  scrolling or unnecessary page-level vertical scrolling.
- Keep server search, filters, sort, and pagination in the URL/query contract where supported.

## 5. Current Baseline

The branch already contains partial scaffold code:

- `/transfers` is the only implemented App Router page in this scope.
- Transfer has types, schema, service, list hook/page, directory, detail sheet, status badge, and
  reject dialog scaffolds.
- Outbound has types, schema, service, list hook/page, directory, detail sheet, status badge, issue
  dialog, and partial return components, but its routes are not implemented.
- Delivery has types, schema, service, hooks, and a status badge, but no completed page/workspace.
- Route constants and query-key scaffolds exist for transfers, outbound orders, returns, delivery,
  and customers.
- Customer has no dedicated feature folder or routes.
- Existing FE contracts do not yet cover all detail, approve/receive variance, return rejection,
  delivery assignment/history, and full Customer operations from the completed backend contract.

Baseline verification to preserve until replaced by a newer run:

- `pnpm typecheck`: fails on typed links to routes that do not yet exist.
- `pnpm test`: 306 of 309 tests pass; three navigation/sidebar tests have stale expectations.
- Existing scaffold is not accepted as completion for any of the 12 tracked use cases.

## 6. Progress Dashboard

| Area                           | Use cases             | Status      | Accepted   | Next milestone                                  |
| ------------------------------ | --------------------- | ----------- | ---------- | ----------------------------------------------- |
| Contract and shared foundation | Cross-cutting         | Not started | N/A        | Sync FE types/endpoints/query keys with WMS-127 |
| Warehouse Transfer             | WT-01..WT-05          | In progress | 0/5        | Complete detail and create flow                 |
| Outbound Order                 | OO-01..OO-05          | In progress | 0/5        | Add routes, detail, and create flow             |
| Delivery                       | DL-01..DL-02          | In progress | 0/2        | Build workspace and transitions                 |
| Returns                        | Supports OO-05        | In progress | 0 accepted | Add list/detail/approve/reject workspace        |
| Customer                       | Supports OO-01..OO-05 | Not started | 0 accepted | Add full module and quick-create dialog         |
| Navigation and permissions     | Cross-cutting         | In progress | N/A        | Final compact sidebar and route guards          |
| Automated and browser QA       | Cross-cutting         | Not started | N/A        | Restore green baseline, then add coverage       |

## 7. Route And Navigation Contract

### Routes

| Route                     | Purpose                                                       | Required permission      |
| ------------------------- | ------------------------------------------------------------- | ------------------------ |
| `/transfers`              | Transfer list, filters, detail, and state actions             | `transfers:view`         |
| `/transfers/new`          | Create a warehouse transfer                                   | `transfers:create`       |
| `/orders`                 | Outbound order list, filters, detail, issue, and return entry | `outbound-orders:view`   |
| `/orders/new`             | Create an outbound order                                      | `outbound-orders:create` |
| `/returns`                | Return list, detail, approval, and rejection                  | `returns:view`           |
| `/delivery`               | Delivery tracking, assignment, and status updates             | `deliveries:view`        |
| `/customers`              | Customer list, search, paging, and create                     | `customers:view`         |
| `/customers/[customerId]` | Customer detail, update, and outbound order history           | `customers:view`         |

Action controls must additionally check their backend-aligned action permissions. Hidden controls are
UX behavior only; a backend `403` remains authoritative.

### Sidebar

- Add `Khách hàng` under `Danh mục`.
- Keep `Điều chuyển kho` under `Vận hành kho`.
- Keep one compact `Xuất kho & Giao hàng` destination under `Vận hành kho`.
- Do not add separate sidebar rows for Returns and Delivery.
- Add an `OutboundWorkspaceNavigation` inside the outbound workspace to switch among orders,
  returns, and delivery while keeping the main sidebar compact.
- Update role/permission visibility and active-route tests for every affected route.

## 8. Backend Contract Matrix

FE must reread the final controller, DTO, command, query, and validator before changing each service.
The current WMS-127 branch exposes this target surface:

| Area     | Endpoint                                        | FE responsibility                                             |
| -------- | ----------------------------------------------- | ------------------------------------------------------------- |
| Transfer | `GET /api/transfers`                            | Server search/filter/date/paging                              |
| Transfer | `GET /api/transfers/{id}`                       | Fetch authoritative detail for the detail sheet               |
| Transfer | `POST /api/transfers`                           | Create from source inventory and destination slots            |
| Transfer | `POST /api/transfers/{id}/approve`              | Submit approved quantities and optional note                  |
| Transfer | `POST /api/transfers/{id}/reject`               | Submit rejection reason                                       |
| Transfer | `POST /api/transfers/{id}/dispatch`             | Confirm dispatch                                              |
| Transfer | `POST /api/transfers/{id}/receive`              | Submit received/damaged/missing quantities                    |
| Outbound | `GET /api/outbound-orders`                      | Server search/filter/date/paging                              |
| Outbound | `GET /api/outbound-orders/{id}`                 | Show recipient snapshot, items, picking, and state            |
| Outbound | `POST /api/outbound-orders`                     | Create order for warehouse/customer/products                  |
| Outbound | `POST /api/outbound-orders/{id}/issue`          | Issue from a source slot; support partial remaining quantity  |
| Outbound | `POST /api/outbound-orders/{id}/returns`        | Record valid return quantities and disposition                |
| Return   | `GET /api/returns`                              | Server filtering and paging                                   |
| Return   | `GET /api/returns/{id}`                         | Fetch authoritative return detail                             |
| Return   | `POST /api/returns/{id}/approve`                | Approve a requested return                                    |
| Return   | `POST /api/returns/{id}/reject`                 | Reject with required reason                                   |
| Delivery | `GET /api/deliveries`                           | List rows include recipient, assignment, failure, and history |
| Delivery | `POST /api/deliveries/{outboundOrderId}/status` | Submit valid status transition and supporting fields          |
| Customer | `GET /api/customers`                            | Search and paginate by supported query fields                 |
| Customer | `GET /api/customers/{id}`                       | Fetch detail                                                  |
| Customer | `GET /api/customers/{id}/orders`                | Paginated outbound order history                              |
| Customer | `POST /api/customers`                           | Create customer                                               |
| Customer | `PUT /api/customers/{id}`                       | Update customer                                               |

State labels and action availability must use these backend states exactly:

- Transfer: `PendingSourceApproval`, `Approved`, `InTransit`, `Completed`,
  `ReceivedWithVariance`, `Rejected`, `Cancelled`.
- Outbound: `Pending`, `Picking`, `Packing`, `ReadyToShip`, `AssignedToTransport`, `Shipping`,
  `Delivered`, `Failed`.
- Return: `Requested`, `Approved`, `Rejected`, `Restocked`.
- Delivery transitions: `ReadyToShip -> AssignedToTransport -> Shipping -> Delivered/Failed` and
  `Failed -> AssignedToTransport`.

## 9. Use-Case Acceptance Tracker

### WT-01 - Browse And Search Warehouse Transfers

Status: `In progress`

- [ ] List uses server-side search, status, warehouse, date-range, and pagination parameters.
- [ ] Loading, error, empty, no-results, and populated states are distinct.
- [ ] Status badges map every backend transfer state.
- [ ] Row selection opens detail without loading a stale list-only model as authoritative data.
- [ ] Permission and direct-route behavior are covered by tests.

### WT-02 - View Warehouse Transfer Details

Status: `Not started`

- [ ] Detail sheet queries `GET /api/transfers/{id}` and handles its own loading/error state.
- [ ] Detail shows source/destination warehouses, requester/approver, dates, notes, and item lines.
- [ ] Each line shows requested, approved, dispatched, received, damaged, and missing quantities
      when present.
- [ ] Available actions are derived from state and permissions.
- [ ] Closing/reopening and post-mutation refresh cannot show stale detail.

### WT-03 - Create Warehouse Transfer

Status: `Not started`

- [ ] `/transfers/new` exists and passes typed-route validation.
- [ ] Source and destination warehouses are required and cannot be the same.
- [ ] Product selection is based on available source inventory.
- [ ] Destination slot options belong to the selected destination warehouse.
- [ ] Lines validate positive quantities and prevent duplicates/invalid inventory selection.
- [ ] Success invalidates transfer and affected inventory caches, then navigates predictably.
- [ ] API validation remains visible without losing valid user input.

### WT-04 - Approve, Reject, And Dispatch Transfer

Status: `Not started`

- [ ] Approve dialog permits reduced approved quantities but never more than requested.
- [ ] Approve payload and optional note match the backend command.
- [ ] Reject dialog requires and submits a meaningful reason.
- [ ] Dispatch requires explicit confirmation and is only available in `Approved`.
- [ ] Maker/checker and permission restrictions are reflected in UI tests.
- [ ] Each mutation logs errors, shows a toast, and refreshes list/detail/inventory data.

### WT-05 - Receive Warehouse Transfer

Status: `Not started`

- [ ] Receive form is available only for `InTransit` and authorized users.
- [ ] Every dispatched line captures received, damaged, and missing quantities.
- [ ] Per line, `received + damaged + missing = dispatched` before submission.
- [ ] Zero and partial variance cases match backend validation.
- [ ] Result renders `Completed` or `ReceivedWithVariance` correctly.
- [ ] Success refreshes transfer detail/list and affected inventory caches.

### OO-01 - Browse And Search Outbound Orders

Status: `In progress`

- [ ] `/orders` exists and passes typed-route validation.
- [ ] List uses server-side search, status, warehouse, customer, date-range, and paging.
- [ ] Rows show order code, warehouse, customer/recipient snapshot, purpose, state, and dates.
- [ ] Loading, error, empty, no-results, and populated states are distinct.
- [ ] Workspace navigation reaches Orders, Returns, and Delivery without extra sidebar rows.

### OO-02 - View Outbound Order Details

Status: `Not started`

- [ ] Detail queries `GET /api/outbound-orders/{id}`.
- [ ] Detail shows customer code/name, recipient snapshot, purpose, items, and picking progress.
- [ ] Issued and remaining quantities are clear per line.
- [ ] State/permission-based actions are accurate.
- [ ] Detail refreshes after issue, return, and delivery mutations.

### OO-03 - Create Outbound Order

Status: `Not started`

- [ ] `/orders/new` exists and passes typed-route validation.
- [ ] Form selects warehouse, customer, recipient information, purpose, and product lines.
- [ ] Product/customer selectors support loading, empty, error, and search states.
- [ ] A reusable quick-customer dialog can create a customer and select it without losing order form
      state.
- [ ] Duplicate items, non-positive quantities, and missing required recipient fields are blocked.
- [ ] Success invalidates order/customer caches and navigates predictably.

### OO-04 - Issue Stock For Outbound Order

Status: `In progress`

- [ ] Issue dialog selects a valid source slot for each issue action.
- [ ] Issued quantity is positive and cannot exceed the remaining issue quantity.
- [ ] Partial issuing is supported until backend state progression is complete.
- [ ] Available inventory is refreshed after successful issue.
- [ ] Error responses preserve the current valid selection and quantity.

### OO-05 - Record And Process Returned Stock

Status: `In progress`

- [ ] Return entry calculates allowable quantity as picked quantity minus existing non-rejected
      return quantities.
- [ ] Return quantity cannot exceed the allowable quantity.
- [ ] `Good` disposition requires a valid restock slot.
- [ ] `/returns` supports list, filter, paging, detail, approve, and reject flows.
- [ ] Return rejection requires and submits a reason.
- [ ] Return/order/inventory caches refresh after return mutations.

### DL-01 - Browse And Inspect Deliveries

Status: `In progress`

- [ ] `/delivery` exists and passes typed-route validation.
- [ ] List supports server-side search/filter/status/warehouse/paging exposed by the backend query.
- [ ] Detail displays order, warehouse, customer, recipient, assigned staff, failure reason, and full
      status history.
- [ ] Loading, error, empty, no-results, and populated states are distinct.
- [ ] History is ordered and labels old/new states consistently.

### DL-02 - Assign And Update Delivery Status

Status: `Not started`

- [ ] UI permits only the backend transition graph.
- [ ] Assignment from `ReadyToShip` or retry from `Failed` requires active delivery staff.
- [ ] `AssignedToTransport` can move to `Shipping`.
- [ ] `Shipping` can move to `Delivered` or `Failed`.
- [ ] Moving to `Failed` requires a failure reason.
- [ ] Success refreshes delivery and outbound order caches; errors preserve entered data.

## 10. Customer Module Tracker

Customer is a supporting module required for a complete outbound workflow. It is tracked separately
from the 12 Jira/UC acceptance count.

- [ ] Add `src/features/customer` with types, schemas, service, query/mutation hooks, pure
      components, pages, and tests.
- [ ] Add `/customers` with search by supported code/name/phone fields and server pagination.
- [ ] Add create customer dialog/form with backend-aligned validation and error mapping.
- [ ] Add `/customers/[customerId]` with detail and update flow.
- [ ] Add paginated customer outbound order history.
- [ ] Extract a reusable quick-create customer dialog for the outbound order form.
- [ ] Invalidate customer lists/detail/order history after relevant mutations.
- [ ] Add `Khách hàng` under `Danh mục` with permission-aware visibility and active-state tests.
- [ ] Do not expose delete/archive actions that are absent from the backend contract.

## 11. Implementation Work Breakdown

### Phase 0 - Contract Freeze And Baseline

- [ ] Pull/rebase the FE working branch on the intended base without discarding user changes.
- [ ] Confirm the WMS-127 branch DTOs, validators, permissions, filters, paging, and state commands.
- [ ] Capture current `pnpm typecheck`, `pnpm test`, `pnpm lint`, and `git diff --check` results.
- [ ] Map every changed endpoint to the affected FE type, schema, service, hook, and query key.

### Phase 1 - Shared Contracts, Routes, And Navigation

- [ ] Complete route constants and physical App Router pages.
- [ ] Complete API endpoint constants and detail/action endpoints.
- [ ] Complete stable query-key factories for list/detail/history and filter objects.
- [ ] Align permission guards and nav visibility.
- [ ] Implement compact sidebar plus `OutboundWorkspaceNavigation`.
- [ ] Restore route typecheck and existing sidebar/navigation tests to green.

### Phase 2 - Warehouse Transfer

- [ ] Complete WT-01 and WT-02 list/detail flow.
- [ ] Build WT-03 create route and form.
- [ ] Complete WT-04 approve/reject/dispatch actions.
- [ ] Complete WT-05 receive-with-variance flow.
- [ ] Add focused schema, service, hook/page, mutation, permission, and responsive tests.

### Phase 3 - Customer

- [ ] Build Customer list/create flow.
- [ ] Build Customer detail/update/order-history flow.
- [ ] Integrate reusable quick create into Outbound Order creation.
- [ ] Add focused customer and navigation tests.

### Phase 4 - Outbound And Returns

- [ ] Complete OO-01 and OO-02 list/detail flow.
- [ ] Build OO-03 create route and form.
- [ ] Complete OO-04 source-slot and partial issue flow.
- [ ] Complete OO-05 return entry and Returns workspace.
- [ ] Add focused schema, service, hook/page, mutation, permission, and responsive tests.

### Phase 5 - Delivery

- [ ] Complete DL-01 list/detail/history workspace.
- [ ] Complete DL-02 assignment, retry, shipping, delivered, and failed transitions.
- [ ] Add focused transition, validation, permission, and responsive tests.

### Phase 6 - Integration And Release Readiness

- [ ] Run the full automated verification matrix.
- [ ] Run authenticated browser QA for all target roles and state transitions.
- [ ] Verify desktop, tablet, and 390 px mobile layouts.
- [ ] Verify no accidental page-level horizontal scroll or unnecessary document scroll.
- [ ] Verify FE against the WMS-127 backend branch with seeded data.
- [ ] Update all statuses, remaining risks, evidence, and progress log in this document.

## 12. Testing And Verification Matrix

### Automated Coverage

- [ ] Schemas: required fields, numeric limits, cross-field sums, disposition-dependent slot,
      failure/rejection reason, and duplicate lines.
- [ ] Services: exact URL, query serialization, request payload, optional fields, and response types.
- [ ] Hooks/pages: loading, error, empty, no-results, success, pagination, filters, and detail fetch.
- [ ] Mutations: state/permission gating, pending state, error retention, success toast, logging, and
      cache invalidation.
- [ ] Routes/navigation: physical pages, typed routes, sidebar visibility, workspace navigation,
      active state, and direct unauthorized access.
- [ ] Responsive behavior: internal table/workspace scroll, dialog/sheet sizing, and mobile action
      reachability.

### Required Commands

- [ ] `pnpm prettier --check <changed-files>`
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm build`
- [ ] `git diff --check`

Any pre-existing warning must be named with its file and proven unrelated. New warnings or failures
introduced by WMS-180 are not acceptable.

### Browser QA Roles

- [ ] Tenant Owner: all tenant-wide permitted views/actions operate correctly.
- [ ] Warehouse Manager: assigned-warehouse workflows and approval actions match permissions.
- [ ] Warehouse Staff: operational actions match permissions; forbidden actions are absent and
      direct API/route denial is handled.
- [ ] System Admin: tenant operational routes do not accidentally expose tenant workflow access.

### Browser QA Viewports

- [ ] Desktop at 1440 x 900.
- [ ] Compact desktop/laptop at 1280 x 720.
- [ ] Tablet around 768 px width.
- [ ] Mobile at 390 px width.
- [ ] Light and dark mode for core list, form, detail, and dialog states.

## 13. Definition Of Done

- [ ] All eight target routes are reachable and render their required states.
- [ ] All 12 tracked use cases are marked `Done` with acceptance evidence.
- [ ] Customer supporting module is complete and integrated with Outbound creation.
- [ ] FE request/response contracts match the final WMS-127 DTOs and validators.
- [ ] No typed-route errors remain.
- [ ] Existing 309-test baseline and all new tests pass.
- [ ] Lint, typecheck, production build, Prettier, and `git diff --check` pass.
- [ ] Permission and transition controls match backend authorization and business rules.
- [ ] Desktop/mobile layouts have no overflow, clipped actions, or unnecessary page-level scroll.
- [ ] Authenticated FE-to-BE smoke tests pass for transfer, outbound, return, delivery, and customer
      flows.
- [ ] This document contains the final verification evidence and no unresolved release blocker.

## 14. Dependencies, Risks, And Blockers

| ID      | Type          | Description                                                           | Mitigation / exit condition                                                     | Status   |
| ------- | ------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- | -------- |
| DEP-01  | Dependency    | FE depends on uncommitted or changing WMS-127 backend contracts       | Freeze and inspect final DTOs/validators before each FE contract implementation | Open     |
| RISK-01 | Contract      | Existing FE scaffold request/response shapes are incomplete           | Replace from backend source; add service payload/query tests                    | Open     |
| RISK-02 | State         | Old transfer and delivery states/actions can produce invalid controls | Centralize exact state/action maps and test every transition                    | Open     |
| RISK-03 | Inventory     | Issue, receive, and return mutations affect inventory caches          | Document and test cache invalidation after each mutation                        | Open     |
| RISK-04 | Authorization | Sidebar visibility may be mistaken for security                       | Keep backend authoritative and test direct-route/403 states                     | Open     |
| RISK-05 | UX            | Large tables/forms can reintroduce horizontal/document scroll         | Use bounded layouts and verify four target viewports                            | Open     |
| RISK-06 | Scope         | Full Customer module expands supporting work                          | Complete it before OO-03 integration; no delete/archive scope                   | Accepted |

## 15. Verification Evidence

Fill this table after each full verification run. Do not replace failed results with assumptions.

| Date       | Branch / commit                                     | Command or QA scenario    | Result  | Notes                                                                       |
| ---------- | --------------------------------------------------- | ------------------------- | ------- | --------------------------------------------------------------------------- |
| 2026-08-30 | `feat/wms-180-frontend-warehouse-transfer-outbound` | Baseline review           | Partial | Only `/transfers` exists; contract and route scaffolds are incomplete       |
| 2026-08-30 | Current branch                                      | `pnpm typecheck` baseline | Failed  | Typed links reference missing `/orders`, `/returns`, and `/delivery` routes |
| 2026-08-30 | Current branch                                      | `pnpm test` baseline      | Failed  | 306/309 pass; three stale navigation/sidebar expectations                   |

## 16. Progress Log

- 2026-08-30: Reviewed FE `.rules`, `AGENTS.md`, coding/design/Git/AI workflow references, runtime
  styles, existing transfer/outbound/delivery scaffold, route/API/query/nav configuration, and
  applicable shadcn and React performance guidance.
- 2026-08-30: Reviewed WMS-180, WMS-127, the supplied UC/checklist context, and the completed
  backend controllers/contracts for Transfer, Outbound Order, Return, Delivery, and Customer.
- 2026-08-30: Confirmed the implementation direction: 12 use cases, full Customer module,
  Customer under `Danh mục`, compact outbound sidebar, and internal Orders/Returns/Delivery
  workspace navigation.
- 2026-08-30: Created this specification and initialized acceptance, phase, verification, risk, and
  progress trackers. No implementation item is marked complete from scaffold code alone.
