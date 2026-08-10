# WMS-85 to WMS-89 - Warehouse Structure Workspace Design Spec

## Document Control

| Item                    | Value                                                                  |
| ----------------------- | ---------------------------------------------------------------------- |
| Scope                   | Frontend implementation for WMS-85, WMS-86, WMS-87, WMS-88, and WMS-89 |
| Branch                  | `feat/wms-85-89-warehouse-structure`                                   |
| Base branch             | `dev` at `62cd000c367fab79bb47b9ed8fa6e5aedf726e10`                    |
| Related backend tasks   | WMS-71 through WMS-75                                                  |
| Related use cases       | UC-WS-05 through UC-WS-09                                              |
| Previous frontend scope | WMS-44 Warehouse Management UI                                         |
| Status                  | Design approved; implementation not started                            |
| Last updated            | 2026-08-10                                                             |

## 1. Objective

Complete the warehouse structure workflows that were intentionally excluded from WMS-44:

- Deactivate a warehouse.
- Browse the warehouse layout as an operational explorer.
- Search and filter storage locations.
- Create zones, racks, and slots.
- Preview and print a scannable barcode for one slot.

The result must remain a compact B2B warehouse workspace, work well on desktop and mobile web, and establish an interaction model that can be carried into a later native or cross-platform mobile application.

## 2. Confirmed Product Decisions

1. Reuse the existing warehouse feature and routes instead of creating a separate feature area.
2. Use a responsive warehouse workspace:
   - Desktop presents route-backed sections as tabs in one workspace.
   - Mobile presents the same information as a drill-down flow.
3. Keep meaningful state in the URL where it improves refresh, sharing, and Back-button behavior.
4. Use role-based UI visibility because the current authentication profile exposes `role`, not a permission list.
5. Treat backend authorization as the final authority. A visible action can still receive `403` when an administrator has not assigned the required permission.
6. Tenant Owner is included in all warehouse structure workflows because the owner controls the tenant.
7. Warehouse Manager can view/search/configure layout and create barcode labels.
8. Warehouse Staff can view/search locations and create barcode labels, but cannot configure or deactivate.
9. Do not add update/delete controls for zones, racks, or slots because the backend currently exposes create operations only.
10. Do not implement batch barcode export or PDF generation because the backend currently returns one barcode value at a time.

## 3. Scope by Jira Task

| FE task | UC       | Deliverable                                           | Main backend dependency |
| ------- | -------- | ----------------------------------------------------- | ----------------------- |
| WMS-85  | UC-WS-05 | Warehouse deactivation confirmation and result states | WMS-71                  |
| WMS-86  | UC-WS-06 | Complete responsive warehouse layout explorer         | WMS-72                  |
| WMS-87  | UC-WS-07 | Search, filter, and paginate warehouse locations      | WMS-73                  |
| WMS-88  | UC-WS-08 | Create zone, rack, and slot from the layout explorer  | WMS-74                  |
| WMS-89  | UC-WS-09 | Preview and print a single slot barcode label         | WMS-75                  |

## 4. Explicit Non-Goals

- Backend, database, migration, or seed-data changes.
- Enforcing warehouse assignment scope in the frontend.
- Editing, deactivating, deleting, moving, or reordering zones, racks, or slots.
- Drag-and-drop warehouse layout design.
- A graphical floor-plan or coordinate-based layout editor.
- Inventory movement, stock adjustment, or occupancy mutation.
- Camera scanning.
- Batch barcode generation, PDF export, or printer integration.
- Adding permissions to the authenticated user response.
- Building the future native/cross-platform mobile application in this branch.

## 5. Access and Capability Matrix

The table controls frontend visibility. Every API request still depends on the permission assigned to the user's role in the backend RBAC screen.

| Capability                 | Tenant Owner | Warehouse Manager | Warehouse Staff | Backend permission            |
| -------------------------- | :----------: | :---------------: | :-------------: | ----------------------------- |
| Browse warehouses          |     Yes      |        Yes        |       Yes       | `warehouses:view`             |
| View details and layout    |     Yes      |        Yes        |       Yes       | `warehouses:view`             |
| Search locations           |     Yes      |        Yes        |       Yes       | `warehouses:view`             |
| Preview/print slot barcode |     Yes      |        Yes        |       Yes       | `warehouses:view`             |
| Create zone/rack/slot      |     Yes      |        Yes        |       No        | `warehouses:configure-layout` |
| Create warehouse           |     Yes      |        No         |       No        | `warehouses:create`           |
| Edit warehouse             |     Yes      |        No         |       No        | `warehouses:update`           |
| Deactivate warehouse       |     Yes      |        No         |       No        | `warehouses:deactivate`       |

### Authorization behavior

- Update `src/config/route-permissions.ts` so all three warehouse roles can open warehouse routes.
- Add the warehouse navigation item for Warehouse Manager and Warehouse Staff.
- Preserve owner-only visibility for create, edit, and deactivate actions.
- Preserve owner/manager visibility for configure-layout actions.
- Preserve view/search/barcode actions for all three warehouse roles.
- A `403` from a section query renders an inline permission state for that section.
- A `403` from a mutation keeps the dialog open, logs the error, and shows a Vietnamese error message.
- Do not infer successful authorization from a role name alone.

## 6. Backend Contract Audit

### WMS-85 - Deactivate warehouse

| Item             | Contract                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Endpoint         | `PATCH /api/warehouses/{warehouseId}/deactivate`                             |
| Request body     | None                                                                         |
| Response         | `ApiResponse<Unit>`                                                          |
| Permission       | `warehouses:deactivate`                                                      |
| Current behavior | Sets an active warehouse to `Inactive`; returns an error if already inactive |

Known backend gap: UC-WS-05 requires stock to be zero, no active transfers, and no open issue orders. The current handler does not enforce these BR-13 checks. The frontend must not claim that these checks passed and must not attempt to reproduce them from incomplete client data.

### WMS-86 - View layout

| Item             | Contract                                   |
| ---------------- | ------------------------------------------ |
| Endpoint         | `GET /api/warehouses/{warehouseId}/layout` |
| Response         | `ApiResponse<ZoneResponse[]>`              |
| Permission       | `warehouses:view`                          |
| Query parameters | None                                       |
| Hierarchy        | Zone -> Rack -> Slot                       |

The existing response already contains zone, rack, and slot status, codes, names, capacity, occupancy, and `barcodeValue`.

### WMS-87 - Search locations

| Item       | Contract                                       |
| ---------- | ---------------------------------------------- |
| Endpoint   | `GET /api/warehouses/{warehouseId}/locations`  |
| Response   | `ApiResponse<QueryResult<SlotSearchResponse>>` |
| Permission | `warehouses:view`                              |
| Paging     | `top`, `skip`, `needTotalCount`                |
| Search     | `searchText`, matched against `slotCode`       |
| Filters    | `zoneId`, `rackId`, `slotStatus`               |

`SlotSearchResponse` fields:

```ts
interface SlotSearchResponse {
  id: string
  slotCode: string
  status: 'Vacant' | 'Occupied' | 'Reserved' | 'Full'
  capacity: number
  currentOccupancy: number
  barcodeValue: string | null
  rackId: string
}
```

The response does not include zone, rack code, or rack name. The frontend derives those labels from the layout response by `rackId`. If layout metadata is unavailable, the row remains usable and displays the raw slot data without inventing a rack label.

### WMS-88 - Configure layout

| Entity | Endpoint                                                  | Body fields                           | Validation                                                       | Permission                    |
| ------ | --------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------- | ----------------------------- |
| Zone   | `POST /api/warehouses/{warehouseId}/zones`                | `zoneCode`, `zoneName`, `description` | Code required/max 50; name required/max 255; description max 500 | `warehouses:configure-layout` |
| Rack   | `POST /api/warehouses/{warehouseId}/zones/{zoneId}/racks` | `rackCode`, `rackName`                | Code required/max 50; name required/max 255                      | `warehouses:configure-layout` |
| Slot   | `POST /api/warehouses/{warehouseId}/racks/{rackId}/slots` | `slotCode`, `capacity`                | Code required/max 50; capacity greater than 0                    | `warehouses:configure-layout` |

Route IDs are the source of truth. Frontend request types contain form fields only; the service receives parent IDs separately and builds the endpoint.

The backend creates slots with:

- `currentOccupancy = 0`
- `status = Vacant`
- `barcodeValue = slotCode`

### WMS-89 - Slot barcode

| Item       | Contract                                                       |
| ---------- | -------------------------------------------------------------- |
| Endpoint   | `GET /api/warehouses/{warehouseId}/locations/{slotId}/barcode` |
| Response   | `ApiResponse<BarcodeResponse>`                                 |
| Permission | `warehouses:view`                                              |

```ts
interface BarcodeResponse {
  slotId: string
  slotCode: string
  barcodeValue: string
}
```

The backend returns barcode metadata, not an image or file. The frontend must render a Code 128 barcode with a proven library. The existing `qrcode.react` dependency is not a substitute because QR and linear barcodes are different formats. Before implementation, verify the official API and React 19 compatibility of the selected barcode library; prefer a small SVG-capable Code 128 package such as `jsbarcode` and do not hand-roll barcode encoding.

## 7. Backend Risks and Coordination Notes

### BR-13 deactivation gap

- Current severity: high for UC acceptance, but it does not block building the FE confirmation flow.
- FE behavior: submit only after explicit confirmation and render backend validation errors when they exist.
- Required BE follow-up: enforce stock, transfer, and open-order preconditions before deactivation.

### Assignment-scope gap

Warehouse list, detail, layout, locations, and barcode handlers currently filter by `TenantId`. They do not verify that a Warehouse Manager or Warehouse Staff member is assigned to the requested warehouse.

- Current severity: high for production authorization if those roles receive `warehouses:view`.
- FE must not claim that the data is assignment-scoped.
- Route hiding is not a security boundary.
- Required BE follow-up: add warehouse-user assignment checks or return only assigned warehouses for Manager/Staff.

### Permission-awareness limitation

The current auth profile and Zustand user expose a role but no permission keys.

- FE visibility is actor-based according to this spec.
- API `403` remains possible after an admin changes permissions.
- Permission-aware button hiding requires a future backend/auth-contract change and is out of scope.

## 8. Information Architecture and Routes

```text
/warehouses
  Warehouse list

/warehouses/[warehouseId]
  Overview

/warehouses/[warehouseId]/layout
  Zone, rack, and slot explorer

/warehouses/[warehouseId]/locations
  Searchable location directory

/warehouses/[warehouseId]/locations/[slotId]/barcode
  Single barcode preview and print surface
```

### Desktop behavior

- The warehouse header remains stable across child routes.
- `Thông tin`, `Bố cục`, and `Vị trí` are navigation tabs implemented with `Link`, not local-only tab state.
- Refreshing or sharing a URL restores the correct workspace section.
- Layout uses a three-pane master-detail explorer when space allows.

### Tablet behavior

- Layout uses two panes: the current level list and the selected detail/next level.
- Pane widths remain stable; dynamic counts and badges cannot resize the layout.
- Forms may use a responsive `Dialog` or `Drawer` according to existing project primitives.

### Mobile behavior

- Each workspace route remains a full screen under the application shell.
- Layout becomes a single-pane drill-down: zones -> racks -> slots.
- Optional `zoneId` and `rackId` search parameters preserve the selected level and support browser Back.
- Search and filters stay compact; filters open in a `Sheet`.
- Create forms use a full-height mobile sheet/drawer when a centered dialog would constrain the form.
- Barcode preview is a dedicated route, not a nested modal.

## 9. Frontend Architecture

Keep Next.js route files as thin default-export wrappers. Business orchestration remains under `src/features/warehouse`.

Planned route files:

```text
src/app/(private)/warehouses/[warehouseId]/layout.tsx
src/app/(private)/warehouses/[warehouseId]/page.tsx
src/app/(private)/warehouses/[warehouseId]/layout/page.tsx
src/app/(private)/warehouses/[warehouseId]/locations/page.tsx
src/app/(private)/warehouses/[warehouseId]/locations/[slotId]/barcode/page.tsx
```

Planned feature composition:

```text
src/features/warehouse/
  pages/
    WarehousePage.tsx
    WarehouseOverviewPage.tsx
    WarehouseLayoutPage.tsx
    WarehouseLocationsPage.tsx
    WarehouseBarcodePage.tsx
  components/
    WarehouseWorkspace/
    WarehouseLayoutPage/
    WarehouseLocationsPage/
    WarehouseBarcodePage/
    WarehousePage/
  hooks/
    use-warehouse.ts
  schemas/
    warehouse.schema.ts
    warehouse-layout.schema.ts
  services/
    warehouse.service.ts
  types/
    warehouse.types.ts
  utils/
    warehouse-capabilities.ts
    warehouse-layout.ts
    warehouse-location-query.ts
```

The exact number of new files may be reduced when an existing file remains focused. Do not create a helper or component only to match this tree.

### Responsibility boundaries

- Page components own queries, mutations, route/search-param state, dialogs, navigation, and toasts.
- Visual components receive typed data and callbacks.
- Services contain typed Axios calls and return unwrapped API envelopes.
- React Query owns all server state.
- Zod owns form validation.
- Pure utilities derive capability flags, query parameters, status labels, and rack/zone lookup maps.
- The auth store remains unchanged; server data and permission data are not added to Zustand.

## 10. Query Keys and Cache Policy

Extend `queryKeys.warehouses` with explicit keys:

```ts
warehouses: {
  all,
  list(params),
  detail(warehouseId),
  layout(warehouseId),
  locations(warehouseId, params),
  barcode(warehouseId, slotId),
}
```

Cache behavior:

- Layout is lazy-loaded only on layout, locations, or barcode routes that need it.
- Location pagination uses previous data as placeholder data to avoid layout jumps.
- Create zone invalidates warehouse detail and layout.
- Create rack invalidates layout.
- Create slot invalidates layout and all location queries for that warehouse.
- Deactivate invalidates warehouse list, detail, layout, and location queries for the warehouse.
- Barcode query is keyed by both warehouse and slot IDs.
- Do not optimistically insert server-created entities because IDs and validation come from the backend.

## 11. UI and Interaction Design

### Shared warehouse workspace

- Keep a compact header with back navigation, warehouse name, mono warehouse code, and status.
- Use route-backed tabs below the header.
- Put primary action for the active section at the right side of the section toolbar.
- Put destructive deactivation in an overflow/action menu or clearly separated destructive area, never beside the primary create action.
- Inactive warehouses remain readable but all create/edit/configure actions are disabled or absent.
- Use borders and tonal surfaces instead of heavy shadows.
- Avoid cards inside cards; the explorer and directories are single bordered work surfaces.

### WMS-85 - Deactivate warehouse

Entry point:

- Tenant Owner only.
- Available from the overview action menu.
- Hidden when the warehouse is already inactive.

Confirmation:

- Use shadcn `AlertDialog` with an accessible title and description.
- Show warehouse name and code so the target is unmistakable.
- Explain that the warehouse will no longer accept configuration changes.
- Do not state that stock/transfers/orders were validated because the backend does not currently validate BR-13.
- Require one explicit destructive confirmation click; no typed-name confirmation is needed.
- Disable both dismissal and duplicate submission while pending.

Success:

- Close the dialog.
- Show a success toast.
- Refresh list and detail caches.
- Keep the user on overview with `Inactive` status visible.
- Remove or disable edit/configure actions.

Failure:

- Keep the dialog open.
- Display backend `400`, `403`, `404`, or future `409` messages in context.
- Log unexpected errors and show a generic Vietnamese fallback.

### WMS-86 - Layout explorer

Use one adaptive explorer, not separate unrelated desktop/mobile components.

Desktop three-pane model:

1. Zone pane: zone name, code, status, rack count, and add-zone action.
2. Rack pane: racks for the selected zone, status, slot count, and add-rack action.
3. Slot pane: slots for the selected rack, occupancy, capacity, status, barcode action, and add-slot action.

Mobile drill-down model:

1. Zone list.
2. Selected zone header and rack list.
3. Selected rack header and slot list.
4. Back/breadcrumb controls update URL selection state.

Visual details:

- Use `Item`, `ScrollArea`, `Button`, `Badge`, `Breadcrumb`, `Empty`, `Skeleton`, `Tooltip`, and `Separator` where appropriate.
- Codes use the mono font token.
- Selected rows use a subtle semantic accent and a visible focus ring.
- Status is never communicated by color alone.
- Counts use stable tabular numerals.
- Empty zone, empty rack, and empty warehouse states have distinct copy and the correct contextual create action.
- Do not draw a fake physical floor map because the API provides hierarchy, not coordinates.

### WMS-87 - Location directory

Toolbar:

- Search input with visible label for assistive technology and placeholder `Tìm theo mã vị trí`.
- Search is debounced and resets to page 1.
- One `Bộ lọc` button opens a sheet containing zone, rack, and status filters.
- Show the number of active filters in the button label/badge.
- Keep refresh as an icon button with tooltip and `aria-label`.

Filter behavior:

- Selecting a zone clears a rack that does not belong to that zone.
- Rack options are derived from the selected zone and layout response.
- Status options use exact backend values: `Vacant`, `Occupied`, `Reserved`, and `Full`.
- `Đặt lại` clears all filters and returns to page 1.
- Query parameters omit empty optional values.

Results:

- Desktop uses a semantic table.
- Mobile uses a vertical item list to prevent page-level horizontal scrolling.
- Display slot code, zone/rack context when resolvable, localized status, occupancy/capacity, and barcode action.
- Numeric capacity and occupancy are right-aligned on desktop.
- Guard percentage calculations when capacity is zero, even though new slots require positive capacity.
- Loading, error, no-layout, no-results, and success states are visually distinct.
- Pagination uses `top`, `skip`, and `needTotalCount: true` without client-side slicing.

### WMS-88 - Configure layout

Contextual actions:

- `Thêm khu vực` in the zone pane header.
- `Thêm kệ` in the selected zone pane/header.
- `Thêm vị trí` in the selected rack pane/header.
- Actions are visible to Tenant Owner and Warehouse Manager only.
- Actions are unavailable for inactive parent entities or an inactive warehouse.

Forms:

| Form | Fields                                              |
| ---- | --------------------------------------------------- |
| Zone | Zone code, zone name, optional description          |
| Rack | Rack code, rack name; selected zone shown read-only |
| Slot | Slot code, capacity; selected rack shown read-only  |

Implementation rules:

- React Hook Form + Zod.
- Trim string fields.
- Use exact backend maximum lengths.
- Capacity uses a decimal-friendly input with `inputMode="decimal"` and must be greater than zero.
- Field errors appear next to the field.
- Duplicate-code conflict errors map to the corresponding code field when possible.
- Submit is disabled while pending.
- On success, close/reset the form, invalidate the correct queries, select the created parent context when useful, and show a success toast.
- Do not offer bulk creation, auto-numbering, update, delete, or drag-and-drop in this scope.

### WMS-89 - Barcode preview and print

Entry points:

- Barcode icon action on a location row/item.
- Barcode action on a slot in the layout explorer.
- Use `Link` to the dedicated barcode route.

Preview route:

- Fetch barcode data by warehouse and slot ID rather than trusting navigation state.
- Show warehouse context, slot code, human-readable barcode value, and a scannable Code 128 SVG.
- Keep the barcode high contrast with sufficient quiet zone around it.
- Do not crop or scale the bars non-uniformly.
- Show loading, permission, not-found, and retry states.

Print behavior:

- One primary `In nhãn` command calls the browser print workflow.
- Print styles hide application navigation and non-label controls.
- The printable region contains only warehouse/slot identification and the barcode.
- Use a stable label aspect ratio, but leave physical paper selection to browser/printer settings.
- Do not claim PDF or batch support.

## 12. Visual System and Skill Usage

The implementation must follow this priority:

1. `AGENTS.md`
2. `.rules`
3. `docs/CODING_GUIDELINES.md`
4. `docs/DESIGN_SYSTEM.md`
5. `docs/AI_WORKFLOW.md`
6. Existing warehouse patterns and `src/components/ui`

Required skills and when to use them:

| Skill                                        | Required stage                                                  | Expected effect                                                           |
| -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `superpowers:brainstorming`                  | Completed before this spec                                      | Confirms actors, responsive model, scope, and trade-offs                  |
| `superpowers:writing-plans`                  | After this spec is reviewed                                     | Produces an executable, file-by-file implementation plan                  |
| `superpowers:executing-plans`                | At implementation start                                         | Executes the approved plan with checkpoints                               |
| `superpowers:test-driven-development`        | Before each behavior change                                     | Adds failing tests before production code and verifies red/green          |
| `shadcn`                                     | Before composing or adding UI primitives                        | Reuses project primitives and checks official component usage             |
| `vercel-react-best-practices`                | While writing/refactoring React                                 | Keeps route composition, rendering, state, and bundles efficient          |
| `vercel-composition-patterns`                | Only if workspace components develop boolean-prop proliferation | Keeps shared component APIs explicit and scalable                         |
| `web-design-guidelines`                      | Before UI completion                                            | Audits accessibility, responsive behavior, forms, focus, and interaction  |
| `browser:control-in-app-browser`             | Manual QA                                                       | Verifies actual desktop/mobile rendering and interaction in the local app |
| `superpowers:verification-before-completion` | Before completion, commit, or push claims                       | Requires fresh lint, test, build, diff, and browser evidence              |
| `superpowers:requesting-code-review`         | After implementation and verification                           | Performs a focused regression and requirement review                      |
| `superpowers:finishing-a-development-branch` | After all checks pass                                           | Prepares the branch for PR/merge without rewriting shared history         |

`design-taste-frontend` is not the primary design skill for this work because `docs/AI_WORKFLOW.md` reserves it mainly for public/auth screens. This warehouse UI is an operational product surface, so the Fresh Logistics design system and web interface audit take precedence.

### Visual quality checklist

- Use semantic tokens from `src/app/index.css`; no hard-coded palette colors.
- Keep radius between 4px and 8px unless an existing primitive specifies otherwise.
- Use border-led hierarchy and quiet tonal backgrounds; avoid heavy shadows and decorative gradients.
- Keep controls dense and scannable without making touch targets inaccessible.
- Use Lucide icons inside icon actions and provide tooltips/`aria-label`.
- Use full-width commands on narrow mobile screens.
- Avoid nested cards and page sections styled as floating cards.
- Keep all fixed-format panes, toolbars, icon buttons, and counters dimensionally stable.
- Ensure text wraps or truncates intentionally and never overlaps adjacent content.
- Support light and dark themes.
- Do not introduce marketing copy, oversized headings, or decorative hero composition.

## 13. Error and State Model

Every query section handles:

- Initial loading.
- Background refresh.
- Permission denied.
- Not found.
- Network/server error with retry.
- Empty data.
- Successful data.

Every mutation handles:

- Idle.
- Pending with duplicate-submission prevention.
- Field validation error.
- Backend conflict.
- Permission denied.
- Not found/stale parent.
- Unexpected failure.
- Success with cache synchronization.

Error handling follows project rules: `console.error(error)` for unexpected errors and Sonner toast plus contextual form/section feedback. Services do not catch errors.

## 14. Testing Strategy

### Pure unit tests

- Capability derivation for Owner, Manager, Staff, and unsupported roles.
- Location query construction, trimming, paging, and empty-filter omission.
- Zone/rack lookup derivation from layout.
- Status localization and occupancy formatting.
- Zod schemas for zone, rack, and slot forms.
- API error-to-field mapping for duplicate codes.

### Component tests

- Workspace navigation links preserve warehouse ID and active state.
- Deactivate confirmation submits once, disables while pending, and handles errors.
- Layout explorer renders empty, loading, error, selected zone/rack, and mobile drill-down states.
- Create forms submit exact payload fields and selected parent IDs.
- Location filters clear incompatible rack selections and reset pagination.
- Desktop table and mobile items expose the same essential information.
- Barcode actions link to the correct route.
- Barcode page renders returned value and exposes an accessible print command.
- Restricted roles do not see mutation actions.

### Integration-oriented tests

- Query keys include warehouse IDs and query params.
- Create mutations invalidate only the required warehouse scopes.
- Deactivation invalidates list/detail/layout/location data.
- `403` query errors render contextual permission states without crashing the whole workspace.
- Route permission tests cover Owner, Manager, Staff, and System Admin.
- Navigation tests verify the warehouse item appears for the three warehouse roles only.

### Manual browser QA

Use the supplied development accounts and assign required permissions in the admin RBAC screen before each role check.

Viewports:

- Desktop: 1366x768 and 1280x800.
- Tablet: 768x1024.
- Mobile: 390x844 and 360x800.

Required flows:

1. Owner browses a warehouse, opens every workspace route, creates zone/rack/slot, prints a barcode, and deactivates a test warehouse.
2. Manager views/searches/configures and prints but cannot see owner-only warehouse actions.
3. Staff views/searches/prints but cannot see create/edit/configure/deactivate actions.
4. System Admin is rejected from tenant warehouse routes.
5. Remove a required permission in admin and confirm the affected API state shows a clear `403` result.
6. Refresh and browser Back preserve the active workspace route and mobile drill-down context.
7. Verify light/dark mode, keyboard navigation, focus visibility, screen-reader labels, and reduced-motion behavior.
8. Confirm no page-level horizontal overflow, clipped sheets/dialogs, overlapping labels, or inaccessible controls.

## 15. Implementation Order

1. Shared contracts, endpoint builders, query keys, capability helper, route permissions, and navigation.
2. Route-backed warehouse workspace shell and overview migration without behavior regression.
3. WMS-86 adaptive layout explorer.
4. WMS-88 create zone/rack/slot mutations and forms.
5. WMS-87 location query, filters, pagination, desktop table, and mobile items.
6. WMS-89 barcode route, Code 128 rendering, and print behavior.
7. WMS-85 deactivation confirmation and inactive-state restrictions.
8. Cross-role, responsive, accessibility, dark-mode, and regression QA.

This order establishes shared navigation and data contracts before mutation workflows. Barcode follows locations because both entry points and types are already available. Deactivation is integrated last so inactive-state restrictions can be verified against all completed workspace actions.

## 16. Definition of Done

- All five FE Jira tasks satisfy their stated frontend acceptance criteria against the current backend contract.
- No UI claims unsupported backend behavior.
- Owner, Manager, and Staff can enter the warehouse workspace according to the confirmed actor model.
- Mutation actions are role-appropriate and backend permission failures are handled.
- Desktop route-backed tabs and mobile drill-down work without losing state unexpectedly.
- All forms use React Hook Form + Zod and exact backend limits.
- All API calls use endpoint constants, typed services, and React Query.
- Existing WMS-44 create/detail/edit behavior remains covered and functional.
- No new custom primitive duplicates an existing shadcn component.
- UI uses semantic Fresh Logistics tokens and passes responsive/accessibility review.
- `pnpm lint`, `pnpm test`, `pnpm build`, and `git diff --check` pass.
- Browser QA is completed for the required roles, viewports, and themes.
- Known BE gaps are reported rather than hidden by frontend workarounds.

## 17. Progress Tracker

Legend: `[ ]` not started, `[~]` in progress, `[x]` completed, `[!]` blocked or requires coordination.

### Discovery and design

- [x] Pull latest frontend `dev`.
- [x] Create `feat/wms-85-89-warehouse-structure` from `origin/dev`.
- [x] Read repository rules and referenced workflow/design documents.
- [x] Audit existing WMS-44 frontend architecture.
- [x] Audit backend WMS-71 through WMS-75 endpoints and DTOs.
- [x] Confirm shared routes and role-based actor model.
- [x] Approve route-backed desktop workspace and mobile drill-down design.
- [x] Write this design spec.
- [ ] User review of written spec.
- [ ] Produce file-by-file implementation plan with `superpowers:writing-plans`.

### Shared foundation

- [ ] Add endpoint builders and DTOs.
- [ ] Add query keys and React Query hooks/mutations.
- [ ] Add role capability helper and tests.
- [ ] Update route permissions and navigation tests.
- [ ] Add route-backed warehouse workspace shell.
- [ ] Confirm WMS-44 list/create/detail/edit regression coverage.

### WMS-85

- [ ] Add deactivate service and mutation.
- [ ] Add accessible confirmation dialog.
- [ ] Add inactive-state action restrictions.
- [ ] Add automated tests.
- [!] Verify BR-13 after backend enforcement is available.

### WMS-86

- [ ] Add layout route.
- [ ] Build adaptive zone/rack/slot explorer.
- [ ] Add URL-backed mobile drill-down state.
- [ ] Handle loading/error/empty/permission states.
- [ ] Add automated tests.

### WMS-87

- [ ] Add location query types/service/hook.
- [ ] Add debounced search and filter sheet.
- [ ] Add server pagination.
- [ ] Add desktop table and mobile item list.
- [ ] Add automated tests.

### WMS-88

- [ ] Add zone/rack/slot Zod schemas.
- [ ] Add create services and mutations.
- [ ] Add contextual create forms.
- [ ] Add duplicate-code and permission error handling.
- [ ] Add automated tests.

### WMS-89

- [ ] Verify and add a Code 128 rendering dependency if required.
- [ ] Add barcode service/query and route.
- [ ] Add accessible barcode preview.
- [ ] Add single-label print behavior.
- [ ] Add automated tests.

### Verification and delivery

- [ ] Run focused tests after each task.
- [ ] Run full `pnpm lint`.
- [ ] Run full `pnpm test`.
- [ ] Run full `pnpm build`.
- [ ] Run `git diff --check`.
- [ ] Complete browser QA matrix.
- [ ] Run web-design-guidelines review.
- [ ] Run code review and resolve findings.
- [ ] Update this progress tracker and work log.
- [ ] Commit implementation in task-scoped increments.
- [ ] Push branch and prepare PR description.

## 18. Work Log

Update this table after each implementation checkpoint. Record evidence and blockers, not general status statements.

| Date       | Scope                 | Evidence/result                                                                                                         | Status    |
| ---------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------- |
| 2026-08-10 | Branch setup          | Branch created from frontend `origin/dev` commit `62cd000`; worktree clean                                              | Completed |
| 2026-08-10 | Contract audit        | Verified controller endpoints, request validators, response DTOs, role permission model, and warehouse tenant filtering | Completed |
| 2026-08-10 | Architecture decision | Approved shared route-backed workspace with desktop tabs and mobile drill-down                                          | Completed |
| 2026-08-10 | Risk review           | Recorded missing BR-13 enforcement, missing assignment scope, and missing FE permission list                            | Completed |
| 2026-08-10 | Design spec           | Created this document with API, UI, architecture, skills, tests, and progress tracking                                  | Completed |

## 19. Open Backend Follow-Ups

These do not authorize backend edits from this frontend branch:

1. Enforce UC-WS-05 BR-13 before deactivating a warehouse.
2. Restrict Manager/Staff warehouse reads to active warehouse assignments.
3. Consider exposing effective permission keys in the authenticated profile if product requirements need permission-aware UI visibility.
4. Define update/delete layout APIs only when those workflows are added to the backlog.
5. Define batch barcode/file endpoints only when batch printing becomes a requirement.
