# Warehouse Operations Module Completion Audit

## 1. Document Control

| Field               | Value                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Audit date          | 2026-08-27                                                                                                                           |
| Frontend repository | `SSWMS-Frontend`                                                                                                                     |
| Backend repository  | `SSWMS-Backend`                                                                                                                      |
| Audited branch      | `dev`                                                                                                                                |
| FE revision         | `f712215` - WMS-179 Cycle Count & Adjustment merged                                                                                  |
| BE revision         | `dcdcf69` - WMS-119 Cycle Count & Adjustment V2 merged                                                                               |
| Purpose             | Track implementation, integration defects, remediation and final acceptance for the connected warehouse operation modules            |
| Decision rule       | A module is complete only when its FE workflow, BE contract, authorization, data integrity and end-to-end acceptance checks all pass |

## 2. Scope

This audit covers the following connected frontend epics and their backend support:

1. WMS-185 - `[Frontend] Product Catalog`.
2. WMS-186 - `[Frontend] Supplier Management`.
3. WMS-177 - `[Frontend] Purchase Order & Inbound`.
4. WMS-178 - `[Frontend] Inventory Control`.
5. WMS-179 - `[Frontend] Cycle Count & Adjustment`.

The review includes routes, UI workflows, API clients, endpoint contracts, permissions, tenant and warehouse scope, business transitions, stock writes, automated tests and build health.

## 3. End-to-End Integration Map

```text
Product Catalog -----------+
                            +--> Purchase Order --> Inbound Receipt --> Put-away
Supplier Management -------+                                        |
                                                                      v
                                                              Inventory Balance
                                                                      |
                                           +--------------------------+--------------------+
                                           |                                               |
                                           v                                               v
                                  Inventory Control                              Cycle Count
                                                                                       |
                                                                                       v
                                                                              Stock Adjustment
                                                                                       |
                                                                                       v
                                                                                Stock Ledger
```

Confirmed integrations:

1. Purchase Order creation validates active Product and Supplier records.
2. Purchase Order, receipt and put-away commands enforce tenant and warehouse access.
3. Approved receipt quantities update Purchase Order receiving progress.
4. Put-away writes `InventoryBalance`, `StockMovement` and slot occupancy in one transaction.
5. Cycle Count creation selects inventory balances by warehouse and optional zone.
6. Completed Cycle Count variances can create Stock Adjustments.
7. Stock Adjustment approval applies maker-checker rules and posts inventory through `IStockLedger`.
8. Blind-count responses hide system quantities from the assigned counter while counting is active.

## 4. Current Completion Summary

| Epic                             | Current status                   | Completion decision | Main blocker                                                                    |
| -------------------------------- | -------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| WMS-185 Product Catalog          | Incomplete                       | Keep In Progress    | Excel import and archive are placeholders; list/import integrity defects remain |
| WMS-186 Supplier Management      | Feature complete                 | Keep In Review      | Dedicated FE/BE workflow and authorization tests are missing                    |
| WMS-177 Purchase Order & Inbound | Jira findings fixed and verified | Ready for Review    | Historical PO dates may still need business-owner reconciliation                |
| WMS-178 Inventory Control        | Incomplete                       | Keep In Progress    | Warehouse scope and related-data projection are defective                       |
| WMS-179 Cycle Count & Adjustment | Implemented, integration blocked | Keep In Review      | Creation workflow depends on the defective Inventory read model                 |

Repository builds are green, but that does not complete a placeholder workflow or a response that omits required data.

## 5. Priority Findings

### P1 - PO-01: Purchase Order Expected Date Shifts During Save/Edit

Jira review on 2026-08-27 confirmed that `PurchaseOrderFormPage` converted a date-only input through local midnight before calling `toISOString()`. In UTC+7, `2026-08-27` became `2026-08-26T17:00:00.000Z`. Hydrating the form with `.slice(0, 10)` then moved the date back again on every save.

Remediation status:

- [x] Serialize date inputs as canonical UTC midnight without browser-timezone conversion.
- [x] Hydrate canonical and legacy local-midnight values in the warehouse operational timezone.
- [x] Add a regression test for three consecutive save/edit round trips.
- [x] Complete full FE automated validation.
- [x] Complete authenticated Browser QA, including repeated save/edit verification.
- [ ] Review previously edited Purchase Orders because repeated saves may have already changed their intended date.

### P2 - PO-02: Purchase Order Date Formatters Throw on Invalid Input

`formatOperationalDate` and `formatOperationalDateTime` passed invalid dates directly to `Intl.DateTimeFormat`, which throws `RangeError`. `null` could also be interpreted as the Unix epoch.

Remediation status:

- [x] Centralize guarded date parsing.
- [x] Return explicit fallback labels for absent and invalid values.
- [x] Use the explicit `Asia/Ho_Chi_Minh` operational timezone.
- [x] Add null, undefined and invalid-date regression tests.
- [x] Complete full FE automated validation.
- [x] Complete authenticated Browser QA for list, detail and form rendering.

### P1 - INV-01: Inventory Access Is Not Scoped to Assigned Warehouses

Affected backend handlers:

- `Application/Features/Inventory/GetInventory/GetInventoryQueryHandler.cs`
- `Application/Features/Inventory/GetStockMovements/GetStockMovementsQueryHandler.cs`
- `Application/Features/Inventory/GetReservations/GetReservationsQueryHandler.cs`
- `Application/Features/Inventory/GetABCClassification/GetABCClassificationQueryHandler.cs`
- `Application/Features/Inventory/ReserveStock/ReserveStockCommandHandler.cs`
- `Application/Features/Inventory/ReleaseReservation/ReleaseReservationCommandHandler.cs`
- `Application/Features/Inventory/ReportDamagedStock/ReportDamagedStockCommandHandler.cs`

The handlers restrict data by `TenantId` but do not use `IWarehouseAccessPolicy`. A Warehouse Manager or Warehouse Staff user with inventory permissions can query all warehouses in the tenant when `warehouseId` is omitted and can mutate another assigned user's warehouse when a valid identifier is known.

Required remediation:

- [ ] Inject `IWarehouseAccessPolicy` into every Inventory read and write handler.
- [ ] Intersect list queries with `GetAccessibleWarehouseIdsAsync()`.
- [ ] Call `EnsureAccessAsync()` for commands targeting a warehouse or inventory balance.
- [ ] Define and apply the correct `View` or `Manage` access level per operation.
- [ ] Add tests for Tenant Owner, assigned Manager/Staff, unassigned users and cross-warehouse identifiers.

Acceptance criteria:

- [ ] Omitting `warehouseId` returns only accessible warehouses.
- [ ] An assigned user cannot read, reserve, release or report damage in another warehouse.
- [ ] Tenant Owner behavior remains unchanged for warehouses in the current tenant.
- [ ] Cross-tenant identifiers return not found or forbidden without leaking data.

### P1 - INV-02: Inventory Read Models Lose Related Display Data

Affected backend handlers:

- `GetInventoryQueryHandler`
- `GetStockMovementsQueryHandler`
- `GetReservationsQueryHandler`
- `GetABCClassificationQueryHandler`

The handlers materialize entities through generic `GetPagedAsync()` or `ListAsync()` without includes or SQL DTO projection, then read navigation properties such as `Product`, `Warehouse`, `Slot` and `CreatedByUser`. Lazy loading is not enabled, so API responses can contain empty product, warehouse, slot and actor labels.

Integration impact:

- Inventory directories can display blank identifying information.
- Stock movement and reservation history can lose audit context.
- Cycle Count creation uses the Inventory response and can show blank product and slot labels.

Required remediation:

- [ ] Replace entity materialization with SQL-side DTO projection or an explicit read service.
- [ ] Preserve server-side filters, ordering, pagination and `totalCount`.
- [ ] Return SKU, product name, warehouse name, slot code and actor name reliably.
- [ ] Add relational tests; EF InMemory tests alone are not sufficient for projection behavior.
- [ ] Verify Cycle Count item selection using the repaired response.

### P1 - PROD-01: Product Import and Archive Are Placeholder Workflows

Frontend evidence:

- `src/features/product/pages/ProductListPage.tsx`: the selected Excel file is discarded and only an informational toast is shown.
- `src/features/product/pages/ProductDetailPage.tsx`: archive confirmation performs no mutation and only shows an informational toast.

Contract mismatch:

- FE accepts `.xlsx` and `.xls` files.
- BE `POST /api/products/import` accepts a JSON `items` collection.
- BE exposes no Product archive/deactivate endpoint.

Required remediation:

- [ ] Approve one import architecture: FE workbook parsing plus validated JSON, or BE multipart workbook parsing.
- [ ] Provide an import template and row-level validation results.
- [ ] Define duplicate-SKU behavior and return an import summary.
- [ ] Add Product deactivate/reactivate semantics or remove the unsupported archive control.
- [ ] Define business rules for products referenced by inventory and open operational documents.
- [ ] Add FE and BE tests for both workflows.

### P1 - PROD-02: Product Import Does Not Validate Tenant-Owned References

`ImportProductsCommandHandler` checks duplicate SKU only. It accepts `UnitId` and `CategoryId` without confirming that each record exists and belongs to the current tenant.

Required remediation:

- [ ] Load all referenced Unit and Category IDs in batches.
- [ ] Reject missing or cross-tenant references before inserting any Product.
- [ ] Define atomic or partial-success import behavior explicitly.
- [ ] Add tests for invalid IDs, cross-tenant IDs, duplicate rows and duplicate existing SKUs.

### P2 - PROD-03: Product List Can Lose Unit and Category Names

`GetProductsQueryHandler` uses generic paging without loading Unit and Category, while `ProductMappingConfig` reads both navigation properties after materialization.

Required remediation:

- [ ] Project Product list rows directly to `ProductResponse` in SQL.
- [ ] Keep paging, search and status filtering server-side.
- [ ] Add a relational regression test that asserts Unit and Category names.

### P2 - FE-AUTH-01: Route Guards Are Role-Based, Not Permission-Aware

`src/config/route-permissions.ts` grants the entire `/inventory` route tree by role. Direct navigation to Cycle Count creation can render the page for a user without `cycle-counts:create`; the backend eventually rejects the request, but the FE should provide a consistent unauthorized state earlier.

Required remediation:

- [ ] Add page-level permission guards for create and other privileged routes.
- [ ] Keep backend authorization as the security boundary.
- [ ] Test direct URL navigation with read-only permission sets.

### P2 - TEST-01: Supplier Acceptance Evidence Is Incomplete

Supplier list, detail, create, update, deactivate and reactivate workflows are implemented, but dedicated Supplier FE tests and BE workflow tests are absent.

Required remediation:

- [ ] Add FE tests for search, paging, form validation, lifecycle actions and permission states.
- [ ] Add BE tests for tenant isolation, lifecycle transitions and Purchase Order references.
- [ ] Smoke test Tenant Owner, Warehouse Manager and Warehouse Staff permission combinations.

## 6. Module Acceptance Matrices

### 6.1 WMS-185 - Product Catalog

| Use case | Function                          | Status                                         |
| -------- | --------------------------------- | ---------------------------------------------- |
| UC-PC-01 | Browse and Search Product Catalog | Partial - related names can be empty           |
| UC-PC-02 | View Product Details              | Complete                                       |
| UC-PC-03 | Create Product                    | Complete                                       |
| UC-PC-04 | Update Product Information        | Complete                                       |
| UC-PC-05 | Archive Product                   | Incomplete - placeholder                       |
| UC-PC-06 | Import Products from Excel        | Incomplete - placeholder and contract mismatch |
| UC-PC-07 | Configure Product Stock Policy    | Complete                                       |
| UC-PC-08 | Generate Product Barcode          | Complete                                       |

Module exit gate:

- [ ] Complete PROD-01, PROD-02 and PROD-03.
- [ ] Pass Product FE component tests and BE relational/workflow tests.
- [ ] Pass authenticated import, archive, barcode and stock-policy smoke tests.

### 6.2 WMS-186 - Supplier Management

| Use case  | Function                    | Status   |
| --------- | --------------------------- | -------- |
| UC-SM-01  | Browse and Search Suppliers | Complete |
| UC-SM-02  | View Supplier Details       | Complete |
| UC-SM-03  | Create Supplier             | Complete |
| UC-SM-04  | Update Supplier Information | Complete |
| UC-SM-05  | Deactivate Supplier         | Complete |
| Extension | Reactivate Supplier         | Complete |

Module exit gate:

- [ ] Complete TEST-01.
- [ ] Confirm an inactive Supplier cannot be used for a new Purchase Order submission.
- [ ] Confirm historical Purchase Orders retain their Supplier information.

### 6.3 WMS-177 - Purchase Order & Inbound

| Use case | Function                           | Status                                |
| -------- | ---------------------------------- | ------------------------------------- |
| UC-PO-01 | Browse and Search Purchase Orders  | Verified                              |
| UC-PO-02 | View Purchase Order Details        | Verified                              |
| UC-PO-03 | Create Purchase Order              | Verified                              |
| UC-PO-04 | Edit Draft Purchase Order          | Verified with repeated date save/edit |
| UC-PO-05 | Submit Purchase Order for Approval | Complete                              |
| UC-PO-06 | Approve or Reject Purchase Order   | Complete                              |
| UC-IB-01 | View Receiving Tasks               | Date formatter regression covered     |
| UC-IB-02 | Receive Goods                      | Complete                              |
| UC-IB-03 | Submit Goods Receipt for Approval  | Complete                              |
| UC-IB-04 | Approve or Reject Goods Receipt    | Complete                              |
| UC-IB-05 | View Pending Put-away Tasks        | Complete                              |
| UC-IB-06 | Put Away Stock                     | Complete                              |

Module exit gate:

- [x] Active Product and Supplier validation is implemented.
- [x] Warehouse scope and maker-checker rules are implemented.
- [x] Cumulative and partial receiving are implemented.
- [x] Put-away updates Inventory, movement history and slot occupancy transactionally.
- [x] Dedicated Purchase/Inbound workflow and reader tests pass.
- [x] PO expected-date and invalid-date focused regression tests pass.
- [ ] Full FE test, lint and production build pass after the date fix.
- [ ] Authenticated create, edit, repeated-save, list, detail and receiving-task QA pass.

### 6.4 WMS-178 - Inventory Control

| Use case | Function                    | Status                                                        |
| -------- | --------------------------- | ------------------------------------------------------------- |
| UC-IV-01 | View and Search Inventory   | Partial - scope and enrichment defects                        |
| UC-IV-02 | View Stock Movement History | Partial - scope and enrichment defects                        |
| UC-IV-03 | View Reservations           | Partial - scope and enrichment defects                        |
| UC-IV-04 | Reserve Stock               | Partial - warehouse authorization defect                      |
| UC-IV-05 | Release Reservation         | Partial - warehouse authorization defect                      |
| UC-IV-06 | Report Damaged Stock        | Partial - warehouse authorization defect                      |
| UC-IV-07 | Generate ABC Classification | Partial - scope, enrichment and formula confirmation required |

Module exit gate:

- [ ] Complete INV-01 and INV-02.
- [ ] Confirm the ABC classification formula against the approved Business Rules.
- [ ] Add authenticated cross-warehouse authorization tests.
- [ ] Verify inventory created through real inbound put-away.

### 6.5 WMS-179 - Cycle Count & Adjustment

| Use case                                 | Function                                     | Status |
| ---------------------------------------- | -------------------------------------------- | ------ |
| Cycle Count directory and filters        | Implemented                                  |
| Create Cycle Count                       | Implemented; blocked by Inventory enrichment |
| Record blind and standard counts         | Implemented                                  |
| Submit count                             | Implemented                                  |
| Request recount                          | Implemented                                  |
| Finalize count                           | Implemented                                  |
| Create Stock Adjustment from variance    | Implemented                                  |
| Approve or reject Stock Adjustment       | Implemented                                  |
| Post approved adjustment to stock ledger | Implemented                                  |

Module exit gate:

- [ ] Complete INV-01 and INV-02 first.
- [ ] Verify assigned staff can see and record only the correct warehouse count.
- [ ] Verify blind count never exposes system quantity to the assigned counter.
- [ ] Verify recount and finalize permissions.
- [ ] Verify maker cannot approve their own Stock Adjustment.
- [ ] Verify approval updates balance and movement history exactly once.
- [ ] Pass desktop and mobile authenticated smoke tests.

## 7. Validation Snapshot

Validation executed on 2026-08-27 after the latest Cycle Count & Adjustment merges:

| Repository | Command                                               | Result                                                                   |
| ---------- | ----------------------------------------------------- | ------------------------------------------------------------------------ |
| FE         | `pnpm test`                                           | 81 test files passed; 293 tests passed                                   |
| FE         | `pnpm lint`                                           | Passed with no reported warnings                                         |
| FE         | `pnpm build`                                          | Passed; TypeScript validation passed and 40 application routes generated |
| BE         | `dotnet test SSWMS-API.slnx --no-restore`             | 76 tests passed                                                          |
| BE         | `dotnet build SSWMS-API.slnx -c Release --no-restore` | Passed with 0 warnings and 0 errors                                      |
| FE and BE  | `git diff --check`                                    | Passed                                                                   |

Current automated checks confirm repository health. They do not cover the missing Product workflows, Inventory cross-warehouse access, related-data projection or Supplier acceptance scenarios documented above.

## 8. Recommended Remediation Order

### Phase 1 - Security and Read-model Integrity

- [ ] Fix INV-01 warehouse authorization.
- [ ] Fix INV-02 relational DTO projections.
- [ ] Add cross-warehouse and relational regression tests.
- [ ] Re-run Inventory and Cycle Count focused tests.

### Phase 2 - Product Completion

- [ ] Fix PROD-03 Product list projection.
- [ ] Implement and validate Product import.
- [ ] Implement Product deactivate/reactivate behavior.
- [ ] Add Product workflow tests.

### Phase 3 - Acceptance Coverage

- [ ] Add Supplier workflow tests.
- [ ] Add permission-aware FE route handling.
- [ ] Run the complete authenticated E2E chain:
      `Product + Supplier -> PO -> Receipt -> Put-away -> Inventory -> Cycle Count -> Adjustment`.
- [ ] Test Tenant Owner, assigned Manager, assigned Staff and unassigned users.
- [ ] Re-run all FE and BE validation commands.

### Phase 4 - Jira Closure

- [ ] Match every child issue against its acceptance criteria.
- [ ] Attach test and smoke evidence.
- [ ] Move only passing issues to Done.
- [ ] Close WMS-177, WMS-185, WMS-186, WMS-178 and WMS-179 after their module exit gates pass.

## 9. Final Audit Decision

- WMS-177 Purchase Order & Inbound has passed automated validation and authenticated Browser QA for the Jira date findings; it is ready for review, with historical date reconciliation tracked separately.
- WMS-186 Supplier Management is feature complete but needs formal acceptance coverage.
- WMS-179 Cycle Count & Adjustment is implemented but remains integration-blocked by Inventory defects.
- WMS-185 Product Catalog and WMS-178 Inventory Control are not complete.
- The combined warehouse operation flow is not ready for final acceptance until all P1 findings are resolved and the authenticated end-to-end chain passes.

## 10. Work Log

| Date       | Change                                                                    | Result                                                              |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 2026-08-27 | Initial audit for Product, Supplier, Purchase/Inbound and Inventory       | Product and Inventory gaps identified                               |
| 2026-08-27 | Pulled latest FE/BE `dev` after Cycle Count & Adjustment merge            | FE `f712215`; BE `dcdcf69`                                          |
| 2026-08-27 | Extended audit to WMS-179 and reviewed cross-module integration           | Cycle workflow implemented; Inventory dependency blocker confirmed  |
| 2026-08-27 | Re-ran FE/BE validation                                                   | FE 289 tests; BE 76 tests; lint and builds passed                   |
| 2026-08-28 | Read WMS-177 Jira review and reproduced both date defects                 | Epic correctly remains In Progress                                  |
| 2026-08-28 | Implemented timezone-stable expected-date handling and guarded formatters | Focused regression tests passed; full validation pending            |
| 2026-08-28 | Ran full FE validation and authenticated Purchase Order API smoke         | 293 tests, lint and build passed; Tenant Owner login/list succeeded |
| 2026-08-28 | Restored Browser QA and ran authenticated Purchase Order UI smoke         | List/detail/form loaded without console errors                      |
| 2026-08-28 | Saved and reopened the same draft PO repeatedly with `2026-08-31`         | Date remained `2026-08-31`; no timezone drift                       |
| 2026-08-28 | Re-ran FE validation after Browser QA                                     | 293 tests, lint, build, Prettier and diff check passed              |
