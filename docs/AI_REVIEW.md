# AI Review Handoff

## 2026-10-03 — Warehouse layout viewer sidebar search

- Role: Codex implementing the requested viewer-only UI adjustment.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Increased the desktop viewer's left-panel resize ceiling from 33.333% to 40% while preserving the 30% default, 25% minimum and compact Sheet behavior.
- Moved the location search beside `Danh sách vị trí` and added a debounced inventory API search beside `Hàng hóa tại vị trí`; changing location clears the inventory search and returns pagination to page 1.
- Added regressions for header/search alignment, the 40% resize ceiling, disabled inventory search before selecting a location, debounce and search reset.
- Verification: focused tests 4/4, full suite 220/220, typecheck, lint and production build passed.
- No Backend contract, dependency, database, migration, designer interaction or layout persistence changed.

## 2026-10-02 — Permission catalog categories Gate C

- Role: Codex implementing the authorized UI/UX gate.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Reworked the shared permission catalog into desktop category navigation plus a focused module workspace; tablet and mobile use the existing shadcn Select pattern.
- Category navigation shows matching icons and selected/total counts, uses `aria-current`, preserves native keyboard behavior and never mutates the permission draft.
- Search and customized-only views fall back to the first valid category without a synchronization effect and automatically expand matching modules only in the active category.
- Long labels wrap safely, module tri-state selection remains intact, and role/personal editors retain their existing save, discard, recovery and unsaved-change behavior.
- Verification: focused component tests 8/8 passed; full suite 203/203 passed; typecheck, lint and production build passed. The four full-suite timeouts seen while build and tests competed for resources passed both in an isolated rerun (22/22) and the standalone full suite.
- GitNexus pre-change impact was LOW for all changed components. Final change-impact review is recorded before the Gate C commit.
- No dependency, database, migration, seed, API write or deployment configuration was changed.

---

## 2026-10-03 — Admin permission catalog redesign

- Task: Redesign the System Admin permission catalog and role editor with business-category navigation and explicit platform-only permission treatment.
- Role: Codex implementing the user-approved Frontend/UI scope and performing self-verification.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Added one shared category → module → permission catalog for the read-only catalog and role editor. Desktop uses category navigation with a 75%-width role sheet; smaller breakpoints use the existing Select pattern.
- Platform-only permissions display a locked `Chỉ Quản trị hệ thống` badge and explanation. System Admin roles can edit them; tenant roles hide them and display a scope note. The role page derives that capability and the shared catalog does not hard-code role names.
- Search covers category, module, permission and key; filtered rendering keeps full module selection semantics and stable Backend-provided ordering. Active icon/count contrast, long labels, keyboard focus, `aria-current` and unsaved-close protection were retained or improved.
- Save payload, query/mutation hooks, 409 handling and authorization behavior are unchanged.
- Verification: full test suite passed 211/211 across 54 files; typecheck, lint and production build passed; focused new catalog/sheet tests passed 8/8.
- GitNexus pre-change impact was LOW for the edited symbols; final change detection identified only the expected admin role/catalog and shared sheet rendering flows.
- No dependency, database, migration, seed, API write or deployment configuration was changed.

## 2026-10-02 — Permission catalog categories Gate B

- Role: Codex implementing the authorized Frontend data/component gate.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Extended the tenant permission contract with Backend-owned category metadata and grouped permissions as category → module → permission in stable numeric order.
- Search now covers category, module and permission metadata; customized-only filtering preserves the hierarchy and removes empty groups.
- Role and personal editors now render through the same `PermissionCatalog`; the duplicated personal catalog implementation was removed while save, draft, recovery and module-level bulk selection behavior remains unchanged.
- Verification: focused access-control tests 12/12 passed; full suite 199/199 passed; typecheck, lint and production build passed.
- GitNexus pre-change impact was LOW for all changed functions/components. Final detect-changes was HIGH because the shared catalog intentionally affects both role and personal permission editor flows; direct review confirmed no other feature or save payload is involved.
- No dependency, database, migration, seed, API write or deployment configuration was changed.

---

## 2026-10-03 — Permission catalog final code review

- Role: Codex review-only pass over the tenant and System Admin permission catalog diff against `origin/dev`.
- State: `APPROVED_FINAL` under the repository gate because no Blocker or High finding was identified. One non-blocking Medium finding remains below.

### PERM-20261003-M1 — Medium

The tenant catalog receives only the filtered hierarchy from both role search and personal search/customized-only views. `PermissionCatalog` therefore calculates category/module totals from the visible subset and passes only those visible permission IDs to the module checkbox. For example, searching a single permission in a five-permission module renders `1/1`; clicking the checked module control removes only that one permission. The System Admin catalog already preserves a `completeCategory`/`completeGroup`, so the same interaction has different semantics between the two permission workspaces. Pass the complete grouped hierarchy alongside the visible hierarchy (or resolve each visible category/module back to its complete counterpart) for counts and module bulk selection, while continuing to render only matching rows. Add regressions for role search and personal customized/search filters.

### Verification and scope

- Focused tenant/admin catalog tests passed **24/24** across five files; current tests do not cover bulk selection after the hierarchy has been filtered, which is the gap described above.
- GitNexus compare analysis reports Medium blast radius across the expected tenant role, personal permission and System Admin role/catalog render flows. Direct source tracing confirmed save payloads, 409 handling, permission scope enforcement and unsaved-close protection are otherwise unchanged.
- `git diff --check origin/dev...HEAD` passed in both repositories.
- No application source, dependency, API write, database, migration, seed, deployment configuration, push or merge was changed by this review.

### Fix verification — PERM-20261003-M1 resolved

- The shared tenant catalog now receives both the visible filtered hierarchy and the complete hierarchy. Category/module counts, tri-state state and module bulk actions use the complete module; only matching permission rows are rendered.
- Role search and personal customized/search modes now have the same full-module semantics as the System Admin catalog. Save payloads, permission drafts, authorization and API contracts are unchanged.
- Added role and personal regressions proving a one-row filtered module still reports the complete `1/2` count and toggles both module permission IDs.
- Verification: focused access-control tests **18/18** passed; full Frontend suite **213/213** passed across 54 files; typecheck, lint and production build passed.
- GitNexus pre-change impact was LOW for each edited symbol. Final change detection is HIGH because the shared catalog intentionally participates in six tenant role/personal execution flows; no unexpected feature or API flow is included.
- Web Interface Guidelines review found no new accessibility, focus, interaction, content-overflow or motion issue in the edited components.
- No dependency, Backend source, API contract, database, migration, seed or deployment configuration was changed.

---

## 2026-10-04 — Remove inbound receiving staging UI

- Role: Codex implementing the requested removal of the inbound staging location concept from Frontend flows.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Removed inbound-staging fields, configuration controls, permission code and `ReceivingHold` status from warehouse, inbound and opening-stock UI contracts.
- Receipt copy now describes inspection approval directly; put-away offers active real storage locations and continues to exclude outbound staging. No save payload outside the removed fields was changed.
- Verification: full suite passed **223/223**; typecheck, lint and production build passed; source search found no remaining inbound-staging references; GitNexus final analysis covered the expected inbound, inventory and warehouse rendering flows.
- No dependency, direct database action, migration execution, seed or deployment configuration was performed by the Frontend work.

---

## 2026-10-04 — Consolidate inbound workspace navigation

- Role: Codex implementing the clarified inbound navigation change.
- State: `READY_FOR_CODEX_REVIEW` (self-verification only; not independent approval).
- Kept one `Nhập kho` destination inside `Hoạt Động Kho` and moved `Yêu cầu nhập kho` into the shared inbound tab bar alongside `Chờ nhận hàng`, `Phiếu nhận hàng` and `Chờ cất hàng`.
- The inbound-request directory now uses the same workspace header as the other inbound pages. Its existing create action remains in the header.
- Request and receipt tabs are filtered by their existing view permissions; routes, workflow payloads and authorization policies are unchanged.
- Verification: focused navigation and tab tests passed **28/28**; full suite passed **226/226** across 57 files; typecheck, lint and production build passed.
- GitNexus impact was unavailable because its local transport remained closed; direct source tracing covered the shared sidebar, inbound header/tab and inbound-request directory consumers.
- No dependency, Backend source, API contract, database, migration, seed or deployment configuration was changed.

### 2026-10-04 — Pre-merge navigation fixes

- Role: Codex implementing the user's requested review fixes and performing self-verification.
- State: `READY_FOR_FINAL_REVIEW` (not independent approval).
- **High / resolved:** Request-only users no longer lose the single `Nhập kho` sidebar entry. The centralized navigation resolver opens `/inbound-requests` when only `inbound-requests:view` is granted, retains `/inbound` when receipt viewing is granted, and hides the entry when neither view permission is available. It does not mutate the static navigation catalog or broaden Backend authorization.
- **Medium / resolved:** Shared inbound tabs no longer fetch `/auth/me` or interpret permission keys. All four workspace pages supply the view capabilities through the shared header; tabs remain presentational and retain accessible links and active-page semantics.
- Added regressions for request-only, receipt-only, combined and absent permissions across all three tenant roles, capability updates and each active tab.
- Verification: full suite **233/233** across 57 files; `pnpm typecheck`, `pnpm lint`, `pnpm build` and diff whitespace checks passed.
- GitNexus pre-change impact and final detection report HIGH because the shared header/tab intentionally participates in the four inbound workspace pages; direct tracing confirmed only navigation/rendering changed. Save payloads, assignments, receipt workflow, route authorization and API contracts are unchanged.
- No dependency, database connection/write, migration, seed or deployment configuration changed. The user's `screen/huytv` branch remains the working branch; `dev` is the shared integration target, not overwritten or force-pushed.

---

## 2026-10-04 — Put-away operational quantity and unit: Frontend gate

- Role: Codex implementing and self-verifying the operational-unit put-away Frontend gate.
- State: `READY_FOR_CODEX_REVIEW` (not independent approval or live end-to-end acceptance).
- The form now sends `enteredQuantity` and `enteredUnitId` unchanged to Backend. Allowed units and original conversion snapshots come from the receipt response; Backend remains authoritative for conversion, remaining quantity, mixed-product rules and capacity enforcement.
- Default quantities use the original receipt unit when exactly representable. Changing units preserves the physical quantity only when exactly representable; otherwise the input clears and requires correction. No silent quantity rounding is performed.
- Added base-unit conversion previews, per-item remaining/requested/allocated quantities and `Cất toàn bộ còn lại`. The fill action excludes other valid allocations and visibly falls back to the base unit when a remainder cannot fit the packaging precision.
- Header metrics count receipt lines instead of adding incompatible product units. Existing version checks, submission/cancellation flows and error refetch behavior remain intact.
- Ponytail guided reuse of existing form primitives and API flow without new dependencies. Exact scaled arithmetic is confined to the conversion helper to avoid floating-point rounding of stock previews.
- Verification: focused allocation/conversion tests **16/16**, form interaction tests **3/3**, full suite **247/247** across **58 files**; `pnpm typecheck`, `pnpm lint`, `pnpm build` and `git diff --check` passed.
- Accessibility/responsive source review covered field labels, nearby errors, live conversion announcements, keyboard-native controls, pending-state disabling and responsive field grids. Live browser viewport/keyboard QA and deployed API end-to-end acceptance remain for the following gate.
- GitNexus pre-change impact warned of HIGH blast radius for shared allocation/types; final detection reports Medium across the expected put-away form/page flows. New untracked helper/test files were reviewed directly because they are not in the existing index.
- No database connection/write, migration, seed, dependency, deployment configuration, commit or push was performed. Backend gate changes and both existing working branches are preserved.

### 2026-10-04 — UI/UX gate: implemented, live acceptance pending

- Role: Codex implementing narrowly scoped UX refinements and running isolated interaction QA; this is self-verification, not independent review.
- Added the snapshot conversion explanation next to the unit selector (`1 Thùng = 24 Lon`), associated with the control through `aria-describedby`.
- Pending actions now show `Đang xử lý…`, a reused Spinner and `aria-busy`. Spinner animation is disabled under reduced motion. Action buttons stack on narrow viewports; allocation fields have zero minimum width to allow their grid columns to shrink.
- Ponytail/shadcn guided reuse of existing Button, Spinner and FieldDescription rather than adding dependencies or bespoke loading/field components.
- Added keyboard Tab/Enter coverage, exact-representation correction/recovery, split-row add/remove preservation and unavailable-unit metadata tests. These use React Testing Library/jsdom and do not prove real-browser layout or native-select behavior.
- Verification: form interaction tests **7/7**; full suite **251/251** across **58 files**; typecheck, full lint, production build and diff whitespace checks passed. The final test-only addition was also linted separately.
- GitNexus impact for PutawayForm is LOW (one direct page caller); final detection remains Medium across the two expected put-away form/page execution flows. The untracked test fixture is not indexed and was traced directly.
- **Acceptance still pending:** real-browser desktop/tablet/mobile and 200% zoom checks, native location-picker keyboard/focus checks, and FE-to-API end-to-end put-away verification. Both browser automation entry points failed initialization with `failed to write kernel assets: The system cannot find the path specified. (os error 3)`. No claim of completed live QA is made.
- No Backend source edits, database connection/write, migration, seed, dependency, configuration change, commit or push in this UI/UX round. No files were deleted.

### 2026-10-04 — Put-away quantity/UOM and UI: review round 1

- Role: Codex review-only self-review; not independent approval.
- State: `NEEDS_CLAUDE_FIX`.
- **PUTAWAY-20261004-H1 / High / open / pre-existing:** `InboundPutawayDetailPage.tsx:99` creates a new command ID for each submission. Error refetch at lines 110–111 and `keepDirtyValues` at line 76 retain the allocation while adopting the server's new version. A committed partial operation whose response is lost can therefore be posted again on manual retry. Preserve the uncertain command's original ID and immutable payload, reconcile its outcome before allowing another operation, and cover this with a page/handler regression. Confirmed against `HEAD`: this defect predates the new unit workflow.
- Database-free simulation of the actual submit function and allocation helper, with mocked commit/network responses, produced two different command IDs and versions `v1`/`v2` for the same 4-carton allocation: recorded total 192 base units versus intended 96. This does not claim real API/DB reproduction.
- **PUTAWAY-20261004-M1 / Medium / open / introduced:** `putaway-units.ts:40` converts exact BigInt hundredths back to a JS number without proving the resulting quantity preserves those hundredths. Direct execution of the current helper with quantity `90071990000`, factor `1000.000001`, entered precision 0 and base precision 2 returns `90071990090071.98` instead of exact `90071990090071.99`, even though cents are below `MAX_SAFE_INTEGER` and the input fits the request limits. This affects conversion previews and remaining-allocation validation; Backend decimal checks still protect stock posting. Reject values that cannot round-trip exactly through the UI representation or retain exact hundredths through comparisons, and add the boundary regression without silent rounding.
- Focused Frontend allocation/conversion and form interaction tests passed **23/23** across two files. Whitespace checks passed. The prior full suite/typecheck/lint/build results are recorded above, not rerun in this review.
- GitNexus detected Medium blast radius across the expected form/page flows. Missing FTS indexes limit keyword search; current source and diffs corroborated the findings and covered untracked helper/tests directly.
- Real-browser responsive, native-picker keyboard/focus and FE/API end-to-end acceptance remain pending; the previous browser runtime initialization failure has not been resolved. No new live-UI pass is claimed.
- Only this review record was appended. No application source, database connection/write, migration, seed, dependency, configuration, commit or push was performed.

### 2026-10-04 — Put-away review findings: safety fixes

- Role: Codex implementing the user's authorized findings fixes and performing self-verification.
- State: `READY_FOR_FINAL_REVIEW` (not independent approval or live end-to-end acceptance).
- **PUTAWAY-20261004-H1 / resolved:** Capture receipt ID, original version, command ID and cloned allocation lines before the first request. Uncertain network/5xx outcomes retain this exact command; retry bypasses validation against refreshed remaining stock and cannot create a fresh command. Definitive initial 400/401/403/404/409/422 rejections release the snapshot for correction. A conflict after an uncertain response does not release it, because it cannot prove whether the original operation committed.
- Uncertain submissions lock product/unit/quantity/location edits, row addition/removal and cancellation, while enabling `Gửi lại an toàn`. A synchronous ref guard blocks rapid duplicate submissions. Back navigation from the form is blocked while locked; a native unload warning protects against accidental reload/tab close. Unresolved outcomes explicitly instruct staff not to move the goods again and to contact the manager for reconciliation. The snapshot is scoped to the mounted page, not persisted across forced navigation/browser restart; the warning is not a durable recovery mechanism.
- **PUTAWAY-20261004-M1 / resolved:** Exact BigInt hundredths must round-trip through both displayed decimal precision and allocation hundredths before returning a numeric preview. Fill/default input also verifies that converting micro-units back to a number preserves the exact input. Unrepresentable values are rejected rather than rounded, without dependencies or changes to the API.
- Regression coverage includes committed-response-loss retry with refreshed zero remaining stock, original receipt/version preservation, unchanged payload despite altered form values, initial definitive rejection followed by a corrected new command, uncertain retry conflict, rapid concurrent submission, unload-warning registration/cleanup, locked UI with an enabled retry action, and the reported numerical boundary plus an adjacent representable value.
- Final verification: full Frontend suite **258/258** across **59 files**; `pnpm typecheck`, `pnpm lint`, production build and `git diff --check` passed. One earlier full-suite run while build/typecheck/lint ran concurrently hit the existing 5-second timeout in `ProductInventoryPanels.test.tsx`; the full suite passed when rerun alone. No timeout/test outside this task was modified.
- Backend focused suite **37/37** passed from the existing Release assembly (`--no-build`); existing same-command replay/version/capacity/normalization protection is reused without Backend application edits in this fix pass.
- Ponytail/React/shadcn guided local refs, existing form/error/button primitives and no new dependency. GitNexus pre-edit impact was LOW for the page/form; new untracked conversion helpers were absent from the index and their callers were traced directly. Final detection remains Medium across the expected put-away form/page flows.
- Browser viewport/native-picker and deployed API end-to-end acceptance remain pending as recorded above. No application startup, database connection/write, migration, seed, configuration change, commit, push or deletion was performed.

### 2026-10-04 — Put-away units: pre-PR verification after dev sync

- Role: Codex final self-review and delivery preparation; not independent review or live acceptance.
- Reviewed prior H1/M1 fixes and regression tests: uncertain retries retain the original command/version/payload; numeric previews reject quantities that cannot round-trip exactly. No remaining blocking defect identified in this diff; the unresolved snapshot remains page-local as documented above.
- Sidebar `Nhập kho` now prefers `/inbound-requests` when authorized, retaining the receipt route for receipt-only users and active highlighting across the inbound workspace.
- Branch includes `origin/dev` at `ed35f70`; local tracked/untracked work matches the safety stash after sync. Full suite: **265/265 tests across 62 files**. Typecheck, full lint, production build and whitespace checks passed. GitNexus reports Medium scope in the expected put-away flows; sidebar regression tests pass.
- No migration, dependency, deployment configuration or database changes. Deploy the paired Backend first. Live browser responsive/accessibility and API end-to-end QA remain pending; automated fixtures/mocks do not establish that acceptance.

### 2026-10-04 — Inbound UX, workflow assignment and readable units

- Role: Codex implementation and self-verification, not independent review or live acceptance.
- State: `READY_FOR_CODEX_REVIEW`.
- Default Staff login resolves to My Tasks; an explicitly requested authorized destination remains unchanged. Put-away business rejections log a readable warning instead of a raw object/error overlay; unexpected failures remain error-level and existing toast/retry safety is preserved.
- Request creation optionally selects the receiving/put-away staff member using existing assignable-staff data and permissions. Warehouse changes clear the selection; loading/error/retry states are explicit. Draft updates do not silently overwrite assignment and Backend remains the final authorization/eligibility authority.
- Receipt/request lines distinguish base units from request conversions, replacing `Theo PO` with `Theo yêu cầu nhập`. Receipt history actions are Vietnamese. Put-away history explicitly labels conversion as based on the inbound request snapshot, not the original entry unit, which is not persisted per allocation. Product list includes active conversion units alongside the main unit.
- Verification: **271 tests passed across 64 files**; typecheck, lint, production build and whitespace checks passed. Added regressions cover Staff routing, receipt conversion columns/history and business-warning logging.
- Ponytail, React and shadcn guidance favored existing form/table/error primitives without dependencies or schema changes. GitNexus impact/change detection was corroborated with direct source/diff review; new tests were inspected outside the index.
- Browser responsive/accessibility and deployed API end-to-end acceptance remain pending. Local Backend must be restarted/deployed with the paired changes before exercising the new assignment API. No database write, migration, seed, configuration change, application restart, commit, push or deletion was performed.

### 2026-10-04 — Warehouse wall decoration overflow and inventory subtitle

- Role: Codex implementing the authorized layout/subtitle fix; self-verification only. State: `READY_FOR_CODEX_REVIEW`.
- Decorations use the same bounded 120-layout-unit outer margin on drag/resize, palette drop, duplication and scene loading. Warehouse zones/racks remain inside their original bounds. The blue wall is drawn separately from the expanded paper; fit/scroll/grid coordinates include the margin while decorative glyphs remain above the wall.
- Removed only the requested slot/snapshot subtitle from available inventory, preserving data freshness metadata and per-stock update dates.
- Targeted FE suite **21/21** (grid bounds, save/load mapper and inventory directory) passed; typecheck, full lint, production build and whitespace checks passed. Full FE test attempts encountered worker initialization/termination failures under host memory pressure and were stopped; they are not reported as a pass.
- GitNexus identified HIGH impact for the shared constrain helper (10 direct callers, 3 affected processes). Its default margin remains zero; callers were traced and only decoration callers opt in. Whole dirty FE detection is High including preserved prior inbound changes. Existing primitives and React/Ponytail guidance were retained with no new dependency.
- No database command/write, migration, seed, application restart, commit, push, configuration change or deletion. Live browser/zoom/drag end-to-end QA remains pending; paired Backend must be restarted/deployed to accept new outside-wall coordinates.
