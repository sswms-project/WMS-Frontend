# WMS-272 Tenant User Permission Overrides — Frontend Specification

## 1. Document control

| Field             | Value                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Date              | 2026-09-10                                                                                                                           |
| Jira              | WMS-272 — `[Frontend] Tenant User Permission Overrides`                                                                              |
| Epic              | WMS-268 — `[Frontend] Organization & Staff`                                                                                          |
| Source branch     | `dev` at `286e249`                                                                                                                   |
| Working branch    | `feat/wms-272-tenant-user-permission-overrides`                                                                                      |
| Backend companion | [WMS-271 Backend Specification](../../../../SSWMS-Backend/docs/features/2026-09-10-wms-271-tenant-user-permission-overrides-spec.md) |
| Status            | `NEEDS_FIX_AFTER_RUNTIME_REVIEW` — runtime UUID contract mismatch and review findings remain before Visual QA                        |

### Progress legend

- `[x]` completed and evidenced.
- `[~]` in progress or implemented but not fully verified.
- `[ ]` not started.
- A phase is complete only after implementation, tests and visual evidence are complete.

## 2. Objective

Extend the existing Tenant Owner `Phân quyền` workspace with two clear modes:

```text
Phân quyền
├── Vai trò
└── Quyền cá nhân
```

`Vai trò` preserves the current role-level editor. `Quyền cá nhân` lets the Owner choose a Manager
or Staff member, see their role and assigned warehouses, and customize their effective permission
checkboxes. The screen never asks the user to understand Grant or Deny. A checked box means the
person currently has that permission; an unchecked box means they do not.

Personal differences are marked `Tùy chỉnh`, can be filtered, saved as one complete selection and
reset with `Khôi phục quyền mặc định`.

## 3. Rules and existing architecture

Implementation follows, in order:

1. FE `.rules` and `AGENTS.md`.
2. `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md` and existing runtime tokens.
3. Existing `src/features/access-control` patterns and installed shadcn primitives.
4. Page-owned React Query server state; display components receive typed props/callbacks only.
5. React/Next performance guidance: no request waterfalls, effect-derived state or unnecessary
   global state.

Current code already provides:

- `/settings/access-control` with Tenant Owner route protection and sidebar entry;
- `TenantAccessControlPage` owning the role workspace query/mutation;
- `AccessControlWorkspace` orchestrating selected role, draft sets, search and unsaved changes;
- `RoleSelector`, `PermissionEditorHeader`, `PermissionCatalog`, module/row components and states;
- tenant-specific service, hooks, Zod schema, endpoint builders and query keys;
- staff list/detail contracts and warehouse summaries;
- shadcn `Tabs`, `Select`, `Command`, `Popover`, `Badge`, `Checkbox`, `ToggleGroup`, `AlertDialog`,
  `ScrollArea`, `Skeleton`, `Tooltip` and `Empty` primitives.

The feature extends this architecture. It does not copy the permission matrix into the staff
feature or create a second route.

## 4. Scope

### In scope

- Preserve the current `Vai trò` editor as the default tab.
- Add a `Quyền cá nhân` tab visible only in the already Tenant Owner-only route.
- Select target role, then search/select one active employee in that role.
- Show selected employee identity, current role and warehouse assignments.
- Display the same server-provided delegatable permission catalog as checkboxes.
- Mark and filter permissions that differ from the role default.
- Save, discard local edits and reset all personal differences to role defaults.
- Protect dirty drafts on tab, role, employee and route navigation.
- Responsive, accessible loading/error/empty/conflict behavior and automated/visual QA.

### Non-goals

- Displaying `Allow`/`Deny` controls or exposing backend override rows.
- Editing role, status or warehouse assignments from the permission screen.
- Custom roles, permission templates or bulk personal assignment.
- Showing Tenant Owner or System Admin as selectable subjects.
- Warehouse-specific permission matrices.
- Redesigning `/admin/roles` or moving this page into Platform Administration.
- Inventing permission eligibility from FE key prefixes; BE remains authoritative.

## 5. Backend contract dependency

Implementation must reread the final BE DTOs/validators before writing types or services. The
planned contract is:

- `GET /api/tenant-role-permissions` — existing roles and delegatable catalog;
- `GET /api/tenant-user-permissions/subjects` — paginated active Manager/Staff selector;
- `GET /api/tenant-user-permissions/{userId}` — subject, warehouse scope, role defaults, overrides
  and effective ids;
- `PUT /api/tenant-user-permissions/{userId}` — complete desired effective selection;
- `POST /api/tenant-user-permissions/{userId}/reset` — remove all differences.

Planned save body:

```json
{
  "expectedRoleId": "guid",
  "permissionIds": ["permission-guid"]
}
```

Planned reset body:

```json
{
  "expectedRoleId": "guid"
}
```

FE never sends `tenantId`, Grant/Deny flags, role-default rows, warehouse ids or permission objects.
The selected route user id and final effective permission id set are sufficient.

## 6. Information architecture and layout

### Page shell

Keep the current compact B2B settings page:

1. Existing header: `Phân quyền`, tenant-scoped supporting text.
2. One top-level `TabsList` directly below the header:
   - `Vai trò`;
   - `Quyền cá nhân`.
3. Only the selected tab content is mounted/fetched where practical.
4. The permission catalog scrolls inside a bounded workspace; the whole page must not grow to the
   height of a 100+ item catalog.

Default on every fresh page visit: `Vai trò`. Do not remember the personal tab globally or open it
automatically because that consumes more space and makes the higher-risk editor less predictable.

### Desktop personal-permission layout

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ Phân quyền                                                               │
│ Quản lý quyền theo vai trò và tùy chỉnh cho từng nhân sự.                │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Vai trò ] [ Quyền cá nhân ]                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ Chọn nhân sự                                                             │
│ ┌──────────────────────┐  ┌────────────────────────────────────────────┐ │
│ │ Vai trò              │  │ Nhân sự                                   │ │
│ │ Nhân viên kho      ▾ │  │ Tìm theo tên hoặc email…                ▾ │ │
│ └──────────────────────┘  └────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ Nguyễn Văn A · staff@example.com                     [3 quyền tùy chỉnh] │
│ Nhân viên kho · Kho FPT-01, Kho FPT-02                                   │
├──────────────────────────────────────────────────────────────────────────┤
│ Tìm quyền…             [Tất cả] [Đã tùy chỉnh]   [Khôi phục mặc định]   │
├──────────────────────────────────────────────────────────────────────────┤
│ Danh mục quyền theo module — vùng cuộn nội bộ                            │
│ ☐ / ☑  Tên quyền             Mô tả                         [Tùy chỉnh]   │
├──────────────────────────────────────────────────────────────────────────┤
│ 4 thay đổi chưa lưu                           [Bỏ thay đổi] [Lưu thay đổi]│
└──────────────────────────────────────────────────────────────────────────┘
```

### Selection area

- Use a quiet bordered section, not nested elevated cards.
- Field 1: labeled role `Select` with only `Quản lý kho` and `Nhân viên kho` from the existing
  workspace response.
- Field 2: searchable `Popover` + `Command` combobox backed by the paginated subjects endpoint.
- Role must be selected before personnel search is enabled.
- Search is debounced; do not fetch the full tenant directory or filter a large list only in the
  browser.
- Selected name/email remains visible when the result page changes.
- Changing role clears an incompatible selected employee only after dirty-change confirmation.

### Subject summary

After selection, show one compact bordered row:

- full name as primary text and email as secondary text;
- translated role label;
- assigned warehouses as wrapping `Badge` chips, with `+N kho` when the row would become noisy;
- `N quyền tùy chỉnh` neutral badge when count is greater than zero;
- no phone, last-login or unrelated personnel actions.

If there is no assigned warehouse, state `Chưa được gán kho`; do not imply that personal permission
editing grants warehouse access.

### Toolbar and filters

- Keep existing permission search and module grouping.
- Add one semantic filter:
  - `Tất cả quyền`;
  - `Đã tùy chỉnh`.
- Desktop uses `ToggleGroup` with text labels; 390 px mobile uses a labeled `Select` if the segmented
  labels do not fit.
- `Đã tùy chỉnh` matches persisted differences plus unsaved draft differences from the role
  defaults, so the view updates immediately as boxes change.
- Reset is a secondary text button `Khôi phục quyền mặc định`; no icon is required. It is disabled
  when the subject has no persisted/draft differences.
- Search and customized filter compose: a row must match both.

### Permission row semantics

The user sees only:

- checked = the selected person has the permission in the current draft;
- unchecked = the person does not have it;
- `Tùy chỉnh` badge = the draft differs from the role default;
- disabled/unavailable = BE says the permission is not eligible for that role.

Do not display Grant, Deny, inherited-lock language or red/green allow/deny colors in personal mode.
A short muted hint above the matrix explains: `Quyền cá nhân chỉ ghi đè những mục khác với vai trò.`

Role mode retains its current direct/inherited behavior unchanged.

### Action area

- Reuse the current sticky save area within the editor, not a floating page CTA.
- Show a derived change count, `N thay đổi chưa lưu`.
- Actions: `Bỏ thay đổi` and primary `Lưu thay đổi`.
- Pending state disables duplicate requests and relevant selector changes.
- Save success toast: `Đã cập nhật quyền cho {name}`; then refetch authoritative data.
- Mutation failure preserves the entire draft and selected subject.

### Reset confirmation

Use `AlertDialog`:

- title: `Khôi phục quyền mặc định?`;
- description: `{name} sẽ nhận quyền theo vai trò {role}. Mọi tùy chỉnh cá nhân sẽ bị xóa.`;
- actions: `Hủy` and `Khôi phục`;
- reset success refetches detail and subject counts.

Reset is not styled as destructive deletion of the employee. Use normal confirmation hierarchy,
not an alarming full-red surface.

## 7. Responsive and visual rules

### Desktop and tablet

- Reuse the current bounded catalog and `min-h-0`/`min-w-0` containment.
- Selector grid is two columns from medium width and one column below it.
- Toolbar wraps intentionally without causing horizontal scroll.
- Prefer borders and tonal surfaces over shadows; use theme tokens only.
- Radius stays within the project's 4–8 px system.

### Mobile at 390 px

- Tabs remain two equal-width text controls.
- Role select, employee combobox, search and filter stack full width.
- Subject warehouse chips wrap without widening the page.
- Action bar becomes a sticky bottom row with safe-area padding when dirty.
- Buttons remain at least 44 px high where practical.
- Permission text uses `min-w-0` and wraps; checkbox/badge cannot overlap it.
- No page-level horizontal overflow or nested scroll trap.

### Copy and state palette

- Vietnamese is primary; technical permission keys remain secondary/support text only.
- Use semantic theme tokens and existing status variants. No hard-coded hex, raw green/red utility,
  gradient or new visual system.
- Decorative icons, if retained from existing rows, use `aria-hidden="true"`. New icon-only controls
  are unnecessary for this flow.

## 8. Interaction and state model

### Selection state

- `activeMode`: role or personal; initialized to role.
- `selectedSubjectRoleId`: the role filter for subjects.
- `subjectSearch`: debounced server query.
- `selectedSubjectId`: null until the owner explicitly chooses a person.
- `personalFilter`: all or customized; local UI state.

These states stay inside the page/workspace, not Zustand and not the URL for this release.

### Draft state

- Baseline is `effectivePermissionIds` returned for the selected subject.
- Role default is `roleDefaultPermissionIds`.
- Draft is a `Set<string>` initialized from the baseline.
- Dirty state is derived by set equality; customized state is derived by symmetric difference from
  role defaults. Do not store either as duplicate boolean state.
- The payload contains the draft's complete effective id list and `expectedRoleId`.
- Background refetch must not erase a dirty draft. Surface a stale-data notice and let the owner
  review/refetch explicitly.

### Navigation protection

Dirty changes require confirmation before:

- changing top-level tab;
- changing role filter;
- changing selected subject;
- following sidebar/internal navigation;
- browser reload/close.

The existing unsaved dialog can be generalized to explicit pending destinations. It must support
`Lưu thay đổi`, `Bỏ thay đổi`, and `Ở lại`. `Escape` never discards changes.

### Server-state ownership

`TenantAccessControlPage` owns all new queries and mutations, error mapping, toasts and query
invalidation. Display components receive typed values and callbacks only.

Suggested hooks:

- `usePermissionSubjectsQuery(params, enabled)`;
- `useTenantUserPermissionsQuery(userId, enabled)`;
- `useUpdateTenantUserPermissionsMutation()`;
- `useResetTenantUserPermissionsMutation()`.

Fetch the existing role workspace and subject list in parallel when personal mode/role selection
allows it. Fetch subject detail only after selection. Keep prior subject pages during search where
the installed React Query version supports it.

### Query invalidation

After save/reset invalidate:

1. selected personal workspace;
2. subject list/count queries;
3. any access-control summary query using customized counts.

Do not invalidate unrelated staff tables, warehouses or global admin RBAC. The current actor cannot
select themselves, so refetching `/auth/me` is unnecessary.

## 9. Feature architecture

Extend `src/features/access-control`:

```text
src/features/access-control/
  pages/TenantAccessControlPage.tsx
  components/TenantAccessControlPage/
    AccessControlModeTabs.tsx
    AccessControlWorkspace.tsx
    PersonalPermissionWorkspace.tsx
    PermissionSubjectSelector.tsx
    PermissionSubjectSummary.tsx
    PermissionCustomizationFilter.tsx
    ResetUserPermissionsDialog.tsx
    PermissionCatalog.tsx
    PermissionModuleSection.tsx
    PermissionRow.tsx
    UnsavedChangesDialog.tsx
  hooks/use-tenant-access-control.ts
  schemas/update-tenant-user-permissions.schema.ts
  schemas/reset-tenant-user-permissions.schema.ts
  services/tenant-access-control.service.ts
  types/tenant-access-control.types.ts
  utils/tenant-access-control.ts
```

Exact component boundaries may be consolidated when a component would be trivial, but avoid one
large page and avoid boolean-prop proliferation.

Use an explicit row view model instead of overloading role-mode flags:

```ts
type PermissionRowViewModel = {
  permission: TenantPermissionResponse
  checked: boolean
  editable: boolean
  presentation: 'role-direct' | 'role-inherited' | 'personal-default' | 'personal-customized'
}
```

The public UI maps `personal-customized` to `Tùy chỉnh`; it does not expose backend effect names.
Pure utilities calculate set equality, customized ids, module counts and filtered groups and receive
focused unit tests.

### Endpoints, query keys and schemas

Extend:

- `src/routes/api-endpoints.ts` with subject/detail/update/reset builders;
- `src/lib/query-keys.ts` with stable keys including filter params and subject id;
- tenant access-control types for subject list/workspace only after checking final BE DTOs;
- Zod mutation schemas mirroring backend validation exactly;
- tenant-specific service; do not reuse `adminService`.

No new dependency is expected. Use installed shadcn components and Lucide only where an existing
control already needs an icon.

## 10. State and error behavior

| State / API result       | UI behavior                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------- |
| Role mode initial        | Existing editor unchanged                                                           |
| Personal tab, no role    | Prompt to choose role; employee control disabled                                    |
| Role has no active staff | `Empty`: `Không có nhân sự phù hợp`                                                 |
| No employee selected     | Quiet instructional empty state; no permission matrix                               |
| Subject detail loading   | Stable summary/editor skeleton; no page flash                                       |
| `400` invalid payload    | Inline alert; preserve draft                                                        |
| `401`                    | Existing auth/session handling                                                      |
| `403` query              | Permission-denied state; no data leak                                               |
| `403` mutation           | Explain permission is no longer available; preserve draft and offer refetch         |
| `404 USER_NOT_FOUND`     | Clear selection and explain employee is unavailable                                 |
| `409 USER_ROLE_CHANGED`  | Keep a reviewable draft, state that the role changed, then require refetch/reselect |
| `409 USER_NOT_ACTIVE`    | Clear the editor after acknowledgement; do not offer retry save                     |
| Network/`500`            | Log with `logger.error`, inline retry, preserve safe local state                    |
| Search no result         | Local/server no-results state, retain query text                                    |
| Customized filter empty  | `Không có quyền tùy chỉnh` with action to return to all permissions                 |

Never translate `403` to not-found and never clear a draft merely because a mutation failed.

## 11. Accessibility

- Keep one page `h1` and correct section heading order.
- Top tabs, role select, employee combobox, filters, checkboxes and dialogs have accessible names.
- Use buttons for actions; no clickable `div`.
- Combobox exposes `aria-expanded`, selected value and keyboard search/navigation.
- Checkbox and one shared text label form a reliable target.
- `Tùy chỉnh` is conveyed in text, not color alone.
- Reset/unsaved dialogs include title and description and restore focus to the trigger.
- Visible `focus-visible` state remains on every interactive element.
- Loading/save/reset outcomes use existing live region/toast behavior.
- Sticky action area does not cover focused rows; reduced-motion settings are respected.

## 12. Automated test plan

### Contract and hooks

- Endpoints build exact subject/detail/update/reset paths.
- Query keys distinguish role, search, page and user id.
- Zod accepts valid effective id arrays and rejects malformed ids/role ids.
- Save sends `{ expectedRoleId, permissionIds }`; reset sends only `{ expectedRoleId }`.
- Hooks are enabled only for the correct mode/selection.
- Successful mutations invalidate only the intended access-control queries.

### Page orchestration

- Page opens on `Vai trò` and existing role behavior stays green.
- `Quyền cá nhân` loads role choices without selecting a user automatically.
- Selecting a role enables searchable employees; only selected role results render.
- Selecting a user loads identity, role, warehouses and effective permissions.
- Loading, no-role, no-subject, no-results, forbidden, conflict and generic error states are distinct.
- Failed save/reset preserves selected user and draft where safe.

### Permission behavior

- Checkbox initial state follows effective ids.
- Checking/unchecking updates draft without exposing Grant/Deny copy.
- `Tùy chỉnh` is derived by difference from role defaults.
- `Đã tùy chỉnh` composes with text search and reacts to unsaved edits.
- Save submits the complete effective set once and refetches on success.
- Reset confirmation calls the reset endpoint and restores role defaults.
- Ineligible permissions cannot be toggled even under manipulated component input.
- Permission module counts and bulk module toggles remain correct in both role and personal modes.

### Unsaved changes

- Clean mode/role/subject switching needs no prompt.
- Dirty mode/role/subject/route switching prompts save/discard/stay.
- Browser unload guard exists only while dirty and cleans up afterward.
- Mutation pending prevents duplicate save/reset and selector races.

### Regression, responsive and accessibility

- Current role editor tests remain unchanged and green.
- Tenant Owner-only route/sidebar tests remain green.
- System Admin, Manager and Staff still cannot enter the tenant page.
- Large catalogs retain internal scrolling.
- 390 px layout has no horizontal overflow or covered actions.
- Combobox, tabs, checkbox labels and dialogs are keyboard-operable and named.

## 13. Visual QA plan

Use the authenticated local UI only after BE/FE automated gates are green.

Accounts:

- Tenant Owner: complete role and personal flows.
- Warehouse Manager/Staff: confirm hidden navigation and unauthorized direct route.
- System Admin: confirm global `/admin/roles` remains separate.

Viewports/themes:

- 1440 × 1000 desktop;
- 768 × 1024 tablet;
- 390 × 844 mobile;
- light and dark mode.

Scenarios:

1. Role with many employees: debounce search, keyboard-select a user and paginate/load more.
2. Employee with multiple warehouses and zero overrides.
3. Employee with both checked and unchecked differences; test `Đã tùy chỉnh` plus search.
4. Save changes, sign in as the employee and verify effective access while warehouse scope remains.
5. Reset and verify role defaults return.
6. Trigger dirty confirmation on tab, role, employee and navigation changes.
7. Simulate role-changed/inactive/network failures and confirm draft/data behavior.
8. Inspect page and inner catalog scroll widths; no horizontal scroll, clipped Vietnamese text,
   overlapping badges or hidden sticky actions.
9. Keyboard-only pass and automated accessibility scan where the existing QA setup permits it.

Any temporary staff/override QA data must be explicitly identified and removed after testing. Do
not claim Visual QA passed from component tests alone.

## 14. Verification commands

Run focused access-control tests before the complete suite:

```powershell
pnpm typecheck
pnpm lint
pnpm test -- --run
pnpm build
pnpm exec prettier --check <changed-files>
git diff --check
```

Record exact pass counts and any pre-existing warnings in the progress log. A warning outside the
feature is not silently presented as a clean result.

## 15. Implementation order and progress

| Phase                            | Status      | Deliverable / evidence                                                                                                 |
| -------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------- |
| FE-0 Discovery, Jira and layout  | Completed   | Rules/design/current access-control and staff code reviewed; WMS-272 and branch created; this layout/contract recorded |
| FE-1 Contract layer              | Completed   | BE-aligned types, schemas, endpoints, query keys, service/hooks and contract tests                                     |
| FE-2 Page orchestration          | Completed   | Mode tabs, server search/paging, detail query, draft/filter state and guarded transitions                              |
| FE-3 Permission UI               | Completed   | Explicit role/personal row models, subject summary, customized filter, save/reset/error states                         |
| FE-4 Responsive/accessibility    | In progress | Responsive containment and named semantic controls implemented; full multi-viewport/theme pass remains                 |
| FE-5 Automated verification      | Completed   | 489/489 full tests, typecheck, lint, production build, Prettier and `git diff --check` passed                          |
| FE-6 Visual and cross-account QA | In progress | Authenticated Staff save/reset and Manager/Staff/Admin route isolation passed; full viewport/theme matrix remains      |
| Independent review               | Fixed       | .NET Guid contract, mutation errors, recovery, stale refresh and workflow responsibility findings fixed and covered    |
| PR readiness                     | Not started | Clean tree, mergeability against latest `origin/dev`, commit and push                                                  |

### Checklist

- [x] Correct Organization & Staff epic/task selected.
- [x] Feature branch created from the latest requested `dev` baseline.
- [x] Existing access-control, staff and design-system code reviewed.
- [x] Contract dependency, architecture, layout and test plan completed.
- [x] BE contract finalized and FE types/schemas aligned.
- [x] Personal permission UI and state implemented.
- [x] Save/reset, normalized errors and explicit reload/reselect recovery implemented and covered.
- [x] Automated checks passed.
- [~] Targeted authenticated Visual QA passed; full viewport/theme matrix remains.
- [x] Review findings in section 18 were fixed and regression-tested.
- [ ] Branch confirmed ready for PR.

## 16. Definition of done

- [x] The existing role editor remains the default and behaves exactly as before.
- [x] Tenant Owner can filter by role, search/select an active subordinate and view role/warehouses.
- [x] Personal effective permissions use only checkboxes and clear `Tùy chỉnh` feedback.
- [x] All/customized filtering, search and module grouping work together.
- [x] Save accepts every valid non-empty backend `Guid` and sends the finalized BE contract.
- [x] Reset accepts every valid non-empty backend `Guid` and explicitly restores dynamic role defaults.
- [x] Dirty changes are protected across every relevant navigation transition.
- [x] Ineligible/owner/platform permissions cannot be toggled or manufactured by FE.
- [ ] Desktop/tablet/mobile and light/dark modes have no overflow, overlap or clipped controls.
- [ ] Keyboard/accessibility requirements and automated/frontend gates pass.
- [ ] Authenticated end-to-end QA confirms personal permissions without expanding warehouse scope.

## 17. Progress log

- 2026-09-10: Confirmed personal permission editing belongs in the Tenant Owner Organization &
  Staff access-control flow, not Platform Administration.
- 2026-09-10: Created Jira task WMS-272 and assigned it to Tống Viết Huy.
- 2026-09-10: Created `feat/wms-272-tenant-user-permission-overrides` from current `dev`.
- 2026-09-10: Reviewed FE repository rules, coding/design guidance, existing role permission page,
  staff queries/types and installed UI primitives.
- 2026-09-10: Frozen the two-tab information architecture, role-first personnel selector, subject
  summary, checkbox-only override semantics, customized filter, reset flow, responsive layout and
  QA plan.
- 2026-09-10: Implemented the final WMS-271 API contract in FE, including exact query/payload
  shapes, Zod validation, scoped React Query keys/invalidation and service/hook tests.
- 2026-09-10: Implemented role-first server search and paging, employee summary, checkbox-only
  effective permission editing, derived customization filter, save/reset and dirty navigation
  protection while preserving the existing role editor as the default.
- 2026-09-10: Automated verification passed: focused access-control tests 26/26, full suite
  482/482, typecheck, lint, production build and `git diff --check`. Authenticated multi-viewport
  and cross-account Visual QA remains intentionally open and is not claimed by component tests.
- 2026-09-10: Runtime review reproduced Staff save failure before the HTTP request. The live API
  returns role id `1a13e448-0388-da07-2782-cf395c564951`, which is a valid non-empty .NET `Guid`
  but fails Zod's RFC UUID validator. Manager id passes the stricter validator and all 17 inspected
  permission ids pass, explaining why the automated v4-only fixtures missed the Staff defect.
- 2026-09-10: Replaced the RFC-only request validator with the shared canonical non-empty .NET Guid
  contract, normalized validation/API errors and added explicit conflict, unavailable-subject and
  dirty-refresh recovery. Navigation interception moved into a focused hook.
- 2026-09-10: Targeted authenticated QA selected Warehouse Staff Demo, saved a two-permission
  difference using the deterministic Staff role id, observed the customized state and reset it to
  role defaults. Manager, Staff and System Admin direct access all resolved to `/unauthorized`.
  Full verification passed with 32/32 focused and 488/488 frontend tests plus typecheck, lint and
  production build; no temporary override data remains.
- 2026-09-10: Fixed the transient stale-data alert caused by the successful save/reset refetch
  arriving before `mutateAsync` settled. Reconciliation now ignores the mutation-owned refresh
  while pending. Regression coverage passed 33/33 focused and 489/489 full tests; clean production
  build passed after removing corrupted generated `.next` assets. The exact pre-test Staff
  permission state was restored.

## 18. Runtime and business review findings — 2026-09-10

### Review result

`NEEDS_FIX`

No application source was changed during this review. The findings below were reproduced or traced
through the current FE -> API -> BE flow and must be resolved before authenticated Visual QA or PR
readiness is claimed.

### High

1. **Staff save and reset are blocked by a FE/BE identifier-contract mismatch.** The backend
   contracts use non-empty `Guid` values and the seeded role ids are generated by `GuidFactory`.
   `Warehouse Staff` resolves to `1a13e448-0388-da07-2782-cf395c564951`, which .NET accepts but
   `z.string().uuid()` rejects because it does not carry an RFC-compatible version/variant. Both
   update and reset schemas therefore throw before Axios runs. Use one shared canonical .NET-Guid
   schema for these request identifiers, reject `Guid.Empty`, and add the actual deterministic Staff
   and Manager role ids to contract tests. Apply the same rule anywhere FE claims to mirror a BE
   `Guid` validator rather than an RFC UUID contract.

### Medium

1. **Mutation error types and presentation do not cover client validation failures.** The service
   can throw `ZodError`, while the React Query mutations declare only `ApiErrorResponse`. Hook-level
   logging/toast then exposes the serialized Zod issue and the workspace also renders a second
   generic error. Normalize unknown client/API errors once, retain useful developer diagnostics,
   and show one concise Vietnamese user message.
2. **Conflict and lifecycle recovery do not implement the frozen state model.** `USER_ROLE_CHANGED`
   and `USER_PERMISSION_STATE_CONFLICT` preserve the draft but provide no explicit reload/reselect
   action. `USER_NOT_ACTIVE` and `USER_NOT_FOUND` leave the stale editor selected although the spec
   requires it to be cleared after acknowledgement.
3. **Dirty background refresh is silently ignored.** The editor correctly avoids overwriting the
   draft, but it does not surface the required stale-data notice or an explicit reconciliation
   action. The Owner can continue editing against an outdated baseline without knowing the server
   state changed.
4. **The current tests validate only random RFC-compatible v4 ids.** They do not exercise the live
   deterministic role ids, service-level schema rejection, conflict recovery, inactive/not-found
   selection clearing, or dirty-background-refetch behavior. Green component/unit results therefore
   did not protect the failing production path.
5. **`PersonalPermissionWorkspace` has accumulated unrelated responsibilities.** At roughly 445
   lines it owns navigation interception, draft reconciliation, mutation recovery, filters and
   rendering. Split the state/workflow logic into focused feature hooks or components before adding
   more recovery behavior, in line with the repository component-responsibility rules.

### Cross-stack backend findings

The required BE review record is maintained in
`SSWMS-Backend/docs/AI_REVIEW.md`. That review originally identified replacement concurrency and
secondary-tenant permission resolution; both are resolved in the fix record below.

## 19. Fix resolution — 2026-09-10

`FIXED`

- The shared request schema accepts canonical .NET Guid values, including the deterministic Staff
  and Manager role ids, while rejecting `Guid.Empty` and malformed values.
- Unknown mutation errors are normalized once; the UI exposes one concise message and a stable
  recovery action instead of serializing Zod issues to the user.
- Permission-state conflicts and dirty server refreshes require explicit reload; role changes
  require reselect; inactive or removed subjects are cleared.
- Personal dirty-navigation interception is isolated in a focused hook, reducing the workspace's
  responsibility before further behavior is added.
- The BE cross-stack findings were also resolved: writes share a tenant concurrency boundary and
  runtime permission lookup supports active secondary-tenant memberships.
