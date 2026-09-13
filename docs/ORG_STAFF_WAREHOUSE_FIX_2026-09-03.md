# Organization and staff: warehouse assignment fix

## Final dev synchronization - 2026-09-04

- Fresh fetch advanced BE `origin/dev` to `919ffb5` and FE `origin/dev` to `5857b1a` before delivery. FE fast-forwarded cleanly. BE merged the new platform-services work and resolved one overlap in the manager-assignment handler by preserving both tenant concurrency protection and the new audit/notification workflow.
- Verification after that merge: BE full suite 202/202 passed; FE TypeScript passed; Staff plus logout regression tests passed 56/56 with one worker. A concurrent FE full-suite attempt passed 99 files and 350 tests before the worker pool was exhausted; its lone `UserMenu` timeout passed in the sequential rerun.
- No direct dev/main write, PR merge, migration/seed execution, shared database access, invoice edit, or unrelated application change is part of this delivery.

## Delivery preparation - 2026-09-03

- User approved syncing dev and committing/pushing the FE and BE fix branches, not pushing directly to dev or merging PRs.
- Actual BE branch is now based on `origin/dev` at `7440f6b`; FE is based on `origin/dev` at `fc95bb9`. Git auto-merged the two BE repository files cleanly when restoring the local fix. There were no manual conflicts to resolve.
- BE tests on the actual updated branch: 190/190 passed. FE focused tests: 54/54 passed. The immediately preceding review passed FE TypeScript, scoped ESLint and production build; application source in FE has not changed since that build. The prior complete FE suite passed 435/435.
- Both branches retain the name `fix/wms-82-83-staff-warehouse-assignment`. Commit only task source/tests and review notes; generated integration snapshots and smoke artifacts remain outside the repositories. No invoice changes, migration/seed execution, or shared database writes.
- Merge/deploy BE before FE. Live SQL Server/email validation and independent-agent approval remain outside this delivery.

## Final pre-commit review - 2026-09-03

- No remaining Blocker/High finding identified in the five fixes and their direct regressions. This is a final review by the same Codex task, not an independent-agent review. No application source was changed during this review.
- FE: fetched origin/dev remains `fc95bb9`, equal to branch HEAD. Focused staff tests re-run: 54/54 passed. TypeScript, scoped ESLint (staff and radio-group), git diff --check, and the normal Next.js production build passed. Approved network access allowed Google Fonts to download; the earlier build blocker below is resolved without source/config changes. The prior full FE suite remains 435/435; it was not re-run in this final review.
- BE: branch HEAD is still `fe545f5`, while freshly fetched origin/dev is `7440f6b` (2 commits ahead, PR #112 fixing internal forecasting tenant filters). The overlapping files are Application/Interfaces/IGenericRepository.cs and Infrastructure/Persistence/Implementations/GenericRepository.cs. Incoming patches apply cleanly to the local working tree in check-only mode.
- BE current working-tree tests re-run: 190/190 passed. A separate generated snapshot at `../artifacts/be-precommit-integration` contains origin/dev `7440f6b` plus the complete local tracked patch and untracked task files. The local patch applies cleanly to that snapshot; restore/build/tests passed, 190/190. This verifies the combined repository overloads without merging or modifying the real branch. Only in-memory/SQLite test databases were used, not the application database.
- Both actual branches remain `fix/wms-82-83-staff-warehouse-assignment`, with no staged files or unmerged index entries. No invoice changes, commit, push, PR, Jira update, migration/seed execution, or backend startup was performed. Fetch updated only local remote-tracking refs.
- Before delivery: synchronize the actual BE branch with origin/dev while preserving the local fix, then commit only task files. BE must be deployed before the FE that calls the new warehouse-assignment endpoints/permission. The generated integration snapshot and patches are outside both repositories and must not be included in either commit.
- Residual verification limits: no live SQL Server/email acceptance test and no independent reviewer approval. Mergeability is verified against the fetched hashes above, not a promise about future remote changes.

## Local fix round - 2026-09-03

The user explicitly authorized fixing all five findings below. All changes remain local on `fix/wms-82-83-staff-warehouse-assignment` in FE and BE. No commit, push, migration, seed, real invitation/email, or shared database write was performed.

1. **Fixed - anonymous acceptance:** Warehouse lookup and existing-assignment lookup explicitly use the validated invitation tenant when bypassing the ambient JWT filter. Vacancy checks use the same tenant scope and still reject occupied warehouses, including inactive manager memberships. Global tenant filters were not changed. Existing repository overloads are reused; no new infrastructure contract or layer was introduced in this fix round.
2. **Fixed - stale draft:** The first edit captures a separate assignment snapshot. The request keeps its original expectedWarehouseIds; a query/cache update affecting warehouse assignments, status, or manager identity blocks editing/saving and offers explicit reload. Failed reload keeps the draft and conflict guard. Reload never silently saves the old draft.
3. **Fixed - replacement confirmation:** React Hook Form stores the exact confirmed warehouse/manager pairs, not an independent boolean. Changing selection clears confirmation. Changed server data blocks saving; after reload, the user must select and confirm the new manager again.
4. **Fixed - more than 100 warehouses:** Invitation picker requests pages of 100 with skip and needTotalCount, using the existing query key and API. Only the requested page is fetched. Pagination is disabled while fetching; a selected warehouse remains visible when changing pages. No unbounded load-all request loop was added.
5. **Fixed - form/schema rules:** Added a command-specific Zod schema and inferred UpdateStaffWarehousesRequest type. It rejects malformed/empty GUIDs and duplicate IDs or replacement warehouse keys, matching BE validation. A contextual schema enforces Staff's active-warehouse rule. The orchestrator owns React Hook Form; the dialog receives the form and renders field errors.

Verification:

- BE: 190/190 tests passed, including real anonymous UserContext with in-memory EF repositories, cross-tenant/inactive/expired/invalid-token rejection, occupied-manager rejection, returning Staff without duplicate assignment, and repeated token rejection. This is not live SQL Server/email verification.
- FE focused tests: 54/54 passed, including original failures, successful reconfirmation after reload, failed reload, warehouse 101 selection and retention, loading/empty/error states, and schema validation.
- FE full suite: **435/435 tests passed across 111 files**, final run 227.50s. The first full run timed out only in the new multi-step pagination test at its default 5s limit while build/browser checks also ran. Replaced unnecessary per-character typing and set a 15s timeout for that integration case only; the complete rerun passed. No global timeout or production behavior was changed to accommodate the test.
- Scoped ESLint, TypeScript and git diff --check passed.
- Browser mock smoke: passed at 1440x1000 and 390x844, with 16 mock requests per viewport and one intercepted assignment write each. Warehouse 101 is selectable and retained across pages; replacement requires confirmation. No page errors. External analytics scripts and realtime are stubbed; realtime-unavailable console diagnostics are expected in this harness.
- Screenshots/results: `../artifacts/staff-review-invite-1440.png`, `../artifacts/staff-review-invite-390.png`, `../artifacts/staff-review-assignment-1440.png`, `../artifacts/staff-review-assignment-390.png`, `../artifacts/staff-review-smoke-results.json` (relative to FE repository root).
- Production build is **not verified**: Google Fonts requests failed in the restricted environment. The escalation request was rejected because the approval backend returned HTTP 404. No font/config workaround or unrelated source changes were made. Re-run the normal build with approved network access before release.
- Existing limitations remain: no real backend startup/shared database testing in this round; no independent reviewer has approved this implementation. Self-review used project rules and Vercel React Best Practices; UI review used UI/UX Pro Max and existing design tokens/primitives.
- FE dev server used for mock verification remains at `http://localhost:3001`; the backend was not started. Browser mocking exists only in the smoke script, not in application source.

## Pre-commit re-review: NOT READY (historical, before the fix round above)

The additional review supersedes the earlier passing-test readiness impression. Production source was not changed during this review; regression tests and this record were added.

1. **High - Anonymous invitation acceptance cannot find the initial warehouse.** AcceptInvitationCommandHandler.cs:34 uses a normally tenant-filtered repository. An anonymous recipient has IUserContext.TenantId = null, so the valid invitation's warehouse is excluded. Both Staff and Manager regression cases fail with NotFoundException. Earlier fixtures supplied the invited tenant as the authenticated context and missed this behavior. Fix must scope reads explicitly to the tenant from the validated invitation, including warehouse-user vacancy/assignment checks, without weakening global tenant filters.
2. **High - A refreshed query silently replaces the optimistic snapshot of an unsaved draft.** StaffWarehouseAssignment.tsx:45 reads initialIds from live query data while selection remains local. With draft [A,B] and refreshed server assignments [A,C], the request sends expected [A,C], desired [A,B], allowing removal of C without a conflict. Preserve the draft's original snapshot or block saving when it changes. The new mock cache-refresh regression fails.
3. **High - Replacement confirmation is not bound to the confirmed manager.** StaffWarehouseAssignment.tsx:30 derives replacements from live query data while confirmed is just a persistent boolean. If the manager changes after confirmation, the request identifies the new manager without fresh confirmation. Freeze the confirmed warehouse/manager pairs or invalidate confirmation on relevant data changes. The new regression fails. These FE tests explicitly inject a query-data refresh; they do not claim every network reconnect triggers a refresh under the current global query configuration.
4. **Medium - Invite picker stops at the first 100 warehouses.** StaffInvitation.tsx:17 requests top=1000 once, but BE GenericRepository caps requests at AppConstants.MaxPageSize=100. WarehousePicker has no server search or paging. Warehouses after the first page are unavailable in the required selector. Add contract-aligned paging/search or complete bounded loading.
5. **Medium - Assignment form does not yet satisfy FE form/schema rules.** The new update workflow manually validates selection in React state and duplicates its request interface instead of defining a command-specific Zod schema and deriving request types, as required by .rules. Address within the same feature, without changing unrelated pages.

Verification in this re-review:

- Existing BE full suite before adding anonymous regressions: 181/181 passed.
- New BE anonymous acceptance regressions: 0/2 passed, both fail as described above.
- FE focused suite including cache-refresh regressions: 38 passed, 2 failed (40 total).
- Both repositories already use fix/wms-82-83-staff-warehouse-assignment; no new branch required.
- git diff --check passed; no unmerged index entries and no invoice changes. These are local checks, not a new remote mergeability check.
- No commit/push, application-code fix, API startup, shared DB write, or remote write during this review.

## Local delivery

- FE and BE branch: `fix/wms-82-83-staff-warehouse-assignment`.
- Bases checked against origin/dev: FE `fc95bb9`, BE `fe545f5`.
- No commits, pushes, PRs, Jira changes, migrations, seed execution, or shared database writes.
- Rules consulted: both `.rules` and `AGENTS.md`; FE coding, design, AI workflow and Git workflow guides; BE organization/staff workflow notes.
- Skills applied: UI/UX Pro Max, Vercel React Best Practices, Vercel Composition Patterns. Existing shadcn primitives and design tokens retained.

## Approved behavior

1. Staff may belong to multiple warehouses, with at least one active warehouse to work.
2. Managers may manage multiple warehouses; a warehouse has at most one assigned manager.
3. Invitations for both roles require one initial active warehouse. More warehouses can be assigned after acceptance.
4. Replacing a warehouse manager requires confirmation identifying the current manager. Other warehouses of that manager are preserved.
5. A manager may be left unassigned after explicit removal/replacement. No warehouse is selected automatically. Staff cannot be saved without an active warehouse.
6. Invitation acceptance must not replace a warehouse's existing manager.

## Frontend changes

- Correct Radix radio checked-state selectors, including selected-role background. Verified computed colors in a browser.
- Keep the initial warehouse picker visible for both Staff and Manager; require a valid warehouse ID and handle loading/empty/error states.
- Replace the single-warehouse manager dialog with an assignment workspace for both roles: multi-select, local search, pagination, selection count, existing manager names, removal and replacement confirmation.
- Submit all assignment changes in one PUT, including the original assignment snapshot and explicitly confirmed manager replacements.
- A 409 conflict requires reload and renewed confirmation. Prevent duplicate submit while pending.
- Gate invite, invitation management, assignment, deactivate and reactivate actions by permissions from `/auth/me`, not role alone.
- Dialogs are presentational; feature-specific orchestrators own API hooks and form/selection state. Shared query keys and cache invalidation prevent per-row requests.
- Legacy invitations without a warehouse explain why a replacement invitation is needed; resend is unavailable.

## Backend contract

### Invite and accept

- `POST /api/invitations`: `email`, `role`, **required** `warehouseId`.
- `POST /api/invitations/{token}/accept`: existing body unchanged.
- Validate same-tenant active warehouse on send and accept. Manager invitations require a vacant warehouse.
- Legacy invitations without a warehouse are rejected with an actionable conflict. The owner must revoke a Pending invitation and invite again; Expired invitations can be replaced.
- If an existing inactive membership has changed role since the invitation, acceptance is rejected for owner review instead of implicitly changing warehouse access.

### Read and update assignments

- `GET /api/staff/{userId}/warehouses` returns `assignedWarehouseIds` and warehouse options with `id`, `warehouseCode`, `warehouseName`, `status`, `managerId`, `managerName`.
- `PUT /api/staff/{userId}/warehouses` body:

```json
{
  "warehouseIds": ["desired-warehouse-guid"],
  "expectedWarehouseIds": ["original-warehouse-guid"],
  "replacements": [{ "warehouseId": "desired-warehouse-guid", "managerId": "current-manager-guid" }]
}
```

- `replacements` must be empty for Staff. Only include explicitly confirmed replacements for Manager.
- Both endpoints require new owner-only permission `staff:assign-warehouse`.
- Existing `POST /api/warehouses/{warehouseId}/manager` remains available. To replace a manager, pass `expectedManagerId` with `managerId`; omitted confirmation no longer silently replaces anyone.
- Controllers remain ISender-only, commands return Unit, response DTOs live in Contract, handlers use IUnitOfWork and save once.
- Existing GenericRepository gains an includes overload matching its existing Find/GetPaged patterns, to batch-load manager names across global user identities. No new architectural layer or dependency.

## Concurrency and deployment

- Reuse the existing EF concurrency token on Tenant. All assignment writers and invitation acceptance update that token and save through the existing conflict-handling method.
- Atomic EF SaveChanges rolls back the whole write on concurrency failure. SQLite regression verifies an assignment insert is not left behind.
- Scope is deliberately coarse: independent assignment changes within the same tenant can conflict and require retry. Subscription operations using the same token can also trigger a safe retry.
- Inactive managers retain their assignment until explicitly replaced/removed. This prevents reactivation from restoring an unnoticed second manager.
- No schema migration is introduced. Deploy BE before this FE. Normal permission synchronization must add the new permission; startup invalidates owner caches as well as manager/staff caches.
- Do not start this backend against the shared database merely to test UI: its startup runs migrations and seed/sync routines. This delivery did not execute startup.

## Verification

- FE full suite: 418 tests passed across 110 files. Final focused staff suite after the permission regression: 38/38 passed across 10 files.
- FE TypeScript, scoped ESLint, production build: passed. Build required network access for the project's existing Google Fonts.
- BE full test suite: 181 passed, including organization workflows and a SQLite rollback regression. Rerun after the owner cache invalidation adjustment also passed 181/181.
- Browser smoke with mock API: desktop 1440x1000 and mobile 390x844. Checked radio color differs from unchecked; manager replacement requires confirmation; one atomic assignment PUT; no page errors; dialogs fit both viewports.
- Browser API request budget: 13 intercepted calls per viewport, including surrounding layout/realtime requests, below cap 40. All calls were intercepted; no real invitation or assignment was created.
- Local evidence outside both repositories: `D:/LEARN/capstone/Kovia/artifacts/staff-*.png`, `staff-smoke-results.json`, `staff-assignment-smoke.cjs`.
- Review is self-review by Codex following explicit implementation approval, not an independent Claude/Codex review round.

## Remaining team discussion

1. Existing member directory filters active UserTenant memberships, while lifecycle deactivation marks membership inactive. Review discoverability of inactive users and the reactivation workflow separately.
2. Existing staff lifecycle handlers still locate global User by its TenantId, unlike membership-based list/assignment reads. Multi-tenant identities need a consistent lifecycle policy; this fix does not redesign authentication or identity ownership.
3. Warehouse deactivation can leave an existing staff member with no active warehouse. Assignment and warehouse access checks remain restrictive, but a coordinated warehouse-deactivation/reassignment policy needs team agreement.
4. Existing invitation acceptance supports global identities; live authentication/email flows and real SQL Server concurrency were not exercised here. Review with isolated test accounts/database before deployment.
5. Existing legacy data with multiple manager assignments is reported as a conflict, not repaired automatically. Review and correct it with the owner/BE developer.
