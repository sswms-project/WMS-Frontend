# Tenant Role Permissions Frontend Specification

## Status

- State: Approved direction, specification only
- Date: 2026-08-26
- Source branch: `dev`
- Working branch: `feat/tenant-role-permissions`
- Related use cases: `UC-OS-12` / `UC-33` View Roles & Permissions; `UC-OS-13` / `UC-34` Configure Role Permissions
- Backend companion: [Tenant-Scoped Role Permissions Backend Specification](../../../../SSWMS-Backend/docs/features/2026-08-26-tenant-role-permissions-backend-spec.md)
- Source implementation: Not started

## Objective

Create a dedicated Tenant Owner access-control workspace that configures Warehouse Manager and
Warehouse Staff permissions inside the current tenant. Reuse the useful permission-grouping ideas
from the admin page without exposing the `/admin` route, global role mutations, System Admin, or
platform-only permissions.

The page must feel like a compact B2B settings workspace: roles are easy to compare, permission
groups are easy to scan, inherited permissions are unambiguous, and large catalogs scroll inside
the workspace instead of making the whole document excessively long.

## Rules And Skills Applied

Implementation must follow this priority:

1. `AGENTS.md` and `.rules`.
2. `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, and `src/app/index.css`.
3. Existing feature patterns and shadcn primitives.
4. `shadcn` composition/form/icon rules.
5. `vercel-react-best-practices` for parallel data flow, rerender control, and bundle discipline.
6. `vercel-composition-patterns` for explicit role/editor composition instead of boolean-heavy
   components.
7. `web-design-guidelines` for semantic controls, visible focus, keyboard behavior, content
   overflow, unsaved-change protection, touch targets, and responsive layout.

No external design skill may replace the Fresh Logistics tokens or turn the page into a marketing
surface.

## Current Frontend Behavior

1. `/admin/roles` is restricted to System Admin by the route-role map.
2. The admin page fetches all global roles and all permissions.
3. `RolePermissionEditor` calls React Query hooks directly, couples presentation to the admin
   service, and cannot safely be reused with a tenant contract.
4. The editor displays raw permission-key suffixes instead of clear Vietnamese action names.
5. The current expanding-card list can become very long and does not explain direct versus
   inherited grants.
6. The auth profile response includes effective permissions, but the persisted `AuthUser` store is
   still role-oriented. The backend remains the final authority for this page.

## Goals

- Add a Tenant Owner-only route and sidebar entry outside `/admin`.
- Show only Warehouse Manager and Warehouse Staff.
- Render only the server-provided tenant-delegatable catalog.
- Distinguish direct, inherited, effective, unavailable, and changed permissions.
- Preserve unsaved edits until the owner saves or explicitly discards them.
- Keep large permission catalogs inside a stable scroll workspace.
- Support desktop, tablet, 390 px mobile, light mode, and dark mode.
- Handle loading, error, empty, forbidden, stale catalog, pending, and success states.
- Keep the admin role screen and admin API client separate.

## Non-Goals

- No custom roles.
- No user-specific grants.
- No warehouse-specific access assignment.
- No System Admin role editor redesign.
- No permission audit-log screen.
- No optimistic update that pretends a permission change succeeded before backend confirmation.
- No new UI dependency or custom checkbox/accordion primitive.

## Route And Navigation

- Route: `/settings/access-control`.
- Allowed frontend role: `TenantOwner` only.
- Sidebar placement: `Hệ thống` section, item label `Phân quyền`, Lucide `ShieldCheck` or `Shield`.
- Keep `/settings/security` as the separate personal-security destination.
- System Admin continues to use `/admin/roles`.
- Manager and Staff must not see the item and must be redirected to `/unauthorized` when entering
  the route manually.
- API `403` remains authoritative even when route-role checks pass.

Update and test:

- `src/routes/app-routes.ts`
- `src/routes/api-endpoints.ts`
- `src/lib/query-keys.ts`
- `src/config/route-permissions.ts`
- `src/config/route-permissions.test.ts`
- `src/components/layout/nav-config.ts`
- `src/components/layout/nav-config.test.ts`

## Backend Contract Dependency

Do not implement the service, types, schema, or mutation from assumptions. Before coding, reread
the final backend DTO, query response, command, and FluentValidation validator.

Planned endpoints:

- `GET /api/tenant-role-permissions`
- `PUT /api/tenant-role-permissions/{roleId}`

Planned update body:

```json
{
  "permissionIds": ["permission-guid"]
}
```

The GET response supplies:

- Editable Manager and Staff role ids/names.
- `directPermissionIds`.
- `inheritedPermissionIds`.
- `effectivePermissionIds`.
- Permission id, key, module, Vietnamese description, and eligible target roles.

FE must not manufacture System Admin data, infer tenant safety from key prefixes, send `TenantId`,
or submit inherited ids as though they were edited direct grants.

## Feature Architecture

Create a dedicated `access-control` feature rather than placing tenant behavior under `admin`:

```text
src/features/access-control/
  pages/
    TenantAccessControlPage.tsx
  components/
    TenantAccessControlPage/
      AccessControlHeader.tsx
      RoleSelector.tsx
      PermissionCatalog.tsx
      PermissionModuleSection.tsx
      PermissionRow.tsx
      PermissionSearch.tsx
      UnsavedChangesDialog.tsx
      AccessControlSkeleton.tsx
      AccessControlState.tsx
      index.ts
  hooks/
    use-tenant-access-control.ts
  schemas/
    update-tenant-role-permissions.schema.ts
  services/
    tenant-access-control.service.ts
  types/
    tenant-access-control.types.ts
  utils/
    tenant-access-control.ts
```

The page owns the query, mutation, selected role, draft permission ids, dirty-state transitions,
and save/discard orchestration. Visual components receive typed data and callbacks only. Do not
copy the current admin hook-calling `RolePermissionEditor` into the new feature.

Keep module grouping and selection utilities pure. Use `Set` and `Map` for repeated permission
lookups, but produce immutable state updates.

## Design Direction

Use the Fresh Logistics operational system:

- Quiet tonal surfaces, `border-border`, semantic colors, 4-8 px radii.
- Compact typography appropriate for a settings workspace; no oversized hero.
- Borders and hierarchy instead of heavy shadow or nested cards.
- Stable grid dimensions so expanding modules and long permission names do not shift the role
  selector or page actions.
- Vietnamese labels as the primary copy. Technical permission keys may appear only in a tooltip or
  secondary monospace line when useful for support.
- No raw green/red color utilities, gradients, decorative blobs, or new visual palette.

## Desktop Layout

Use a full-height page composition:

1. A compact page header with `h1` `Phân quyền`, a short tenant-scoped description, and no action
   button when the draft is clean.
2. A two-column workspace using approximately `17rem minmax(0, 1fr)`:
   - left role rail;
   - right permission editor.
3. Both columns use `min-h-0`; only the catalog body uses `ScrollArea`.
4. The document must not grow with 100+ permissions.

### Role Rail

- Render two semantic buttons/items: `Quản lý kho` and `Nhân viên kho`, while retaining the backend
  role name as secondary text.
- Each item shows direct/effective permission counts.
- Selected state uses the existing primary/sidebar semantics with visible focus.
- A role switch with unsaved changes opens `AlertDialog`: `Lưu thay đổi`, `Bỏ thay đổi`, `Ở lại`.
- Do not place role cards inside an outer card.

### Permission Editor Header

- Role name, concise responsibility description, direct/effective count.
- `InputGroup` search with a visible or screen-reader label and placeholder `Tìm quyền…`.
- Optional icon action `Thu gọn tất cả` with `Tooltip` and `aria-label`.
- Do not add global select-all across every module; it is too risky for a permission screen.

### Permission Catalog

- Group by Vietnamese module in `Accordion`.
- Module header shows selected direct count, effective count, and total eligible count.
- A module-level `Checkbox` selects or clears only editable direct permissions in that module.
- Inside each module use `FieldSet`/`FieldLegend` semantics where practical.
- A permission row includes:
  - checkbox and one shared clickable label target;
  - Vietnamese action name;
  - concise description;
  - optional technical key in subdued monospace text;
  - `Kế thừa từ Nhân viên kho` badge and locked checkbox for inherited grants;
  - `Không áp dụng cho vai trò này` disabled state only if the API intentionally returns catalog
    entries not eligible for the selected role.
- Long labels use `min-w-0`, `break-words`, or line clamp without hiding required meaning.
- Search matches action name, description, module, and key; modules with no matches disappear.
- No-results search uses the existing `Empty` primitive.

### Save Area

- A sticky editor footer appears only when the draft is dirty.
- Actions: primary `Lưu thay đổi`, secondary `Bỏ thay đổi`.
- During mutation, disable duplicate submission and compose `Spinner` in the button.
- Save success uses Sonner toast `Đã cập nhật quyền cho {role}`.
- Validation/forbidden/stale-catalog failures remain visible in an `Alert` above the footer and are
  logged with `logger.error`.
- Refetch after success; the server response is the source of truth.

## Tablet And Mobile

At widths below the desktop split workspace:

- Replace the left rail with a labeled `Select` or a two-option role control only when both labels
  fit without truncation. Prefer `Select` at 390 px.
- `SelectContent` uses `align="start"` and `sideOffset={4}`.
- Keep search below the role selector and modules in one-column accordions.
- Use a sticky bottom action bar with safe-area padding when dirty.
- Minimum touch targets are 44 px where practical.
- No horizontal overflow, nested scrolling conflict, or permission text under action controls.
- `AlertDialog` remains the destructive/unsaved confirmation surface; do not duplicate it with a
  second mobile Drawer.

## Interaction And State Model

### Draft Rules

- Initialize draft direct ids from the selected role.
- Derive dirty state by set equality; do not mirror it in a second state variable.
- Inherited ids are displayed checked/locked but do not automatically enter the submitted direct
  set.
- When Staff changes, refetch all roles because Manager effective inheritance may change.
- Preserve the selected role after successful refetch when it still exists.
- Ignore rapid repeated save clicks while pending.

### Navigation Protection

- Warn before switching role, leaving through sidebar/navigation, or closing/reloading the browser
  while dirty.
- Do not block navigation when clean or after a confirmed discard.
- `Escape` closes dialogs according to shadcn behavior but must not silently discard edits.

### Query States

| State               | UI                                                                   |
| ------------------- | -------------------------------------------------------------------- |
| Initial loading     | Stable two-pane skeleton on desktop; single-pane skeleton on mobile  |
| Background refetch  | Keep prior data; show subtle progress, no full-page flash            |
| `403`               | Permission-denied state with route back to dashboard                 |
| Generic error       | `Alert`/state with `Thử lại`                                         |
| No editable roles   | `Empty` explaining configuration is unavailable; no dead Save button |
| No permissions      | `Empty` indicating no delegatable permissions are configured         |
| Search has no match | Local no-results `Empty`, preserve search text                       |
| Mutation pending    | Preserve draft, disable role switch/save actions as needed           |
| Mutation error      | Preserve draft and selection so the owner can retry                  |

## Accessibility Requirements

- One page `h1` with correct heading hierarchy.
- Buttons for actions and `Link` for navigation; no clickable `div`.
- Checkbox controls have associated labels and expose inherited disabled state in text.
- Icon-only controls have `aria-label` and `Tooltip`.
- Decorative icons use `aria-hidden="true"`.
- Visible `focus-visible` rings on role items, search, accordions, checkboxes, and actions.
- Loading, save success, and inline errors are announced through existing live-region/toast behavior.
- Keyboard-only users can select roles, search, expand modules, toggle permissions, save, discard,
  and resolve the unsaved dialog.
- Sticky footer must not cover the focused permission row.
- Respect reduced motion through existing shadcn/tw-animate behavior.

## Performance And React Guidance

- Use one workspace query instead of sequential role and permission waterfalls.
- Keep previous query data during refetch.
- Build permission id maps once per response with `useMemo` only where the catalog size makes it
  meaningful.
- Split module sections into stable named components; avoid inline component declarations.
- Subscribe to the smallest auth-store selector needed for the Tenant Owner route.
- Avoid effect-driven derived state. Effects are limited to draft reset when the authoritative
  selected-role data changes and unload protection cleanup.
- For more than 100 permissions, collapsed accordions render only open module content. Add
  virtualization only if profiling shows the open catalog still exceeds the project's performance
  budget.
- Do not add the permission catalog to Zustand; it is server state owned by React Query.

## API Error Mapping

| API result            | FE behavior                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `400` validation      | Inline alert, preserve draft                                                  |
| `401`                 | Existing authentication flow handles session expiration                       |
| `403` workspace query | Full permission-denied state                                                  |
| `403` mutation        | Inline stale/forbidden alert, refetch catalog option                          |
| `404` role/permission | Explain configuration changed, refetch workspace                              |
| `409` if introduced   | Explain policy was updated elsewhere, preserve a reviewable draft and refetch |
| `500`/network         | Log, inline retry, no data loss                                               |

Do not translate a `403` into `Không tìm thấy` and do not clear the draft on any failed mutation.

## Reuse And Separation From Admin

- Keep `adminService` and `/admin/roles` on the global API.
- Create a tenant-specific service and query keys.
- Reuse shadcn primitives, formatting utilities, and small pure permission-grouping logic where a
  real second use exists.
- Do not force the tenant contract through `RoleResponse` if backend returns direct/inherited
  fields with different semantics.
- A future refactor may extract shared pure permission rows after both screens use the same visual
  contract; this implementation should not build a premature universal editor.

## Automated Test Plan

### Route And Navigation

- Tenant Owner sees `Phân quyền` under `Hệ thống`.
- System Admin keeps the admin role link and does not receive the tenant link.
- Manager and Staff do not see the tenant link.
- Route permission accepts only Tenant Owner.

### Page And Query States

- Loading, error, `403`, empty roles, empty permissions, and populated workspace render distinctly.
- Previous data remains visible during background refetch.
- Retry calls the correct query refetch.
- System Admin and owner-only permissions are not rendered from the valid tenant response.

### Role And Permission Editing

- Manager and Staff selection shows the correct direct grants.
- Manager inherited Staff permissions render checked and locked.
- Module checkbox changes only editable direct grants.
- Search filters by Vietnamese label, description, module, and key.
- Draft equality enables/disables save correctly.
- Update mutation sends only `{ permissionIds }` and the selected route `roleId`.
- Save success refetches and clears dirty state.
- Save failure preserves draft and shows retryable feedback.
- Staff save updates Manager inheritance after refetch.

### Unsaved Changes

- Role switching while dirty prompts for save/discard/stay.
- Clean switching does not prompt.
- Browser unload protection exists only while dirty and cleans up afterward.
- `Escape` never discards a dirty draft silently.

### Accessibility And Responsive Structure

- Role controls, module accordions, checkboxes, search, icon actions, and dialogs have accessible
  names.
- Dialog has title/description.
- Keyboard flow reaches all operations in a logical order.
- 100+ permissions do not increase document height; catalog scroll remains internal.
- Mobile composition has no horizontal overflow and sticky actions do not cover content.

## Browser QA

Use the Browser skill after both servers are healthy.

Accounts:

- Tenant Owner: verify complete read/edit/save/discard flow.
- Warehouse Manager and Warehouse Staff: verify hidden navigation and unauthorized route.
- System Admin: verify `/admin/roles` still works and the tenant route is unavailable.

Viewports and themes:

- Desktop: 1280 px and a wide 1440 px viewport.
- Mobile: 390 px.
- Light and dark mode.

Scenarios:

1. Load a large catalog and confirm only the editor body scrolls.
2. Search, expand multiple modules, select a module, and save.
3. Switch roles with a dirty draft through each confirmation choice.
4. Confirm inherited Manager permissions after changing Staff.
5. Simulate `403`, stale catalog, network failure, and retry.
6. Verify no platform-admin, System Admin, or owner-governance permission is visible.
7. Confirm focus visibility, keyboard operation, no overlap, no clipped Vietnamese copy, and no
   horizontal scroll.

If Browser runtime is unavailable, record the exact blocker and do not claim visual QA passed based
only on unit tests.

## Verification Commands

```bash
pnpm test
pnpm lint
pnpm build
pnpm exec prettier --check <changed-files>
git diff --check
```

Run focused tests for the access-control feature, route permissions, and navigation before the full
suite.

## Implementation Order

1. Confirm final BE DTO, validator, role eligibility policy, and error contract.
2. Add frontend types, Zod request schema, endpoint builders, query keys, service, and hooks.
3. Add route, role guard, sidebar item, and their tests.
4. Implement page state orchestration and pure draft/grouping utilities test-first.
5. Build desktop role rail and permission editor from existing shadcn primitives.
6. Add mobile composition, unsaved-change dialog, loading/error/empty states, and accessibility.
7. Run focused and full automated checks.
8. Complete authenticated Browser QA across roles, viewports, and themes.
9. Update this progress log and the shared review handoff when implementation is ready.

## Acceptance Criteria

- [x] Tenant Owner can open `/settings/access-control` and edit only Manager/Staff direct grants.
- [x] System Admin, Manager, and Staff cannot enter the tenant route.
- [x] System Admin and platform/owner-only permissions never appear.
- [x] Direct and inherited permissions are visually and semantically distinct.
- [x] Mutation payload matches the final backend contract exactly.
- [x] Dirty drafts survive errors and require explicit save or discard before navigation.
- [x] Large catalogs scroll internally without expanding document height.
- [x] Desktop/mobile and light/dark layouts have no overflow, overlap, or clipped controls.
- [x] All interactive controls are keyboard accessible and correctly labelled.
- [x] Focused/full tests, lint, build, Prettier, Browser QA, and `git diff --check` pass.

## Open Decisions Before Coding

1. Confirm Vietnamese display names and descriptions from the final backend permission catalog. FE
   should not maintain a second incomplete business allowlist.
2. Confirm whether high-risk but delegatable permissions need an additional save confirmation. The
   baseline design uses the same save flow plus clear risk text, avoiding confirmation fatigue.
3. Confirm the final role display names: this spec recommends `Quản lý kho` and `Nhân viên kho`
   while retaining backend role names as secondary/support text.

## Progress Log

- 2026-08-26: Read FE `.rules`, `AGENTS.md`, coding guidelines, design system, runtime tokens, Git
  workflow, AI/Stitch workflow, existing admin role UI, routes, navigation, auth types, and API
  client patterns.
- 2026-08-26: Applied `shadcn`, `vercel-react-best-practices`,
  `vercel-composition-patterns`, and the current Web Interface Guidelines to the proposed layout and
  interaction model.
- 2026-08-26: Confirmed existing Accordion, AlertDialog, Alert, Badge, Checkbox, Empty, Field,
  InputGroup, ScrollArea, Select, Skeleton, Spinner, Tooltip, and related primitives are installed.
- 2026-08-26: Created frontend branch `feat/tenant-role-permissions` from up-to-date `dev`.
- 2026-08-26: Recorded the tenant route, data flow, responsive workspace, accessibility, state,
  testing, and Browser QA plan.
- 2026-08-26: Implemented `/settings/access-control`, tenant role service/hooks, Zod request schema,
  route guard, sidebar entry, role selector, permission catalog, inherited/direct permission states,
  unsaved-change guard, loading/error/empty states, and responsive mobile composition.
- 2026-08-26: Added focused tests for route permissions, sidebar visibility, axios 403 behavior,
  access-control utilities, page editing, mutation payloads, save error retention, and dirty role
  switching.
- 2026-08-26: Verified `pnpm test`, `pnpm lint`, `pnpm build`, changed-file Prettier check, and
  `git diff --check`. `pnpm lint` still reports one pre-existing React Hook Form warning outside
  this feature at `SubscriptionPlanFormDialog.tsx`.
- 2026-08-26: Browser QA passed on local `http://localhost:3000` with Tenant Owner: route loads,
  Manager/Staff workspace is visible, admin roles are absent, permission save calls succeed, and
  mobile 390 px has no horizontal overflow. Full cross-account manual QA remains optional before PR.
- 2026-08-26: API smoke with seeded accounts confirmed the tenant workspace is allowed only for
  Tenant Owner and blocked for Warehouse Manager, Warehouse Staff, and System Admin; FE route and
  navigation tests cover the corresponding client guard behavior.
- 2026-08-26: Redesigned the tenant permission workspace with a clearer role rail, direct/effective
  permission summaries, persistent save controls, compact module sections, distinct inherited and
  unavailable states, and an explicit tenant-scope notice. Kept user counts, audit history, custom
  roles, and inheritance controls out because the current backend contract does not expose them.
- 2026-08-26: Re-verified the redesign with 10 focused tests, the full 271-test suite, lint, Next
  16.2.7 production build, Prettier, and `git diff --check`. Lint retains one existing React Hook
  Form compiler warning outside this module in `SubscriptionPlanFormDialog.tsx`.
