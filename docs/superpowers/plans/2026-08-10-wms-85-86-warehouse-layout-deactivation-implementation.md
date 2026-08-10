# WMS-85 and WMS-86 Warehouse Layout and Deactivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the route-backed responsive warehouse layout explorer from WMS-86 and the owner-only warehouse deactivation workflow from WMS-85 without regressing WMS-44 create, detail, and edit behavior.

**Architecture:** A client feature component wraps the dynamic warehouse route and owns shared warehouse detail, edit, deactivation, and navigation state. The overview and layout routes remain thin page wrappers; the layout page owns URL-backed zone/rack selection while a presentational explorer adapts from three desktop panes to one mobile drill-down pane. Role capabilities control frontend visibility, while backend permissions remain authoritative.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript 6, TanStack React Query 5, Zustand, shadcn/ui, Tailwind CSS 4, Lucide, Vitest, Testing Library.

## Global Constraints

- Work only on WMS-85 and WMS-86; leave WMS-87 through WMS-89 unimplemented.
- Follow `AGENTS.md`, `.rules`, `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, and `docs/AI_WORKFLOW.md`.
- Read the local Next.js App Router layout, dynamic route, Link, and navigation documentation before changing route files.
- Use existing shadcn primitives before adding components; no new dependency is required for these two tasks.
- Use semantic Tailwind tokens from `src/app/index.css`; no hard-coded feature colors.
- Use role-based UI capabilities because the authenticated profile does not expose permission keys.
- Backend API permission checks remain the final authority; handle API `403` contextually.
- Do not claim BR-13 stock/transfer/order checks are enforced; the current backend deactivation handler does not implement them.
- Keep route files as thin default exports and feature pages/components as named exports.
- Use TDD for every behavior change and commit task-scoped checkpoints.

---

## File Map

### Create

- `src/app/(private)/warehouses/[warehouseId]/layout.tsx`: thin dynamic route layout that passes `warehouseId` to the feature workspace.
- `src/app/(private)/warehouses/[warehouseId]/layout/page.tsx`: thin route wrapper for the layout explorer.
- `src/features/warehouse/pages/WarehouseLayoutPage.tsx`: layout query and URL-backed zone/rack selection orchestration.
- `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.tsx`: shared header, route navigation, edit flow, deactivate flow, and shared loading/error shell.
- `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx`: shared shell capability and route navigation tests.
- `src/features/warehouse/components/WarehouseWorkspace/index.ts`: workspace component exports.
- `src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.tsx`: accessible destructive confirmation UI.
- `src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.test.tsx`: confirmation, pending, and callback tests.
- `src/features/warehouse/utils/warehouse-capabilities.ts`: role-to-capability derivation.
- `src/features/warehouse/utils/warehouse-capabilities.test.ts`: role capability matrix tests.

### Modify

- `src/app/(private)/warehouses/[warehouseId]/page.tsx`: keep only the overview route wrapper.
- `src/features/warehouse/pages/WarehouseDetailPage.tsx`: reduce to overview orchestration/content under the shared workspace.
- `src/features/warehouse/pages/WarehousePage.tsx`: hide owner-only create controls from Manager/Staff.
- `src/features/warehouse/pages/index.ts`: export `WarehouseLayoutPage`.
- `src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.tsx`: replace accordion with adaptive zone/rack/slot explorer.
- `src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.test.tsx`: explorer selection, empty state, status, and mobile navigation callbacks.
- `src/features/warehouse/components/WarehouseDetailPage/index.ts`: export deactivation dialog.
- `src/features/warehouse/hooks/use-warehouse.ts`: add deactivate mutation and explicit layout query key.
- `src/features/warehouse/services/warehouse.service.ts`: add deactivate service call.
- `src/routes/api-endpoints.ts`: add deactivate endpoint builder.
- `src/routes/app-routes.ts`: add warehouse detail/layout route builders.
- `src/lib/query-keys.ts`: add warehouse layout key.
- `src/config/route-permissions.ts`: allow Tenant Owner, Warehouse Manager, and Warehouse Staff to enter warehouse routes.
- `src/config/route-permissions.test.ts`: assert the three-role route policy.
- `src/components/layout/nav-config.ts`: expose warehouse navigation to Manager and Staff.
- `docs/superpowers/plans/2026-08-10-wms-85-89-warehouse-structure-design.md`: update only WMS-85/WMS-86 and work-log progress.

---

### Task 1: Role Capabilities, Routes, and Navigation

**Files:**

- Create: `src/features/warehouse/utils/warehouse-capabilities.ts`
- Create: `src/features/warehouse/utils/warehouse-capabilities.test.ts`
- Modify: `src/routes/app-routes.ts`
- Modify: `src/config/route-permissions.ts`
- Modify: `src/config/route-permissions.test.ts`
- Modify: `src/components/layout/nav-config.ts`

**Interfaces:**

- Consumes: `USER_ROLES` and `UserRole` from `src/config/roles.ts`.
- Produces: `getWarehouseCapabilities(role: UserRole | null): WarehouseCapabilities` with readonly `canCreateWarehouse`, `canEditWarehouse`, `canDeactivateWarehouse`, and `canConfigureLayout` booleans.
- Produces: `APP_ROUTES.warehouseDetail(warehouseId)` and `APP_ROUTES.warehouseLayout(warehouseId)`.

- [ ] **Step 1: Write failing role capability and route permission tests**

```ts
expect(getWarehouseCapabilities(USER_ROLES.TenantOwner)).toEqual({
  canCreateWarehouse: true,
  canEditWarehouse: true,
  canDeactivateWarehouse: true,
  canConfigureLayout: true,
})
expect(getWarehouseCapabilities(USER_ROLES.WarehouseManager)).toEqual({
  canCreateWarehouse: false,
  canEditWarehouse: false,
  canDeactivateWarehouse: false,
  canConfigureLayout: true,
})
expect(getWarehouseCapabilities(USER_ROLES.WarehouseStaff)).toEqual({
  canCreateWarehouse: false,
  canEditWarehouse: false,
  canDeactivateWarehouse: false,
  canConfigureLayout: false,
})
expect(getAllowedRolesForPath('/warehouses/example/layout')).toEqual([
  USER_ROLES.TenantOwner,
  USER_ROLES.WarehouseManager,
  USER_ROLES.WarehouseStaff,
])
```

- [ ] **Step 2: Run tests and verify the new imports/expectations fail**

Run:

```bash
pnpm test -- src/features/warehouse/utils/warehouse-capabilities.test.ts src/config/route-permissions.test.ts
```

Expected: FAIL because `getWarehouseCapabilities` and the expanded route role list do not exist.

- [ ] **Step 3: Implement the minimal role capability helper and route builders**

```ts
export interface WarehouseCapabilities {
  readonly canCreateWarehouse: boolean
  readonly canEditWarehouse: boolean
  readonly canDeactivateWarehouse: boolean
  readonly canConfigureLayout: boolean
}

export function getWarehouseCapabilities(role: UserRole | null): WarehouseCapabilities {
  const isTenantOwner = role === USER_ROLES.TenantOwner
  const isWarehouseManager = role === USER_ROLES.WarehouseManager

  return {
    canCreateWarehouse: isTenantOwner,
    canEditWarehouse: isTenantOwner,
    canDeactivateWarehouse: isTenantOwner,
    canConfigureLayout: isTenantOwner || isWarehouseManager,
  }
}
```

Add warehouse navigation to Manager and Staff, and update the shared warehouse route permission entry to the confirmed three-role list.

- [ ] **Step 4: Run focused tests**

Run:

```bash
pnpm test -- src/features/warehouse/utils/warehouse-capabilities.test.ts src/config/route-permissions.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the capability foundation**

```bash
git add src/features/warehouse/utils/warehouse-capabilities.ts src/features/warehouse/utils/warehouse-capabilities.test.ts src/routes/app-routes.ts src/config/route-permissions.ts src/config/route-permissions.test.ts src/components/layout/nav-config.ts
git commit -m "feat(wms-86): add warehouse role capabilities"
```

---

### Task 2: Route-Backed Warehouse Workspace

**Files:**

- Create: `src/app/(private)/warehouses/[warehouseId]/layout.tsx`
- Create: `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.tsx`
- Create: `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx`
- Create: `src/features/warehouse/components/WarehouseWorkspace/index.ts`
- Modify: `src/app/(private)/warehouses/[warehouseId]/page.tsx`
- Modify: `src/features/warehouse/pages/WarehouseDetailPage.tsx`
- Modify: `src/features/warehouse/pages/WarehousePage.tsx`

**Interfaces:**

- Consumes: `useWarehouseQuery`, `useUpdateWarehouseMutation`, `getWarehouseCapabilities`, `WarehouseEditDialog`, `WarehouseOverview`, and `APP_ROUTES` builders.
- Produces: `WarehouseWorkspaceLayout({ warehouseId, children })` and an overview-only `WarehouseDetailPage({ warehouseId })`.

- [ ] **Step 1: Write failing workspace tests**

Mock the warehouse query, auth store role, current pathname, and update mutation. Assert:

```ts
expect(screen.getByRole('link', { name: 'Thông tin' })).toHaveAttribute(
  'href',
  '/warehouses/warehouse-1'
)
expect(screen.getByRole('link', { name: 'Bố cục kho' })).toHaveAttribute(
  'href',
  '/warehouses/warehouse-1/layout'
)
expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument()
```

Re-render with Warehouse Manager and assert `Chỉnh sửa` is absent while both route links remain.

- [ ] **Step 2: Run the workspace test and verify it fails**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx
```

Expected: FAIL because the workspace component does not exist.

- [ ] **Step 3: Implement the shared workspace shell and thin route layout**

The dynamic Next route layout must only resolve `warehouseId` and render:

```tsx
return <WarehouseWorkspaceLayout warehouseId={warehouseId}>{children}</WarehouseWorkspaceLayout>
```

The feature workspace owns shared loading/error/header/navigation/edit behavior. Navigation uses semantic links with `aria-current="page"`; it must not use local tab state.

- [ ] **Step 4: Reduce the detail page to overview content and protect owner-only create UI**

`WarehouseDetailPage` queries the cached detail and renders `WarehouseOverview`. `WarehousePage` derives capabilities from the auth role and conditionally renders both create entry points, including the empty-state button.

- [ ] **Step 5: Run workspace and WMS-44 regression tests**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx src/features/warehouse/components/WarehouseDetailPage/WarehouseOverview.test.tsx src/features/warehouse/components/WarehousePage/WarehouseList.test.tsx src/features/warehouse/components/WarehousePage/WarehouseCreateDialog.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit the route-backed workspace**

```bash
git add "src/app/(private)/warehouses/[warehouseId]/layout.tsx" "src/app/(private)/warehouses/[warehouseId]/page.tsx" src/features/warehouse/components/WarehouseWorkspace src/features/warehouse/pages/WarehouseDetailPage.tsx src/features/warehouse/pages/WarehousePage.tsx
git commit -m "feat(wms-86): add warehouse workspace navigation"
```

---

### Task 3: Adaptive Zone, Rack, and Slot Explorer

**Files:**

- Create: `src/app/(private)/warehouses/[warehouseId]/layout/page.tsx`
- Create: `src/features/warehouse/pages/WarehouseLayoutPage.tsx`
- Modify: `src/features/warehouse/pages/index.ts`
- Modify: `src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.tsx`
- Modify: `src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.test.tsx`
- Modify: `src/lib/query-keys.ts`
- Modify: `src/features/warehouse/hooks/use-warehouse.ts`

**Interfaces:**

- Consumes: `ZoneResponse[]`, `useWarehouseLayoutQuery(warehouseId, enabled)`, route search params, and `APP_ROUTES.warehouseLayout`.
- Produces: explicit `queryKeys.warehouses.layout(warehouseId)` and `WarehouseLayoutView` props for selection callbacks.

```ts
interface WarehouseLayoutViewProps {
  readonly zones: readonly ZoneResponse[]
  readonly selectedZoneId: string | null
  readonly selectedRackId: string | null
  readonly onSelectZone: (zoneId: string) => void
  readonly onSelectRack: (rackId: string) => void
  readonly onBackToZones: () => void
  readonly onBackToRacks: () => void
}
```

- [ ] **Step 1: Replace the accordion test with failing explorer behavior tests**

Cover:

```ts
expect(screen.getByRole('button', { name: /Khu A/ })).toHaveAttribute('aria-pressed', 'true')
await user.click(screen.getByRole('button', { name: /Kệ A-02/ }))
expect(onSelectRack).toHaveBeenCalledWith('rack-2')
await user.click(screen.getByRole('button', { name: 'Quay lại danh sách khu vực' }))
expect(onBackToZones).toHaveBeenCalledOnce()
```

Also retain empty hierarchy coverage and exact slot capacity/occupancy rendering.

- [ ] **Step 2: Run explorer tests and verify they fail**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.test.tsx
```

Expected: FAIL because the existing accordion does not expose selection callbacks or pane navigation.

- [ ] **Step 3: Implement the adaptive presentational explorer**

Use one grid surface with stable desktop tracks:

```tsx
<div className="grid min-h-[32rem] min-w-0 border lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1.35fr)]">
```

Use semantic buttons for selectable zone/rack rows, `aria-pressed` for selection, `Badge` for status, mono codes, and separate empty prompts for no zones, no racks, and no slots. CSS visibility turns the three desktop panes into a single mobile pane based on selected IDs.

- [ ] **Step 4: Implement URL-backed layout page orchestration**

Read `zoneId` and `rackId` from `useSearchParams`. Validate them against query data; an unknown ID behaves as unselected. Selection updates URL state through `router.push` with `scroll: false`:

```ts
function buildLayoutHref(zoneId?: string, rackId?: string) {
  const params = new URLSearchParams()
  if (zoneId) params.set('zoneId', zoneId)
  if (rackId) params.set('rackId', rackId)
  const query = params.toString()
  return query
    ? `${APP_ROUTES.warehouseLayout(warehouseId)}?${query}`
    : APP_ROUTES.warehouseLayout(warehouseId)
}
```

The page handles layout loading, inline permission/error retry, and success/empty states. The route file remains a thin default export.

- [ ] **Step 5: Run explorer, hook, and route-related tests**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.test.tsx src/config/route-permissions.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the complete WMS-86 explorer**

```bash
git add "src/app/(private)/warehouses/[warehouseId]/layout/page.tsx" src/features/warehouse/pages/WarehouseLayoutPage.tsx src/features/warehouse/pages/index.ts src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.tsx src/features/warehouse/components/WarehouseDetailPage/WarehouseLayoutView.test.tsx src/lib/query-keys.ts src/features/warehouse/hooks/use-warehouse.ts
git commit -m "feat(wms-86): build responsive layout explorer"
```

---

### Task 4: Owner-Only Warehouse Deactivation

**Files:**

- Modify: `src/routes/api-endpoints.ts`
- Modify: `src/features/warehouse/services/warehouse.service.ts`
- Modify: `src/features/warehouse/hooks/use-warehouse.ts`
- Create: `src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.tsx`
- Create: `src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.test.tsx`
- Modify: `src/features/warehouse/components/WarehouseDetailPage/index.ts`
- Modify: `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.tsx`
- Modify: `src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx`

**Interfaces:**

- Produces: `API_ENDPOINTS.warehouses.deactivate(warehouseId)`.
- Produces: `warehouseService.deactivateWarehouse(warehouseId)`.
- Produces: `useDeactivateWarehouseMutation()` accepting a warehouse ID.
- Produces: `WarehouseDeactivateDialog` controlled props.

```ts
interface WarehouseDeactivateDialogProps {
  readonly warehouseName: string
  readonly warehouseCode: string
  readonly open: boolean
  readonly isPending: boolean
  readonly errorMessage?: string
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
}
```

- [ ] **Step 1: Write failing dialog and workspace capability tests**

Assert the dialog names the target warehouse, requires the destructive confirmation action, calls `onConfirm` once, disables actions while pending, and renders `errorMessage` with an alert role.

Extend workspace tests:

```ts
expect(screen.getByRole('button', { name: 'Ngừng hoạt động kho' })).toBeInTheDocument()
```

Assert the action is absent for Manager, Staff, and inactive warehouses.

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.test.tsx src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx
```

Expected: FAIL because the deactivation UI and API workflow do not exist.

- [ ] **Step 3: Implement endpoint, service, and mutation**

```ts
deactivate: (warehouseId: string) => `/warehouses/${warehouseId}/deactivate`
```

The mutation calls `PATCH` without a request body. On success, invalidate `queryKeys.warehouses.all`. On error, log through the mutation `onError` handler.

- [ ] **Step 4: Implement the controlled AlertDialog**

Use `AlertDialog`, `AlertDialogContent`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogCancel`, and destructive `AlertDialogAction`. Copy must identify the warehouse and say the operation stops active warehouse operation; it must not claim BR-13 checks have occurred.

- [ ] **Step 5: Wire deactivation into the workspace**

The workspace owns dialog state and mutation submission. On success, close the dialog and show `Đã ngừng hoạt động kho.`. On failure, keep the dialog open and map the backend message or fallback `Không thể ngừng hoạt động kho. Vui lòng thử lại.`. Hide edit/deactivate controls once status is `Inactive`.

- [ ] **Step 6: Run focused WMS-85 and workspace tests**

Run:

```bash
pnpm test -- src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.test.tsx src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit WMS-85**

```bash
git add src/routes/api-endpoints.ts src/features/warehouse/services/warehouse.service.ts src/features/warehouse/hooks/use-warehouse.ts src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.tsx src/features/warehouse/components/WarehouseDetailPage/WarehouseDeactivateDialog.test.tsx src/features/warehouse/components/WarehouseDetailPage/index.ts src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.tsx src/features/warehouse/components/WarehouseWorkspace/WarehouseWorkspaceLayout.test.tsx
git commit -m "feat(wms-85): add warehouse deactivation flow"
```

---

### Task 5: Progress Tracking, Regression Verification, and UI Audit

**Files:**

- Modify: `docs/superpowers/plans/2026-08-10-wms-85-89-warehouse-structure-design.md`
- Modify: this implementation plan by checking completed steps.

**Interfaces:**

- Consumes: completed WMS-85/WMS-86 code and test evidence.
- Produces: an accurate progress tracker with WMS-87 through WMS-89 still unchecked.

- [ ] **Step 1: Run focused warehouse tests**

```bash
pnpm test -- src/features/warehouse src/config/route-permissions.test.ts
```

Expected: all focused tests pass with zero failures.

- [ ] **Step 2: Run full static and test verification**

```bash
pnpm lint
pnpm test
pnpm build
git diff --check
```

Expected: every command exits 0. Record any unrelated pre-existing warnings separately; do not hide or broaden the change to fix unrelated code.

- [ ] **Step 3: Run the web UI guideline review**

Use `web-design-guidelines` against the changed workspace, layout explorer, and deactivation dialog. Resolve actionable accessibility, focus, semantic, responsive, overflow, and interaction findings within WMS-85/WMS-86 scope.

- [ ] **Step 4: Run browser QA**

Start the FE/BE only when needed and test with supplied accounts at 1366x768, 768x1024, 390x844, and 360x800. Verify light/dark mode, keyboard focus, Owner/Manager/Staff visibility, route refresh, mobile Back behavior, deactivation error/success, and no horizontal page overflow.

- [ ] **Step 5: Update progress documentation with evidence**

Mark only completed WMS-85/WMS-86 items. Keep the BR-13 tracker blocked and WMS-87/WMS-88/WMS-89 unchecked. Append dated work-log rows for test, build, UI audit, and browser QA evidence.

- [ ] **Step 6: Commit verification documentation**

```bash
git add docs/superpowers/plans/2026-08-10-wms-85-89-warehouse-structure-design.md docs/superpowers/plans/2026-08-10-wms-85-86-warehouse-layout-deactivation-implementation.md
git commit -m "docs(wms-86): record warehouse workspace progress"
```
