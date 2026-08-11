# WMS-85 to WMS-89 - Warehouse Structure Workspace Design Spec

## Document Control

| Item                    | Value                                                                                                                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Scope                   | Frontend implementation and required backend contract completion for WMS-85 through WMS-89                                                                                     |
| Frontend branch         | `feat/wms-85-89-warehouse-structure`                                                                                                                                           |
| Frontend base           | `dev` at `62cd000c367fab79bb47b9ed8fa6e5aedf726e10`                                                                                                                            |
| Backend branch          | `feat/wms-85-89-warehouse-structure`                                                                                                                                           |
| Backend base            | Current `origin/dev` at `eb4bc4c`                                                                                                                                              |
| Backend recovery branch | `backup/dev-before-origin-force-20260811` preserves the pre-sync local `dev` history                                                                                           |
| Related backend tasks   | WMS-71 through WMS-75                                                                                                                                                          |
| Related use cases       | UC-WS-05 through UC-WS-09                                                                                                                                                      |
| Previous frontend scope | WMS-44 Warehouse Management UI                                                                                                                                                 |
| Status                  | WMS-85 through WMS-89 and required backend UC/API completion implemented and verified; visual browser QA remains pending because the integrated browser runtime is unavailable |
| Last updated            | 2026-08-11                                                                                                                                                                     |

## 1. Objective

Complete the warehouse structure workflows that were intentionally excluded from WMS-44:

- Deactivate a warehouse.
- Browse the warehouse layout as an operational explorer.
- Search and filter zones, racks, and slots from one location directory.
- Create, update, and safely deactivate zones, racks, and slots.
- Preview, download, and print a scannable barcode for any warehouse location.

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
7. Warehouse Manager can update an assigned warehouse, view/search/configure its layout, and create barcode labels.
8. Warehouse Staff can view the assigned warehouse layout and search locations, but cannot update/configure/deactivate or generate barcode labels.
9. UC-WS-08 requires create and update plus safe location deactivation. Hard delete, moving between parents, and reordering remain out of scope.
10. UC-WS-09 covers one location at a time. Batch barcode export, printer integration, and persistent generated files remain out of scope.

## 3. Scope by Jira Task

| FE task | UC       | Deliverable                                           | Main backend dependency |
| ------- | -------- | ----------------------------------------------------- | ----------------------- |
| WMS-85  | UC-WS-05 | Warehouse deactivation confirmation and result states | WMS-71                  |
| WMS-86  | UC-WS-06 | Complete responsive warehouse layout explorer         | WMS-72                  |
| WMS-87  | UC-WS-07 | Search/filter/paginate Zone, Rack, and Slot locations | WMS-73                  |
| WMS-88  | UC-WS-08 | Create, update, and safely deactivate layout entities | WMS-74                  |
| WMS-89  | UC-WS-09 | Preview/download/print one location barcode           | WMS-75                  |

## 4. Explicit Non-Goals

- Enforcing warehouse assignment scope in the frontend.
- Hard deleting, moving between parents, or reordering zones, racks, or slots.
- Drag-and-drop warehouse layout design.
- A graphical floor-plan or coordinate-based layout editor.
- Inventory movement, stock adjustment, or occupancy mutation.
- Camera scanning.
- Batch barcode generation, server-side PDF export, or direct printer integration.
- Adding permissions to the authenticated user response.
- Building the future native/cross-platform mobile application in this branch.

## 5. Access and Capability Matrix

The table controls frontend visibility. Every API request still depends on the permission assigned to the user's role in the backend RBAC screen.

| Capability                        | Tenant Owner | Warehouse Manager  |  Warehouse Staff   | Backend permission            |
| --------------------------------- | :----------: | :----------------: | :----------------: | ----------------------------- |
| Browse warehouses                 |     Yes      | Yes, assigned only | Yes, assigned only | `warehouses:view`             |
| View details and layout           |     Yes      | Yes, assigned only | Yes, assigned only | `warehouses:view`             |
| Search locations                  |     Yes      | Yes, assigned only | Yes, assigned only | `warehouses:view`             |
| Preview/download/print barcode    |     Yes      | Yes, assigned only |         No         | `warehouses:generate-barcode` |
| Create/update/deactivate location |     Yes      | Yes, assigned only |         No         | `warehouses:configure-layout` |
| Create warehouse                  |     Yes      |         No         |         No         | `warehouses:create`           |
| Edit warehouse                    |     Yes      | Yes, assigned only |         No         | `warehouses:update`           |
| Deactivate warehouse              |     Yes      |         No         |         No         | `warehouses:deactivate`       |

### Authorization behavior

- Update `src/config/route-permissions.ts` so all three warehouse roles can open warehouse routes.
- Add the warehouse navigation item for Warehouse Manager and Warehouse Staff.
- Preserve owner-only visibility for create and warehouse-deactivate actions.
- Show warehouse edit to Tenant Owner and the assigned Warehouse Manager.
- Preserve owner/manager visibility for configure-layout actions.
- Preserve view/search actions for all three warehouse roles; barcode actions are Owner/Manager only.
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

Required backend completion on the backend feature branch:

- Block when any `InventoryBalance` in the warehouse has `QuantityOnHand > 0` or `ReservedQuantity > 0`.
- Block when the warehouse is the source or destination of a non-terminal transfer (`Draft` or `InTransit`).
- Block when the warehouse has a non-terminal outbound/issue order (anything other than `Delivered` or `Failed`).
- Return `409 Conflict` with a stable error code and Vietnamese-safe message for each failed precondition.
- Keep the state change and all checks in the command handler; the frontend only confirms intent and renders the backend result.

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

The current endpoint searches only Slot records by `slotCode`, which does not satisfy UC-WS-07. Keep the route but replace the task contract with a generalized, paged location result.

| Item       | Required contract                                                                             |
| ---------- | --------------------------------------------------------------------------------------------- | ---- | --------------------------------------------------------------- |
| Endpoint   | `GET /api/warehouses/{warehouseId}/locations`                                                 |
| Response   | `ApiResponse<QueryResult<LocationSearchResponse>>`                                            |
| Permission | `warehouses:view`                                                                             |
| Paging     | `top`, `skip`, `needTotalCount`                                                               |
| Search     | `searchText`, matched against the code and display name available for each location type      |
| Filters    | `type=Zone                                                                                    | Rack | Slot`, `lifecycleStatus`, `occupancyStatus`, `zoneId`, `rackId` |
| Scope      | Tenant Owner sees tenant warehouses; Manager/Staff must have an active `WarehouseUser` record |

```ts
interface LocationSearchResponse {
  id: string
  type: 'Zone' | 'Rack' | 'Slot'
  code: string
  name: string | null
  lifecycleStatus: 'Active' | 'Inactive'
  occupancyStatus: 'Vacant' | 'Occupied' | 'Reserved' | 'Full' | null
  zoneId: string | null
  zoneCode: string | null
  rackId: string | null
  rackCode: string | null
  capacity: number | null
  currentOccupancy: number | null
}
```

The API returns complete hierarchy labels so the directory is usable without joining the layout response on the client. Sorting is stable by `type`, parent code, and location code before paging.

### WMS-88 - Configure layout

#### Relationship to Warehouse Layout Designer

WMS-88 is the form-based UC-WS-08 workflow for creating the Zone, Rack, and Slot business entities. It is not the graphical warehouse layout designer.

The separate designer will reuse the entities created by WMS-88, but adds canvas geometry editing, a conditional Properties panel, scene persistence, and non-business decorations. Do not add drag-and-drop, coordinate editing, rotation, canvas settings, or scene APIs to WMS-88 without following the [Warehouse Layout Designer specification](./2026-08-10-warehouse-layout-designer-spec.md).

For WMS-88 itself, keep form-based create/update/deactivate workflows. The designer integration starts only after its backend scene contract is approved.

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

Required maintenance endpoints:

| Action          | Endpoint                                                                       | Notes                                                                   |
| --------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Update Zone     | `PUT /api/warehouses/{warehouseId}/zones/{zoneId}`                             | Update code, name, description; duplicate code returns `409`            |
| Deactivate Zone | `PATCH /api/warehouses/{warehouseId}/zones/{zoneId}/deactivate`                | Block when any descendant slot has on-hand or reserved stock            |
| Update Rack     | `PUT /api/warehouses/{warehouseId}/zones/{zoneId}/racks/{rackId}`              | Update code and name; moving to another Zone is not allowed             |
| Deactivate Rack | `PATCH /api/warehouses/{warehouseId}/zones/{zoneId}/racks/{rackId}/deactivate` | Block when any descendant slot has on-hand or reserved stock            |
| Update Slot     | `PUT /api/warehouses/{warehouseId}/racks/{rackId}/slots/{slotId}`              | Update code/capacity; capacity cannot be below occupancy or reservation |
| Deactivate Slot | `PATCH /api/warehouses/{warehouseId}/racks/{rackId}/slots/{slotId}/deactivate` | Block when on-hand/reserved quantity is non-zero                        |

`SlotStatus` represents occupancy while `ZoneStatus` and `RackStatus` represent lifecycle. Slot now has an explicit `IsActive` lifecycle field. Deactivating a Zone or Rack changes the selected parent only; descendants become effectively inactive through ancestor state while retaining their own persisted lifecycle for a future audited reactivation workflow. Hard delete is not exposed.

### WMS-89 - Location barcode

| Item       | Required contract                                                                   |
| ---------- | ----------------------------------------------------------------------------------- |
| Endpoint   | `GET /api/warehouses/{warehouseId}/locations/{locationType}/{locationId}/barcode`   |
| Types      | `zone`, `rack`, `slot`                                                              |
| Response   | `ApiResponse<LocationBarcodeResponse>`                                              |
| Permission | `warehouses:generate-barcode`                                                       |
| Scope      | Tenant Owner or assigned Warehouse Manager; inactive/invalid locations are rejected |

```ts
interface LocationBarcodeResponse {
  locationId: string
  locationType: 'Zone' | 'Rack' | 'Slot'
  locationCode: string
  barcodeValue: string
  symbology: 'Code128'
}
```

The backend returns one stable barcode value per location, not a generated image or stored file. The frontend renders Code 128 as SVG, supports SVG download and browser printing, and does not hand-roll encoding. The existing slot-only route remains temporarily as a compatibility alias until WMS-89 FE migrates.

## 7. Backend Implementation and Coordination Notes

All required backend work is implemented on local branch `feat/wms-85-89-warehouse-structure`, created from `origin/dev` commit `eb4bc4c`. Verification evidence is recorded in the work log.

### BR-13 deactivation completion

- The handler blocks stock/reservations, non-terminal transfers, and non-terminal outbound orders.
- All blockers are aggregated into one `409 Conflict` response with stable error keys.
- FE submits only after explicit confirmation and renders the backend validation result.

### Assignment-scope completion

Warehouse list, detail, layout, locations, and barcode handlers use the centralized warehouse access policy.

- Tenant Owner has tenant-wide access.
- Warehouse Manager and Warehouse Staff reads require an active `WarehouseUser` assignment.
- Warehouse Manager mutations require an active assignment; Warehouse Staff cannot mutate layout even if a broad permission is assigned accidentally.
- Route hiding remains a UX concern, not a security boundary.

### UC contract gaps closed on 2026-08-11

1. UC-WS-07 now returns generalized, paged Zone/Rack/Slot results.
2. UC-WS-08 now exposes create, update, and inventory-safe deactivation endpoints.
3. UC-WS-09 now supports active Zone/Rack/Slot locations and uses `warehouses:generate-barcode`.
4. UC-WS-04 now permits an assigned Warehouse Manager to update allowed warehouse fields.
5. Slot lifecycle is persisted separately from occupancy through `IsActive`.

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

/warehouses/[warehouseId]/locations/[locationType]/[locationId]/barcode
  Single Zone, Rack, or Slot barcode preview/download/print surface
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
src/app/(private)/warehouses/[warehouseId]/locations/[locationType]/[locationId]/barcode/page.tsx
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
  barcode(warehouseId, locationType, locationId),
}
```

Cache behavior:

- Layout is lazy-loaded only on layout, locations, or barcode routes that need it.
- Location pagination uses previous data as placeholder data to avoid layout jumps.
- Create/update/deactivate Zone invalidates warehouse detail, layout, and all location queries for that warehouse.
- Create/update/deactivate Rack invalidates layout and all location queries for that warehouse.
- Create/update/deactivate Slot invalidates layout and all location queries for that warehouse.
- Deactivate invalidates warehouse list, detail, layout, and location queries for the warehouse.
- Barcode query is keyed by warehouse ID, location type, and location ID.
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
- Explain that deactivation is validated against stock, reservations, transfers, and open outbound orders by the backend.
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
- One `Bộ lọc` button opens a sheet containing type, zone, rack, lifecycle status, and Slot occupancy status filters.
- Show the number of active filters in the button label/badge.
- Keep refresh as an icon button with tooltip and `aria-label`.

Filter behavior:

- Selecting a zone clears a rack that does not belong to that zone.
- Rack options are derived from the selected zone and layout response.
- Type options are `Zone`, `Rack`, and `Slot`.
- Lifecycle options are `Active` and `Inactive`; Slot occupancy options are `Vacant`, `Occupied`, `Reserved`, and `Full`.
- `Đặt lại` clears all filters and returns to page 1.
- Query parameters omit empty optional values.

Results:

- Desktop uses a semantic table.
- Mobile uses a vertical item list to prevent page-level horizontal scrolling.
- Display a type icon/label, location code and name, complete parent context, localized lifecycle/occupancy status, and an Owner/Manager-only barcode action.
- Capacity and occupancy are shown only for Slot results; do not render placeholder metrics for Zone or Rack.
- Numeric capacity and occupancy are right-aligned on desktop.
- Guard percentage calculations when capacity is zero, even though new slots require positive capacity.
- Loading, error, no-layout, no-results, and success states are visually distinct.
- Pagination uses `top`, `skip`, and `needTotalCount: true` without client-side slicing.

### WMS-88 - Configure layout

#### Relationship to Warehouse Layout Designer

This task creates and maintains the business entities used by the separate 2D designer. It must retain the form-based interactions below. Any canvas integration must first follow the [Warehouse Layout Designer specification](./2026-08-10-warehouse-layout-designer-spec.md).

Contextual actions:

- `Thêm khu vực` in the zone pane header.
- `Thêm kệ` in the selected zone pane/header.
- `Thêm vị trí` in the selected rack pane/header.
- Edit and deactivate actions live in each entity's overflow menu; destructive actions remain visually separated.
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
- On success, close/reset the form, invalidate the correct queries, preserve the selected context when useful, and show a success toast.
- Deactivation uses `AlertDialog`, names the exact target, and keeps the dialog open when the API returns an occupied/reserved conflict.
- Do not offer hard delete, moving to another parent, bulk creation, auto-numbering, or drag-and-drop in this scope.

### WMS-89 - Barcode preview and print

Entry points:

- Barcode icon action on a location row/item.
- Barcode action on a Zone, Rack, or Slot in the layout explorer.
- Use `Link` to the dedicated barcode route.

Preview route:

- Fetch barcode data by warehouse ID, location type, and location ID rather than trusting navigation state.
- Show warehouse/parent context, location type/code, human-readable barcode value, and a scannable Code 128 SVG.
- Keep the barcode high contrast with sufficient quiet zone around it.
- Do not crop or scale the bars non-uniformly.
- Show loading, permission, not-found, and retry states.

Print behavior:

- One primary `In nhãn` command calls the browser print workflow.
- Print styles hide application navigation and non-label controls.
- Add a separate download command that serializes the rendered SVG with a deterministic filename.
- The printable region contains only warehouse/location identification and the barcode.
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
- Location type/status filter serialization and hierarchy rendering.
- Status localization and occupancy formatting.
- Zod schemas for create/update Zone, Rack, and Slot forms.
- API error-to-field mapping for duplicate codes.

### Component tests

- Workspace navigation links preserve warehouse ID and active state.
- Deactivate confirmation submits once, disables while pending, and handles errors.
- Layout explorer renders empty, loading, error, selected zone/rack, and mobile drill-down states.
- Create/update forms submit exact payload fields and selected parent IDs.
- Location deactivation dialogs submit once and preserve backend conflict messages.
- Location filters clear incompatible rack selections and reset pagination.
- Desktop table and mobile items expose the same essential information.
- Barcode actions are hidden from Staff and link to the correct typed location route for Owner/Manager.
- Barcode page renders returned value and exposes accessible download and print commands.
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

1. Owner browses a warehouse, opens every workspace route, creates/updates/deactivates an empty location, prints a barcode, and deactivates a test warehouse.
2. Assigned Manager updates allowed warehouse fields, views/searches/configures, and downloads/prints a location barcode but cannot see owner-only warehouse actions.
3. Staff views/searches but cannot see create/edit/configure/deactivate/barcode actions.
4. System Admin is rejected from tenant warehouse routes.
5. Remove a required permission in admin and confirm the affected API state shows a clear `403` result.
6. Refresh and browser Back preserve the active workspace route and mobile drill-down context.
7. Verify light/dark mode, keyboard navigation, focus visibility, screen-reader labels, and reduced-motion behavior.
8. Confirm no page-level horizontal overflow, clipped sheets/dialogs, overlapping labels, or inaccessible controls.

## 15. Implementation Order

1. Shared contracts, endpoint builders, query keys, capability helper, route permissions, and navigation.
2. Route-backed warehouse workspace shell and overview migration without behavior regression.
3. WMS-86 adaptive layout explorer.
4. Backend UC completion: BR-13, assignment scope, generalized location search, location maintenance, and typed barcode contract.
5. WMS-88 create/update/deactivate Zone/Rack/Slot mutations and forms.
6. WMS-87 generalized location query, filters, pagination, desktop table, and mobile items.
7. WMS-89 typed barcode route, Code 128 rendering, SVG download, and print behavior.
8. Re-verify WMS-85 against backend BR-13 responses and inactive-state restrictions.
9. Cross-role, responsive, accessibility, dark-mode, and regression QA.

This order establishes shared navigation and data contracts before mutation workflows. Barcode follows locations because both entry points and types are already available. Deactivation is integrated last so inactive-state restrictions can be verified against all completed workspace actions.

## 16. Definition of Done

- All five FE Jira tasks satisfy UC-WS-05 through UC-WS-09 against the completed backend contract documented here.
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
- Required BE gaps are implemented and covered by tests; optional enhancements remain explicitly deferred.

## 17. Progress Tracker

Legend: `[ ]` not started, `[~]` in progress, `[x]` completed, `[!]` blocked or requires coordination.

### Discovery and design

- [x] Pull latest frontend `dev`.
- [x] Create `feat/wms-85-89-warehouse-structure` from `origin/dev`.
- [x] Read repository rules and referenced workflow/design documents.
- [x] Audit existing WMS-44 frontend architecture.
- [x] Audit backend WMS-71 through WMS-75 endpoints and DTOs.
- [x] Re-read UC-WS-05 through UC-WS-09 from the source Sheet and record contract gaps.
- [x] Sync backend `dev` to rewritten `origin/dev` while preserving the old local history on a backup branch.
- [x] Create backend `feat/wms-85-89-warehouse-structure` from `origin/dev` at `eb4bc4c`.
- [x] Confirm shared routes and role-based actor model.
- [x] Approve route-backed desktop workspace and mobile drill-down design.
- [x] Write this design spec.
- [x] User review of written spec.
- [x] Produce file-by-file implementation plan with `superpowers:writing-plans`.

### Shared foundation

- [x] Add endpoint builders and DTOs.
- [x] Add query keys and React Query hooks/mutations.
- [x] Add role capability helper and tests.
- [x] Update route permissions and navigation tests.
- [x] Add route-backed warehouse workspace shell.
- [x] Confirm WMS-44 list/create/detail/edit regression coverage.

### WMS-85

- [x] Add deactivate service and mutation.
- [x] Add accessible confirmation dialog.
- [x] Add inactive-state action restrictions.
- [x] Add automated tests.
- [x] Verify BR-13 after backend enforcement is available.

### WMS-86

- [x] Add layout route.
- [x] Build adaptive zone/rack/slot explorer.
- [x] Add URL-backed mobile drill-down state.
- [x] Handle loading/error/empty/permission states.
- [x] Add automated tests.

### WMS-87

- [x] Implement generalized Zone/Rack/Slot search API before FE work.
- [x] Add location query types/service/hook.
- [x] Add debounced search and filter sheet.
- [x] Add server pagination.
- [x] Add desktop table and mobile item list.
- [x] Add automated tests.

### WMS-88

- [x] Read the Warehouse Layout Designer specification before any canvas or scene integration; do not expand baseline WMS-88 forms into a graphical editor.
- [x] Implement update/deactivate APIs and Slot lifecycle field before FE maintenance work.
- [x] Add create/update Zone/Rack/Slot Zod schemas.
- [x] Add create/update/deactivate services and mutations.
- [x] Add contextual create/edit forms and deactivation dialogs.
- [x] Add duplicate-code and permission error handling.
- [x] Add automated tests.

### WMS-89

- [x] Implement typed Zone/Rack/Slot barcode API and dedicated permission before FE work.
- [x] Verify and add a Code 128 rendering dependency if required.
- [x] Add barcode service/query and route.
- [x] Add accessible barcode preview.
- [x] Add single-label print behavior.
- [x] Add single-label SVG download behavior.
- [x] Add automated tests.

### Backend UC completion

- [x] Enforce BR-13 in `DeactivateWarehouseCommandHandler` with conflict tests.
- [x] Add reusable Owner-or-active-assignment warehouse scope checks.
- [x] Apply assignment scope to warehouse read/update/layout/location/configuration/barcode handlers.
- [x] Replace the Slot-only location search response with generalized Zone/Rack/Slot results.
- [x] Add Slot lifecycle persistence without overloading occupancy status.
- [x] Add Zone/Rack/Slot update commands, validators, endpoints, and tests.
- [x] Add safe Zone/Rack/Slot deactivation commands, endpoints, and descendant stock/reservation tests.
- [x] Add `warehouses:generate-barcode` and typed location barcode query/endpoint/tests.
- [x] Run backend build/test and migration verification.

### Verification and delivery

- [x] Run focused tests after each task.
- [x] Run full `pnpm lint`.
- [x] Run full `pnpm test`.
- [x] Run full `pnpm build`.
- [x] Run `git diff --check`.
- [!] Complete browser QA matrix. Integrated browser startup is blocked by a local runtime asset error; automated tests, production build, and authenticated HTTP smoke testing are complete.
- [x] Run web-design-guidelines review.
- [x] Run code review and resolve findings.
- [x] Update this progress tracker and work log.
- [~] Commit implementation in task-scoped increments. WMS-85/WMS-86 are committed; the current BE/FE WMS-87 through WMS-89 changes remain uncommitted for review.
- [ ] Push branch and prepare PR description.

## 18. Work Log

Update this table after each implementation checkpoint. Record evidence and blockers, not general status statements.

| Date       | Scope                     | Evidence/result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Status    |
| ---------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 2026-08-10 | Branch setup              | Branch created from frontend `origin/dev` commit `62cd000`; worktree clean                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Completed |
| 2026-08-10 | Contract audit            | Verified controller endpoints, request validators, response DTOs, role permission model, and warehouse tenant filtering                                                                                                                                                                                                                                                                                                                                                                                                                                       | Completed |
| 2026-08-10 | Architecture decision     | Approved shared route-backed workspace with desktop tabs and mobile drill-down                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Completed |
| 2026-08-10 | Risk review               | Recorded missing BR-13 enforcement, missing assignment scope, and missing FE permission list                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Completed |
| 2026-08-10 | Design spec               | Created this document with API, UI, architecture, skills, tests, and progress tracking                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Completed |
| 2026-08-10 | WMS-86 implementation     | Added role capabilities, shared warehouse workspace navigation, responsive layout explorer, and URL-backed mobile drill-down in commits `1f5d1c5`, `d373448`, and `ec01289`                                                                                                                                                                                                                                                                                                                                                                                   | Completed |
| 2026-08-10 | WMS-85 implementation     | Added owner-only deactivation mutation, confirmation dialog, inactive-state restrictions, and tests in commit `e338dfb`                                                                                                                                                                                                                                                                                                                                                                                                                                       | Completed |
| 2026-08-10 | Browser QA                | Verified Owner/Manager/Staff behavior, desktop and mobile viewports, dark mode, route refresh, no horizontal overflow, and the non-destructive deactivation confirmation; no safe reactivation endpoint was available to submit the mutation against shared data                                                                                                                                                                                                                                                                                              | Completed |
| 2026-08-10 | UI audit                  | Applied `web-design-guidelines`: protected warehouse identifiers from translation, localized all supported slot statuses, stabilized numeric capacity display, and verified focus/semantic patterns                                                                                                                                                                                                                                                                                                                                                           | Completed |
| 2026-08-10 | Regression checks         | Focused warehouse tests: 18 files/51 tests; full suite: 44 files/121 tests; `pnpm lint`, `pnpm build`, and `git diff --check` passed. Existing Vite native-config warning remains unrelated                                                                                                                                                                                                                                                                                                                                                                   | Completed |
| 2026-08-10 | Backend dependency        | Historical blocker: BR-13 stock, transfer, and open-order validation was absent from the deactivation handler. It was resolved by the backend completion on 2026-08-11.                                                                                                                                                                                                                                                                                                                                                                                       | Resolved  |
| 2026-08-11 | UC source audit           | Re-read UC-WS-05 through UC-WS-09 from Google Sheet gid `1480330355`; found missing generalized location search, layout update/deactivation, all-location barcode, assignment scope, and BR-13 enforcement                                                                                                                                                                                                                                                                                                                                                    | Completed |
| 2026-08-11 | Backend branch setup      | `origin/dev` was force-updated; preserved old local history in `backup/dev-before-origin-force-20260811`, aligned local `dev` to `eb4bc4c`, and created local `feat/wms-85-89-warehouse-structure` from that commit                                                                                                                                                                                                                                                                                                                                           | Completed |
| 2026-08-11 | Contract expansion        | Added required API contracts and corrected UC actor differences: assigned Manager may update warehouse; Staff cannot generate location barcodes                                                                                                                                                                                                                                                                                                                                                                                                               | Completed |
| 2026-08-11 | Backend UC completion     | Implemented BR-13 aggregate conflicts, assignment-aware access policy, generalized location search, Zone/Rack/Slot maintenance, explicit Slot lifecycle, and typed barcode metadata endpoint                                                                                                                                                                                                                                                                                                                                                                  | Completed |
| 2026-08-11 | Backend migrations        | Added missing StockLedger schema migration required by current `dev` plus isolated `AddWarehouseLocationLifecycle`; EF reports no pending model changes and preserves the Invitation relationship                                                                                                                                                                                                                                                                                                                                                             | Completed |
| 2026-08-11 | Backend verification      | Warehouse tests 8/8 and full Application test suite 30/30 passed; solution build passed with 0 warnings/errors; `git diff --check` reported line-ending notices only                                                                                                                                                                                                                                                                                                                                                                                          | Completed |
| 2026-08-11 | WMS-87 implementation     | Added generalized location directory with debounced search, Zone/Rack/Slot filters, lifecycle and occupancy filters, server pagination, desktop table, responsive mobile items, and role-aware barcode actions                                                                                                                                                                                                                                                                                                                                                | Completed |
| 2026-08-11 | WMS-88 implementation     | Added contextual Zone/Rack/Slot create and edit Sheets, safe deactivation dialog, Zod validation, hierarchy-aware active state, role capabilities, mutations, cache invalidation, and interaction tests                                                                                                                                                                                                                                                                                                                                                       | Completed |
| 2026-08-11 | WMS-89 implementation     | Added typed barcode route and query, accessible Code 128 SVG rendering through JsBarcode, SVG download, print-only label styling, metadata, loading/error states, and tests                                                                                                                                                                                                                                                                                                                                                                                   | Completed |
| 2026-08-11 | End-to-end smoke          | Started the migrated backend database, authenticated as Tenant Owner, synchronized the new barcode permission in local development data, and verified warehouse/layout/location responses. Seed data contains no locations, so no persistent QA records were created.                                                                                                                                                                                                                                                                                         | Completed |
| 2026-08-11 | Final verification        | FE: 47 files/131 tests, lint, and Next production build passed with both location routes registered. BE: 30/30 Application tests and solution build passed with 0 warnings/errors. EF reports no pending model changes. Existing Vite native-config warning is unrelated.                                                                                                                                                                                                                                                                                     | Completed |
| 2026-08-11 | Visual browser QA         | Integrated browser could not start because its local kernel asset path was unavailable (`os error 3`). Visual desktop/mobile and light/dark screenshot QA remains pending; this is not counted as completed.                                                                                                                                                                                                                                                                                                                                                  | Blocked   |
| 2026-08-11 | Slot layout correction    | Replaced the conflicting `flex-col` plus `basis-full` composition with an explicit two-column item grid. Removed the progress bar and redundant label, isolated code/status/actions from the capacity row, and constrained long location/barcode values. Focused tests 9/9, full FE suite 132/132, lint, formatting, diff check, and production build passed.                                                                                                                                                                                                 | Completed |
| 2026-08-11 | Location query regression | Replaced enum projections in the relational Zone/Rack/Slot set operation with stable wire strings plus numeric type ordering, added SQLite coverage for all occupancy states, hierarchy, filters, ordering, and paging, and isolated FE layout-metadata failures inside the filter Sheet. BE tests 31/31, solution build with 0 warnings/errors, EF pending-model check, FE tests 137/137, lint, production build, and authenticated no-filter/type/occupancy API smoke all passed. Browser screenshot QA remains blocked by the recorded local `os error 3`. | Completed |

## 19. Backend Completion and Future Follow-Ups

Required items 1-5 are complete on the backend feature branch named in Document Control:

1. Enforced UC-WS-05 BR-13 before deactivating a warehouse.
2. Restricted Manager/Staff warehouse reads and Manager mutations to active warehouse assignments.
3. Generalized UC-WS-07 search to Zone/Rack/Slot with code, type, status, hierarchy labels, and server paging.
4. Added UC-WS-08 update and safe deactivation APIs, including explicit Slot lifecycle state.
5. Generalized UC-WS-09 barcode metadata to active Zone/Rack/Slot and protected it with `warehouses:generate-barcode`.

Optional future items, not required by these UCs:

6. Bulk slot generation by naming pattern.
7. Reactivation workflows for inactive Zone/Rack/Slot after a dedicated UC and audit semantics are approved.
8. Batch barcode/PDF generation or direct printer integration.
9. Effective permission keys in the authenticated profile for permission-aware FE visibility.
