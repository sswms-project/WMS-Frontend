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

### 2026-10-05 — Shared native table scrolling and operational route tabs

- Role: Codex implementation and self-verification; not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Shared Table containers use a native 6px gray rounded scrollbar in Chromium/WebKit and a thin native fallback elsewhere. OperationalListPanel now has a stable data-slot: direct tables retain the existing flexible body, and one-level responsive wrappers give their inner table container the remaining height instead of introducing a second scroll owner. Pagination and toolbars stay outside scrolling. First-column checkbox cells are pinned only within operational list panels.
- Inbound/outbound navigation shares an underline treatment with Kovia semantic green tokens. Removed visible large list headings/icons, retained accessible h1 headings and create actions. Detail/form headings, route destinations, capability checks, queries and mutation flows are unchanged. Outbound retains only the existing Export/Return routes; no speculative workflow tabs or dependencies were added.
- Verification: focused tests **15/15**; full Frontend suite **286/286** across **65 files**; typecheck, full lint, production build and whitespace checks passed. Added coverage verifies outbound view permissions/active links and inbound heading/action preservation.
- Live read-only Edge QA with the user's authenticated Tenant Owner session: inbound tabs and receipt tabs have correct active underline, create action remains available, native horizontal drag moves table/header together while checkbox/search/footer remain fixed. In a narrow desktop viewport, the request scroller is 900px wide with 1216px content; the scrollbar is 6px with rgb(184,187,194) thumb, and its bottom aligns with the pagination top. Receipt and product tables also align their scroller bottom with pagination. Mobile observed width 417px: page width stays 417px; four inbound tabs share one y-coordinate with a 559px scrollable navigation region. Keyboard Tab gives the next route a visible green inset focus ring. Temporary viewport overrides were reset.
- GitNexus pre-edit impact: shared Table/OperationalListPanel CRITICAL (57/35 direct callers), inbound header HIGH (four list pages); warned before editing. Detect changes reports High scope in expected operational list/navigation flows. Missing FTS indexes limit keyword search; direct source/diff and browser inspection corroborate scope. New test files and global CSS are reviewed directly outside graph coverage.
- Ponytail/React/shadcn guidance favored existing primitives, native scrolling and CSS layout over synchronized bars, listeners or new dependencies. Web Interface Guidelines self-check covered semantic links, aria-current, accessible hidden headings, mobile overflow and focus-visible. No database command/write, migration, seed, Backend change, commit, push or file deletion was performed. Firefox/Safari, 200% browser zoom and live business mutation acceptance were not tested in this UI-only pass.

### 2026-10-05 — Inbound master/detail goods preview

- Role: Codex implementation and self-verification; not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Four inbound directories share a bottom goods preview with an explicit accessible preview button, collapse/reopen control and vertically resizable divider. Reuses installed resizable primitives and existing detail queries; no dependency, Backend contract, schema or workflow mutation changes. Bulk selection and original document links/actions remain independent.
- Preview includes base unit, request conversion snapshot, requested/received quantities and separate actual placement, lot and expiry columns. Receipt items retain separate lot rows; multiple placements stay within the item row with their own quantities, avoiding duplicated received totals. System-default storage is presented as the containing rack. Requests do not invent actual lots/placements; receiving fallback respects available detail permissions and leaves units unknown when the task DTO does not supply them.
- Queries run only for an expanded, selected document still present in the current non-placeholder list. Loading/error/retry and cleared selection hide stale goods. Receipt detail also separates placement, lot and expiry columns.
- Verification: final full suite **292/292** across **66 files**; focused preview/receipt suite **9/9**. Typecheck, lint, production build and whitespace checks passed. Coverage includes multiple lots/placements, loading/selection changes, errors/retry, request placeholders, conversion snapshots and system-default labels.
- Read-only Edge QA with authenticated Tenant Owner: request and receiving previews display base/conversion units; receipt previews show actual rack allocations; switching receipts replaces goods without navigating. Collapse/reopen works, pointer drag adjusts height and ArrowUp changes the divider from 75% to 70%. A separator nesting issue found by keyboard QA was fixed by keeping it a direct panel-group child. Mobile viewport inspection has equal document client/scroll widths (464px); temporary override reset. No Staff live session, Firefox/Safari or 200% zoom/business-write acceptance was exercised.
- GitNexus individual pre-edit impacts LOW; aggregate detection High across 29 symbols/12 expected inbound processes. Existing mutation blocks were checked in the diff and preserved. New unindexed preview files were reviewed directly. Ponytail/React/shadcn guidance favored a small shared presentation layer and existing APIs rather than new data models or libraries.
- No database command/write, migration, seed, configuration change, Backend edit, commit, push or file deletion. Local services remain available for user testing.

### 2026-10-05 — Row preview independent from document links and bulk checkboxes

- Role: Codex implementation and self-verification; not independent review. State: `READY_FOR_CODEX_REVIEW`.
- User explicitly requested clickable document rows: clicking non-interactive row content selects the bottom goods preview; only document-code links and existing explicit detail actions navigate. Removed the newly introduced standalone preview-icon component. Desktop rows and mobile items share a small interaction helper, retaining table/list semantics, keyboard Enter/Space and visible focus/active states.
- Links, controls, checkbox/action cells and portaled dropdown actions do not activate preview. Receiving request-code links require the existing request-view capability; no authorization or business mutation rule changed.
- Fixed the request checkbox column's inconsistent empty cells by retaining disabled checkboxes for ineligible document states. Header/row checkboxes align centrally; the header displays indeterminate when partially selected. Selection still applies only to an eligible, same-status group on the current page, not approved/completed documents.
- Divider uses the existing `bg-background` token (`#F1FBEC` in light mode), not border color. No global border palette change.
- Verification: full suite **296/296** across **67 files**; focused row/checkbox regressions **5/5** passed, covering code-only links, pointer/keyboard preview, independent checkbox/cell/portal actions, ineligible states and partial-header selection. Typecheck, lint, production build and whitespace checks passed.
- Read-only Edge Tenant Owner QA: clicking supplier text selects a different request without changing URL; clicking the disabled checkbox cell does not change preview; Enter selects the focused row; clicking the request code opens the correct detail URL. Existing live documents are approved/completed, so enabled bulk checkboxes were verified with automated fixtures rather than writing QA drafts to the deployed database.
- GitNexus pre-edit impact LOW for the five directory/table components (one direct caller each) and receiving page (zero direct callers). Aggregate detection remains High including the preceding uncommitted master/detail work; expected inbound flows only. New helper/test files were reviewed directly outside the current graph index. Ponytail/React/shadcn guidance retained existing controls with no dependency or shared Table primitive changes.
- No database command/write, migration, seed, Backend edit, commit or push. Only the obsolete agent-created preview-button source was removed; no user data or files on drive C were deleted.

### 2026-10-05 — List bottom outline and selectable request checkboxes

- Role: Codex implementation and self-verification; not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Removed the shared list panel's scrollbar-colored bottom-border override. The bottom now matches the existing dark outer edges; the footer/scrollbar separator remains gray. No global theme or scrollbar change.
- Corrected request header/row checkbox centering with `mx-auto`: `text-center` on the table cell did not center the flex-based Checkbox. Selecting documents now includes approved/completed states and select-all applies to the current page. Selection is UI-only and remains independent from row preview/navigation.
- Supersedes the preceding entry's eligible-only selection: bulk send/delete is exposed only when all visible selected documents are drafts and the user has the corresponding permission; bulk approve requires all pending-approval documents and approval permission. Mixed-status/completed selections offer clear-selection only. Pending mutations still lock selection; stale IDs are excluded from bulk payloads.
- Verification: **299/299 tests across 67 files**, focused checkbox/row/bulk regressions **8/8**, typecheck, lint and production build passed. Read-only Edge QA verified individual selection, mixed header, select-all and no unavailable operation buttons; all checkbox center offsets measured zero and bottom/other edge colors matched. Screenshot: `../inbound-checkbox-border-qa.jpg`.
- GitNexus shared-panel impact CRITICAL (35 direct callers); the CSS change removes one scoped override only. Request table/directory/bulk-action impact LOW (one direct caller each). Aggregate dirty-worktree detection High (36 changed symbols, 12 affected flows), including preserved preceding inbound master/detail changes. Applied FE-required shadcn/React/accessibility guidance and Ponytail without new dependencies or abstractions.
- No Backend edit, database operation/write, migration, seed, commit, push, or user-file deletion.

### 2026-10-05 — Inline selected-document toolbar and discoverable deletion

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Moved selected count/status and bulk controls beside the request-list heading. The header wraps on small screens without overflowing; filters move below when space is limited. No duplicate selection state or new component/API.
- Show `Xóa chứng từ` for users with delete permission even when the selected documents cannot be deleted. Disabled-state tooltip explains the draft-only rule and directs approved/unreceived requests to the existing detail-page cancellation flow. Eligible drafts retain the existing confirmation dialog and delete API; mixed/non-draft selections cannot invoke deletion. No Backend eligibility rule was loosened.
- Read both existing Backend delete handlers and cancellation handler. Delete guards require Draft and no GoodsReceipt; cancellation separately checks warehouse access, version, receiving execution and receipt state. No deployed document was deleted or cancelled during QA.
- Verification: **299/299 tests, 67 files**; targeted toolbar/checkbox tests **8/8**, typecheck, lint, production build and whitespace checks passed. Tests cover enabled draft-delete callback with visible IDs only, disabled mixed/approved deletion, permission denial and count sharing the heading container. Edge verified count/heading have identical vertical bounds, no viewport overflow and the approved document's delete button is disabled. Screenshot: `../inbound-selection-toolbar-qa.jpg`.
- GitNexus pre-edit impact LOW for directory and bulk toolbar (one caller each); aggregate High includes preserved previous inbound changes. Reused shadcn Tooltip/Button/confirmation, React-derived selection and Ponytail minimal composition. No Backend edit, database write/migration/seed, commit, push or deletion.

### 2026-10-05 — Owner approved-request deletion and shared goods-preview pagination

- Role: Codex implementation/self-verification, not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Supersedes draft-only deletion guidance above: consume Backend ownership/delete capability (optional metadata fails closed during rolling deployment). Draft and approved/unreceived selections can be deleted when all visible selected rows are eligible; received/mixed-ineligible selections remain disabled. Single-row actions use the same capability. Existing delete permission, confirmation and mutation payloads are preserved; Backend independently rejects receipt/task progress. Confirmation explicitly warns permanent deletion cannot be undone.
- Goods preview on all four inbound list tabs reuses OperationalPagination: total, default 10 rows, page-size selector and page buttons. Client-only slicing preserves document data and base-unit quantities. Document-key remount resets pagination; loading/error/unselected states disable controls and never show stale rows. No new dependency, effect, API fetch or shared primitive alteration; Ponytail retains the existing controls.
- Verification: **303 tests across 67 files**, typecheck, lint and production build passed. Added owner mixed draft/approved deletion and received rejection tests, plus goods paging/page-size/document-reset tests. Radix Select keyboard test includes a scoped/restored JSDOM scrollIntoView stub; no production polyfill.
- Read-only Edge Tenant Owner QA after safe Backend restart: approved/unreceived selection enables Xóa chứng từ; bottom preview displays Tổng số: 1 and Số dòng/trang 10 using the shared footer. Screenshot: `../inbound-owner-delete-footer-qa.jpg`. No delete confirmation submitted or deployed document changed by QA. Server-side deletion is tested with mocks, not live data.
- GitNexus impact LOW for existing callers; new preview traced directly across four pages. Aggregate detection High (44 changed symbols, 12 flows) includes preserved earlier master/detail work. No database migration/seed/cleanup, commit, push or user-file deletion.

### 2026-10-05 — Compact inbound header and non-duplicated list totals

- Role: Codex implementation/self-verification, not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Goods-preview lot/expiry cells display ASCII `-` when absent, retaining actual receipt values and existing date formatting. Request data does not contain a confirmed lot/expiry; no unrelated product lot is inferred. Position guidance remains unchanged.
- Inbound status cards reduce content minimum height by 16px; desktop cards measure 72px. Shared workspace top padding is 4px only when operational inbound/outbound tab navigation is present. Other pages retain existing padding, and tab touch/focus targets remain unchanged.
- Removed secondary totals beneath list titles across request/receiving, supplier, customer and customer history, outbound/return, transfer, products, units, product groups, invitations and tenant directory. Footer pagination totals, selected counts and business-status cards remain intact. Updated list guidelines to keep result totals in the shared footer only.
- Verification: 303 tests across 67 files passed; focused preview/selection regressions 16/16, typecheck, lint and production build passed. Edge verified no duplicate request count, 4px top padding, 72px status cards, absent lot/expiry hyphens and no desktop horizontal overflow. Narrow viewport inspection reached 488 CSS px (browser minimum), with no page overflow; it is not an exact 390px device acceptance test. Screenshot: `../inbound-compact-header-qa.jpg`.
- GitNexus pre-edit impact LOW (mostly one direct caller; PrivateLayout and ProductListPage zero indexed callers); new preview checked directly across four pages. Aggregate detection Critical (48 symbols, 18 flows) includes previous uncommitted work and shared layout composition. Source review confirmed only conditional spacing changes in PrivateLayout, with no authentication/realtime/subscription behavior changes. Missing FTS reduces keyword lookup; direct source inspection supplemented the graph.
- Applied Ponytail/shadcn/React guidance by removing repeated text and changing existing layout utilities only. No dependency, Backend edit, database operation, migration, seed, commit, push or file deletion.

### 2026-10-05 — Optional stock-policy numbers and immediate divider-toggle positioning

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Stock policy: setValueAs received null defaults and converted null to zero. Preserve empty string, null and undefined as null for optional maximum/reorder/lead-time fields. No BE contract change: blank lead time is allowed; entered values must be positive whole numbers. Added real React Hook Form/Zod/dialog tests for first-click saving, cleared optional fields, positive lead time and zero/negative/fractional rejection. Submit is mocked; no API/DB writes.
- Divider toggle: Button transition-all animated top changes, while Panel onResize reported pixel positions through ResizeObserver. Use Group onLayoutChange and a CSS ratio sharing the divider-height variable to track layout immediately without delayed measurement or React drag state. Restrict transitions to colors. Keep the existing Button outside Group so the library excludes it from its enlarged resize hit region. All four inbound list tabs share the fix.
- Verification: 313 tests across 69 files, lint, typecheck, production build and whitespace checks passed. Edge read-only QA measured toggle/divider alignment after ArrowUp, ArrowDown, collapse and reopen, with maximum difference 0.016 CSS px. Screenshot: `../inbound-toggle-no-lag-qa.jpg`. Mouse-drag timing was not instrumented; position transitions are removed and the layout callback updates the ratio directly.
- GitNexus optionalNumber LOW (0 graph callers; three field registrations checked manually), ProductStockPolicyDialog LOW (one ProductDetailPage caller); InboundMasterDetail UNKNOWN/untracked, with four page callers inspected directly. Read BE/FE rules and BE command/validator. Applied Ponytail/shadcn/React guidance with focused changes only. No new dependency, Backend edit, migration, seed, DB operation, deletion, commit or push.

### 2026-10-05 — Consistent inbound preview headers and explicit expansion

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- All four inbound tabs share abbreviated preview headers: ĐVT, ĐVQĐ, SL yêu cầu and SL thực nhận. Existing shadcn Tooltip shows full Vietnamese labels on hover or keyboard focus; numeric columns and underlying base-unit quantities are unchanged. Receiving directory uses Mã yêu cầu rather than Mã PO; receipt/putaway search placeholders use the same terminology.
- Receiving date/search controls both measure 32px high at the same top coordinate (238px) in desktop Edge QA. Added center alignment to the existing wrapping toolbar and matched the date-button height to the existing input.
- Four page states start collapsed. Row selection only updates preview selection; code links still navigate to detail. Initial panel sizes are 100/0 to avoid an expanded startup flash. The toggle alone owns expansion state; removed resize-to-state feedback, disallowed dragging a collapsed panel open and disallowed dragging an open panel to zero. Open panels remain resizable within existing limits.
- Verification: 318 tests across 69 files passed, including isolated header hover/focus and toggle/resize regression tests; typecheck, lint and production build passed. Read-only Edge checked default collapsed and row selection staying collapsed on all four tabs, explicit open/close, keyboard tooltip, and resize staying open. Screenshot: `../inbound-standard-columns-qa.png`.
- GitNexus pre-change existing callers LOW; new/untracked shared components were traced directly through all four pages. Aggregate detect-changes reports Critical (49 changed symbols, 18 flows, 33 tracked files) because it includes preserved prior work, not only this task. No auth, assignment, mutation or permission logic changed here. Applied Ponytail/shadcn/React guidance with existing primitives; no dependency, Backend edit, migration, seed, DB write, cleanup, commit or push.

### 2026-10-05 — Business-specific quantity labels on inbound detail pages

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Request details distinguish SL yêu cầu (đơn vị nhập) from SL yêu cầu (ĐVT), rather than calling requested quantities nhập or đơn vị chính. Received, closed and remaining-to-receive quantities keep their existing values and explicit units, including mobile metadata. Receipt details label SL yêu cầu, ĐVT, ĐVQĐ, SL thực nhận, SL hỏng, SL đạt and SL cần cất. Placement history labels SL đã cất and retains base-unit suffixes and historical conversion.
- A narrow InboundColumnLabel composition reuses shadcn Tooltip across the three detail tables. Hover/focus descriptions explain quantity basis and distinguish actual receipt quantity including damaged goods from usable quantity. No quantity calculation, API contract, state, validation or mutation changed.
- Verification: 320 tests across 69 files passed, including 4 Thùng / 96 Lon request distinction, receipt/history headers and tooltip hover/focus. Typecheck, lint, production build and whitespace check passed. Live Edge QA was unavailable because localhost:3000 refused the connection; no live visual acceptance is claimed.
- GitNexus impact LOW: one direct detail-container caller and its page for each table. Reviewed those table sources and preserved existing unrelated changes. Ponytail/shadcn/React/accessibility guidance applied. No dependency, Backend edit, database operation, migration, seed, deletion, commit or push.

### 2026-10-05 — Persistent inbound goods-detail switch and concise rack labels

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Removed `(không chia ô)` from system-default rack display labels in receipt preview, receipt items and placement history; rack identifiers and quantities remain unchanged.
- Replaced the moving divider chevron with a labeled shadcn Switch in a fixed toolbar outside the resize hit region. Existing `useLocalStorage` stores only a boolean at the versioned `inbound-goods-detail:v1` key, shared by all four inbound tabs. Default remains off; both on and off survive remount/reload. No selected document or API data is persisted. Dragging remains enabled only when the panel is on, and selecting a row never turns it on.
- Removed obsolete divider-position measurement and CSS ratio synchronization. Accessible label, Space activation, controlled checked state and aria-controls remain; SSR uses the existing hook's server snapshot.
- Verification: 321 tests across 69 files, typecheck, lint and production build passed. Regression tests cover switch outside drag region, disabled dragging while off, keyboard, saved on/off after remount, SSR and malformed stored JSON. Edge QA checked all four tabs, reload on/off and row selection staying off. Screenshot: `../inbound-detail-switch-qa.png`.
- GitNexus refreshed its stale index. Pre-edit impact HIGH for the shared workspace (four direct page callers/four affected page flows) and receipt preview mapping (three direct page callers/three affected page flows); inspected all callers and preserved query gates. Other edited symbols LOW. Aggregate detect-changes Critical includes the previously dirty worktree (81 symbols, 18 flows, 36 tracked files), not only this change. No auth/assignment/mutation/permission changes. Restored analyzer-generated instruction-file formatting to avoid unrelated edits.
- Reused Ponytail/shadcn/React/UI guidance and existing persistence/controls; no dependency, Backend edit, migration, seed, direct database write, deletion, commit or push.

### 2026-10-05 — Restore the divider expand/collapse button (clarified intent)

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Supersedes the switch UI above: restored the original centered chevron button between the two panels and removed the switch toolbar. Kept the existing versioned boolean preference across all four inbound tabs. Row preview changes only the selected document, never expansion; clicking the document code still navigates to its detail page.
- Restored synchronous Group onLayoutChange/CSS-ratio positioning outside the drag hit region, with transition-colors only. Button supports keyboard and aria-expanded/aria-controls. Panel remains resizable only while expanded.
- Verification: 322 tests across 69 files, typecheck, lint, production build and whitespace check passed. Six workspace regressions cover immediate positioning in both directions, drag isolation, explicit opening, keyboard, saved open/closed state after remount, SSR and malformed JSON. Edge QA confirmed chevron present/no switch, open survives reload, closed survives reload, clicking a row while closed stays closed, and selecting while open refreshes the goods preview. Screenshot: `../inbound-detail-expand-button-qa.png`.
- GitNexus pre-edit impact HIGH: four direct inbound page callers/four affected page flows. Only the shared component and its tests changed for this correction; persistence and all page callbacks remain unchanged. No dependency, BE change, DB operation, migration, seed, deletion, commit or push.

### 2026-10-05 — Drag the inbound divider down to collapse

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`.
- Enabled the existing panel library's collapse-to-zero behavior while expanded. Completed user pointer/keyboard resizing persists collapse; initial layouts and imperative expansion cannot overwrite the saved preference. Existing row selection and page callbacks remain unchanged.
- Centered the chevron in the divider gap using the synchronous layout ratio. Positioning transforms now belong to a wrapper so the shared Button's pressed transform cannot shift its hit target. No positional animation or new dependency.
- Verification: 324 tests across 69 files, typecheck, lint and production build passed. Eight focused workspace tests also passed after adding the wrapper-transform regression. Edge QA confirmed drag-to-collapse, collapsed preference after reload, row selection staying collapsed, mouse reopening, open preference after reload and centered button with a goods preview. Screenshot: `../inbound-detail-drag-collapse-qa.png`.
- GitNexus pre-edit impact HIGH: four direct inbound page callers. This correction changes only the shared workspace, its tests and this review record; no BE change, database operation, migration, seed, deletion, commit or push.

### 2026-10-05 — Continuous master/detail resizing after live AMIS comparison

- Role: Codex implementation/self-verification. State: `READY_FOR_CODEX_REVIEW`. Supersedes the 25% drag minimum and ratio-based toggle positioning above.
- Opened the user's authenticated AMIS inbound list and exercised incremental drag, collapse at the bottom and the center chevron's close/reopen behavior. Kovia's 25% minimum caused the library to snap early. The shared `OperationalMasterDetail` now uses a 1px minimum while dragging, so the detail shrinks continuously until zero; only completed user resizing persists collapse. Button reopening restores the last usable size (at least 25%; initial 35%).
- The chevron follows actual committed separator geometry through the master panel's resize observer callback. No React state update per pixel, ratio-position race, positional transition or pressed translation. The inbound wrapper retains only its heading, reference and detail composition. Shared component has no query, document mapping or persistence dependency and supports outbound/transfer composition; those feature pages have not been given new preview tables in this task.
- Verification: 328 tests across 69 files, typecheck and production build passed. Lint was rerun clean after removing a test-mock warning; 12 focused tests passed again. Checks cover nonzero small sizes not collapsing, saved collapse, last usable reopening size, committed-geometry tracking, pressed-transform isolation, keyboard, SSR/storage fallback and outbound/transfer composition.
- Live Edge QA measured successive 80px drags producing 80px divider movements, kept the panel open at approximately 25px and 2.4px, then collapsed at zero. Verified matching button/gap centers, mouse close/reopen, saved closed state on reload, and expanded layout across all four inbound tabs. GitNexus impact HIGH: four direct inbound page callers. No dependency, BE/API change, database operation, migration, seed, deletion, commit or push.
- Final visual proof: `../operational-master-detail-smooth-qa.png`.

## Bulk Import — Dedicated Import Pages For Suppliers And Customers — 2026-10-05

**Implementer:** Claude
**State:** `READY_FOR_CODEX_REVIEW`

### Implemented

- Supplier and customer bulk import moved from a dialog to dedicated pages (`/suppliers/import`, `/stock-recipients/import`) that follow the personnel import flow: upload, preview with summary cards, search/status filter, per-row selection, confirmation dialog, result table with CSV export.
- Shared `BulkImportPage` / `BulkImportResult` replace `BulkImportDialog`; `SupplierImportPage` and `StockRecipientImportPage` only provide columns, labels and API hooks.
- Valid rows are preselected; invalid rows are never imported and are listed as skipped in the result. Backend contract is unchanged (stateless preview, import of the submitted rows with their original `rowNumber`).

### Verification

- Frontend suite `336` passed; typecheck, ESLint and production build clean. No Backend change, migration or database write in this change.
- Live browser QA of the new pages is still pending; tests use mocks.

### 2026-10-05 — Operational inbound forms, navigation and inventory units

- Implementer: Codex; self-verification, not independent review. State: `READY_FOR_CODEX_REVIEW`.
- Exact My Tasks navigation matching prevents simultaneous History activation. Inventory desktop/mobile quantities identify their base UOM.
- Inbound request code is required, normalized and suggested without overwriting user input. Edit actions are available in list/detail; Backend allowed actions distinguish content editing from Owner-only code editing with reason/version. Unsaved-change protection is retained; background refetch does not silently update the draft's expected version.
- Manual receiving shows receipt/request/source/warehouse context, requested/received/remaining quantities, selected UOM, good/damaged quantities and base conversion. Defaults to the request unit when exact; receiving all remaining falls back to base UOM when needed. Switching UOM resets quantities to avoid reinterpretation. Lot/manufacture/expiry controls remain.
- Verification: **72 test files / 344 tests passed**; typecheck, ESLint and production build passed. Added task navigation, inventory UOM, receipt unit fallback and manual dialog interactions. Git diff whitespace check passed.
- GitNexus pre-edit impact/context and final change detection reviewed; whole-change risk High (65 indexed symbols / 11 flows). No dependencies, migration, database write, restart, commit or push. Live browser acceptance remains pending; paired Backend restart/deployment is required for the new contracts.

### 2026-10-06 — Review round 1: operational inbound UI

- Reviewer: Codex, self-review of implementer commit `537cc1a`, not independent review. State: `APPROVED_FINAL` for the no-Blocker/High Frontend review criterion only; Medium findings remain and paired Backend review is `NEEDS_CLAUDE_FIX`. Source unchanged in this review.
- **Medium / FE-IN-01 — Exact-unit tolerance still sends a raw floating-point quotient.** `src/features/inbound/pages/InboundReceivingPage.tsx:162` and `src/features/inbound/components/ReceivingPage/ReceiveGoodsDialog.tsx:210` submit remaining / factor without normalizing representational noise, even though the helper accepts quantities within a precision tolerance. Read-only Node reproduction: 0.3 / 0.1 = 2.9999999999999996; request UOM precision 0 accepts this as representable, but Backend exact decimal validation rejects the payload. Normalize to the allowed UOM precision only after proving exact representability; retain the base-unit fallback for truly fractional packaging. Test both default and Receive All paths.
- **Medium / FE-IN-02 — UOM switching conflicts with inspection correction.** `src/features/inbound/components/ReceivingPage/ReceiveGoodsDialog.tsx:136` resets actual/damaged quantities to zero for all modes. The shared editor has no correction capability flag, while Backend CorrectInspectionAsync forbids changing actual received quantity. On a correction-required receipt, choosing another UOM clears the fixed actual quantity, blocks saving, and forces error-prone re-entry. Preserve the fixed received quantity across exact unit switches or disable the UOM/actual-quantity controls for this state; leave damaged classification editable. Add a correction-state regression.
- Cross-repo High BE-IN-01 also affects the full edit screen: when both Update and UpdateCode are allowed, only the full form is rendered, so changing only code can resave operational lines using live conversion metadata.
- Re-ran **344 tests across 72 files**, all passed; typecheck passed. Prior ESLint/production build passed. No live browser acceptance was performed. No database write, migration, seed, restart, remote push or source fix.
