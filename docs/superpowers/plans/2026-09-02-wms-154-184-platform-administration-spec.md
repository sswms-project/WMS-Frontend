# WMS-154/184 Platform Administration Specification

## 1. Document Control

| Field           | Value                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Date            | 2026-09-02                                                                                         |
| Backend epic    | WMS-154 - `[Backend] Platform Administration`                                                      |
| Frontend epic   | WMS-184 - `[Frontend] Platform Administration`                                                     |
| Backend branch  | `feat/wms-154-platform-administration`                                                             |
| Frontend branch | `feat/wms-184-platform-administration`                                                             |
| Dependency      | WMS-151/183 Platform Services (audit log, persisted notifications, SignalR realtime)               |
| Source baseline | BE `3391832`, FE `d2465c0`; both are stacked on the local Platform Services branches               |
| Purpose         | Complete the platform-admin workflow from API and authorization through the System Admin UI and QA |

## 2. Branch and Integration Strategy

Platform Administration must retain the audit and notification capabilities implemented by Platform Services. The current WMS-151/183 commits are local and are not yet present in `origin/dev`, so these branches are intentionally stacked:

```text
origin/dev
   |
   +-- WMS-151/183 Platform Services
           |
           +-- WMS-154/184 Platform Administration
```

Required PR order:

1. Push and merge WMS-151/183 Platform Services into `dev` first.
2. Rebase or merge the updated `dev` into WMS-154/184 and resolve only dependency-related changes.
3. Open WMS-154/184 PRs into `dev` after Platform Services is present there.
4. Merge BE before FE, or deploy both within the same release window after the API contract is frozen.

Do not open Platform Administration directly against `dev` while the Platform Services PR is absent; otherwise the PR will include unrelated notification and audit commits.

Repository workflow note: FE `docs/GIT_WORKFLOW.md` currently describes branches and PRs based on `main`, while BE `AGENTS.md` and the project workflow explicitly requested for this module use PRs into `dev`. This spec follows the user's explicit `dev` integration workflow and the Platform Services dependency. Do not merge either feature branch directly into `main`; update the repository workflow document separately if the team wants one permanent convention.

## 3. Source Alignment

### 3.1 Jira child tasks

| Canonical use case      | Backend task | Frontend task | Scope                                                    |
| ----------------------- | ------------ | ------------- | -------------------------------------------------------- |
| UC-PA-01                | WMS-155      | WMS-236       | Browse and search tenants                                |
| UC-PA-02                | WMS-156      | WMS-237       | View tenant platform details                             |
| UC-PA-03                | WMS-157      | WMS-238       | Suspend or reactivate tenant                             |
| UC-PA-04                | WMS-158      | WMS-240       | Create subscription plan                                 |
| UC-PA-05                | WMS-159      | WMS-241       | Update subscription plan                                 |
| UC-PA-06                | WMS-160      | WMS-239       | Deactivate subscription plan                             |
| UC-PA-07                | WMS-161      | WMS-245       | View platform dashboard                                  |
| Related, separate scope | WMS-256      | WMS-257       | Tenant role permissions; do not duplicate in this module |

### 3.2 Checklist aliases

The same seven platform-administration use cases use different identifiers in existing project artifacts:

- Jira uses `UC-PA-01` through `UC-PA-07` and is canonical for implementation tracking.
- `docs/USE_CASE_TRACKING.md` contains an older numeric mapping and is stale for several implemented endpoints.
- The latest pasted checklist maps the same workflow to `UC-110` through `UC-116`.

The task title and business behavior, not the numeric alias, determine scope.

## 4. Current-State Assessment

### 4.1 Backend

| Area               | Existing implementation                                          | Assessment                                                                                                                        |
| ------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Tenant list        | `GET /api/admin/tenants` with page, search and status            | Partial: no query validator, plan/subscription filters, subscription summary or active counts                                     |
| Tenant detail      | `GET /api/admin/tenants/{id}`                                    | Partial: lacks owner, membership status breakdown and full subscription lifecycle data                                            |
| Suspend/reactivate | Two POST endpoints                                               | Unsafe: no reason, transition validation, tenant-session revocation or owner notification                                         |
| Dashboard          | `GET /api/admin/dashboard`                                       | Incorrect revenue: includes Pending/Failed payments; materializes whole tables; lacks status breakdown and service health         |
| Plan list          | Authenticated and public routes reuse the same active-only query | Incomplete: System Admin cannot browse inactive plans or subscriber impact                                                        |
| Plan create/update | Commands and validators exist                                    | Partial: FE response types do not match BE; duplicate name and update validation are incomplete                                   |
| Plan deactivate    | DELETE endpoint exists                                           | Incorrect lifecycle: can hard-delete unused plans and blocks plans with active subscribers instead of retiring the catalog safely |
| Audit              | Available from WMS-151                                           | Reuse and extend with action reason; do not create a parallel audit implementation                                                |
| Notification       | Persistent + SignalR publisher available from WMS-151            | Reuse for tenant state and customer-visible plan changes                                                                          |
| Auth enforcement   | User status checked at login/refresh                             | Gap: tenant status is not checked, so a suspended tenant can continue signing in or refreshing a token                            |

Conclusion: BE APIs exist but are not sufficient for the Jira/checklist business workflow. A BE branch is required.

### 4.2 Frontend

The System Admin workspace currently exposes Dashboard navigation, platform role management, subscription-plan management, Audit Log and Settings. There is no platform dashboard page, tenant directory, tenant detail page, suspend/reactivate workflow, or admin-aware inactive plan catalog.

The existing plan editor is reusable, but its service incorrectly types create/update responses as a full plan while BE returns `Guid`/`Unit`. FE must invalidate and refetch after mutations rather than rely on nonexistent response data.

Conclusion: FE is incomplete for WMS-184 and requires a dedicated branch.

## 5. Business Rules

### 5.1 Tenant lifecycle

1. Only a System Admin with the corresponding platform permission can browse, inspect or change a tenant.
2. Allowed transitions are `Active -> Suspended` and `Suspended -> Active` only.
3. Repeating the current state returns `409 Conflict`; it must not create a misleading duplicate audit event.
4. A trimmed reason is required for both suspension and reactivation, maximum 500 characters.
5. Suspending a tenant prevents new login, token refresh and authenticated tenant operations.
6. Existing refresh tokens for every tenant user are revoked after suspension. Access tokens must also be rejected through a tenant-status authorization check; do not rely only on token expiry.
7. Reactivation restores tenant access but does not restore disabled users, memberships or revoked refresh tokens. Users sign in again.
8. The state change, audit record and persistent notification are saved before realtime publishing.
9. Realtime delivery failure is logged and must not roll back the successful state change or persisted notification.
10. The tenant owner receives the tenant status notification. The System Admin actor uses Audit Log as the administrative record and does not need a self-notification.

### 5.2 Subscription-plan lifecycle

1. Public and tenant-facing plan catalogs return active plans only.
2. The System Admin catalog can filter both active and inactive plans.
3. Plan names are trimmed, case-insensitively unique across all statuses, and limited to 100 characters.
4. Monthly price is positive; yearly discount is 0-100; display order is positive; feature codes cannot repeat within a plan.
5. Create returns the created plan DTO. Update returns the updated plan DTO. Contract and FE typing must match.
6. Deactivation is a soft transition to `Inactive`; plans are never hard-deleted through this use case.
7. Existing tenants may remain on an inactive plan. The plan is hidden from new subscription/upgrade selection.
8. Deactivation is blocked while the plan is referenced as `PendingPlanId`; the admin must resolve pending changes first.
9. Repeated deactivation returns `409 Conflict`.
10. Current subscribers receive a persisted/realtime notification that their plan was retired from the catalog but remains effective until they change plan. A normal price/feature update notifies affected current or pending subscribers only when tenant-visible values changed.

### 5.3 Dashboard and revenue

1. Revenue includes `Completed` payments only and uses `PaidAt` as the period timestamp.
2. Pending, failed or cancelled payments never contribute to revenue.
3. Subscription counts use an effective status derived from stored status, end date and cancellation state at the query timestamp.
4. Aggregates execute in the database; the handler must not load every tenant, subscription and payment into memory.
5. Service health reports API, SQL Server and Redis independently. A degraded dependency must not fabricate a healthy state.
6. Health information is operational metadata only; tenant business data must never be exposed by the health response.

## 6. Target Backend API Contract

All responses keep the existing `ApiResponse<T>` envelope and JSON string enums.

### 6.1 Tenant directory

`GET /api/admin/tenants`

Query:

| Field                | Type                        | Rule                                                       |
| -------------------- | --------------------------- | ---------------------------------------------------------- |
| `pageNumber`         | integer                     | >= 1, default 1                                            |
| `pageSize`           | integer                     | 1-100, default 20                                          |
| `search`             | string?                     | Trimmed; tenant name, email or owner email                 |
| `status`             | `TenantStatus?`             | Optional                                                   |
| `subscriptionStatus` | `TenantSubscriptionStatus?` | Optional effective status                                  |
| `planId`             | Guid?                       | Optional                                                   |
| `sortBy`             | enum                        | `createdAt`, `tenantName`, `status`, `subscriptionEndDate` |
| `sortDirection`      | enum                        | `asc`, `desc`                                              |

Item response:

```text
id, tenantName, email, phone, status, createdAt,
ownerName, ownerEmail,
activeUserCount, warehouseCount,
subscriptionPlanId, subscriptionPlanName,
subscriptionStatus, subscriptionEndDate
```

Search, filters, sort, projection and pagination remain server-side and deterministic.

### 6.2 Tenant detail

`GET /api/admin/tenants/{tenantId}`

Response sections:

- Organization: ID, name, email, phone, address, status, created date.
- Owner: user ID, full name, email, phone, status and last login.
- Usage: active/total memberships and active/total warehouses.
- Subscription: subscription ID, current plan, billing cycle, start/end date, effective status, auto renew, cancelled date, pending plan and pending billing cycle.
- Billing summary: last completed payment amount/date/invoice and total completed revenue for that tenant.

Return `404` without leaking cross-scope data when the tenant is absent.

### 6.3 Tenant state commands

```http
POST /api/admin/tenants/{tenantId}/suspend
POST /api/admin/tenants/{tenantId}/reactivate
Content-Type: application/json

{ "reason": "Business reason recorded in the audit trail" }
```

Return the updated tenant status response rather than MediatR `Unit`.

### 6.4 Platform dashboard

`GET /api/admin/dashboard`

Response:

```text
tenantSummary: total, active, suspended, newLast30Days, newThisMonth, newThisYear
subscriptionSummary: active, trial, pastDue, cancelled, expired
revenueSummary: totalCompleted, thisMonthCompleted, thisYearCompleted
planDistribution[]: planId, planName, tenantCount
serviceHealth[]: service, status, checkedAt, optionalMessage
```

The controller may compose business aggregates with an application-facing health reader; do not reference ASP.NET health-check types from Domain.

### 6.5 Admin plan catalog

`GET /api/subscription-plans/admin`

Query: `pageNumber`, `pageSize`, `search`, `status`, `sortBy`, `sortDirection`.

Each item contains the existing plan fields plus `currentSubscriberCount` and `pendingSubscriberCount`. Keep `GET /api/public/subscription-plans` and the tenant-facing active catalog unchanged.

Mutation responses:

- `POST /api/subscription-plans` -> `ApiResponse<SubscriptionPlanResponse>`.
- `PUT /api/subscription-plans/{id}` -> `ApiResponse<SubscriptionPlanResponse>`.
- `DELETE /api/subscription-plans/{id}` -> `ApiResponse<SubscriptionPlanResponse>` with status `Inactive`.

## 7. Notification and Audit Integration

Extend the Platform Services contract rather than adding another realtime channel:

- Add notification types `TenantStatusUpdate` and `SubscriptionPlanUpdate` to BE and FE schemas.
- Persist a notification for each intended tenant-owner recipient.
- Publish `NotificationCreated` through `INotificationRealtimePublisher` only after the database save succeeds.
- Use `ReferenceType = "Tenant"` for tenant state events and `ReferenceType = "SubscriptionPlan"` for plan events.
- Tenant-owner navigation for plan updates points to `/subscription`.
- A suspended user may receive the persisted tenant notification but cannot open protected tenant pages until reactivated; after login it remains visible in notification history.
- Audit `reason` is mandatory for tenant state actions and includes old/new state. Plan audit records old/new customer-visible values without storing secrets.

Fan-out must be recipient-distinct and tenant-scoped. Use a set of owner IDs so a tenant receives at most one notification per action.

## 8. Frontend Scope

### 8.1 Routes and navigation

Add System Admin routes:

```text
/admin/dashboard
/admin/tenants
/admin/tenants/[tenantId]
/admin/subscription-plans
```

- System Admin login/dashboard redirect targets `/admin/dashboard`, not `/admin/roles`.
- Navigation group `Quản trị nền tảng` contains Dashboard, Tenants, Subscription Plans and Roles.
- Route permission checks remain System Admin-only and honor the existing permission keys.

### 8.2 Pages

Platform dashboard:

- KPI cards for tenant/subscription/revenue totals.
- Tenant growth and plan distribution visualizations based on real API data.
- Service health list with healthy/degraded/unhealthy states and last checked time.
- Explicit loading, error and empty states; no mock metrics.

Tenant directory:

- Debounced search, status/plan/subscription filters, server pagination and deterministic sort.
- Desktop data table plus responsive mobile presentation without horizontal page overflow.
- Status, current plan and subscription expiry are visible without opening details.
- Row/menu actions are semantic buttons or links and are permission-aware.

Tenant detail:

- Organization, owner, usage, subscription and billing-summary sections.
- Suspend/reactivate confirmation dialog with required reason field.
- Action state is disabled while pending; `409` conflicts trigger a detail/list refetch.
- Successful mutation updates tenant list, detail, dashboard and Audit Log query caches.

Subscription plans:

- Reuse existing plan form components and Zod schema.
- Add active/inactive filter and subscriber-impact information.
- Deactivation dialog explains that current subscribers remain active and shows pending-reference blockers.
- Align create/update/deactivate response types with the finalized BE contract.

### 8.3 Frontend structure

Keep code inside `src/features/admin/` until a second unrelated consumer exists:

```text
src/features/admin/
  components/PlatformDashboard/
  components/TenantDirectory/
  components/TenantDetails/
  components/SubscriptionPlansPage/
  hooks/
  pages/
  schemas/
  services/
  types/
  utils/
```

Use TanStack Query for server state, React Hook Form + Zod for action forms, existing shadcn components and semantic Tailwind tokens. Do not store API data in Zustand.

### 8.4 Design direction and layout system

Design read: this is a dense B2B System Admin workspace for operational monitoring and controlled platform actions. The interface should feel precise, calm and scannable, not like a marketing dashboard.

| Design dial      | Value | Reason                                                                           |
| ---------------- | ----- | -------------------------------------------------------------------------------- |
| Design variance  | 3/10  | Predictable hierarchy is safer for administrative workflows                      |
| Motion intensity | 2/10  | Motion is limited to existing dialog, sheet, dropdown and state transitions      |
| Visual density   | 7/10  | Admin users need compact comparison without turning the page into a data cockpit |

Visual rules:

- Keep the existing SSWMS Fresh Logistics design system, Inter typography, Lucide icon family, shadcn/ui primitives and Tailwind semantic tokens. Do not add Fluent, Carbon or a second component system.
- Use `bg-background` for the workspace, `bg-card` for meaningful data containers and `border-border` for separation. Prefer borders and tonal surfaces over shadows.
- Use the existing 4px base radius and current larger radius tokens only where the design system already uses them.
- Use `chart-1`, `chart-2`, `chart-3` and other existing chart tokens through `src/app/index.css`. Do not hard-code chart colors in feature components.
- Use JetBrains Mono only for IDs, invoice numbers, prices and machine-readable values. Keep headings and labels in Inter.
- Use color for semantic state, not decoration. Active/healthy, suspended/destructive and degraded/warning states must include a text label or icon so color is not the only cue.
- Reuse existing `MetricCardGrid`, chart primitives, Table, Badge, Dialog, Sheet, Select, Input, Pagination, Skeleton, Alert and Empty components before adding feature-specific composition.
- Do not introduce glassmorphism, large gradients, oversized headings, decorative animation or equal-height cards where no hierarchy exists.

Page-shell rules:

- All screens stay inside the existing private layout and sidebar; do not create a second admin shell.
- Use a maximum content width of 1440px with `w-full`, centered horizontal alignment and 16px mobile / 24px desktop gutters.
- Page title, description, primary action and breadcrumb remain in one compact header band. The title must not consume a dashboard row by itself.
- Data-table pages follow the mandatory fixed-viewport pattern from `.rules`: `h-full flex flex-col`, `flex-1 min-h-0`, fixed toolbar and internal table-card scrolling.
- Dashboard and detail pages may use the private content area's vertical scroll because their sections are not one continuous table.
- Never allow page-level horizontal scrolling. Wide desktop tables may scroll horizontally only inside their bordered table container.
- At widths below 768px, multi-column regions collapse to one column and desktop tables switch to an explicit mobile list/card presentation when essential columns cannot fit safely.

### 8.5 Platform dashboard blueprint

Desktop uses a 12-column grid. The metric row is compact and the primary analytical chart gets more visual weight than supporting summaries.

```text
+--------------------------------------------------------------------------------+
| Breadcrumb / Platform dashboard                         Last refreshed / Reload |
| Operational summary and concise date context                                    |
+-------------------+-------------------+-------------------+----------------------+
| Total tenants     | Active tenants    | Active subs       | Completed revenue    |
+-----------------------------------------------+--------------------------------+
| Tenant growth and status trend (8 columns)    | Service health (4 columns)     |
|                                               | API / SQL / Redis              |
+-----------------------------------------------+--------------------------------+
| Plan distribution (7 columns)                 | Subscription status (5 cols)   |
+-----------------------------------------------+--------------------------------+
```

Layout behavior:

- KPI cards use the existing four-column metric grid at large widths, two columns on tablet and one column only below the narrow-mobile breakpoint.
- Revenue labels explicitly say completed revenue; never imply Pending/Failed amounts are included.
- Tenant trend is the visual anchor. It uses a line/area chart only when the API returns a time series; otherwise use a status-distribution chart and do not fabricate historical points.
- Service health is a compact list, not three decorative cards. Each row shows service name, semantic status, checked time and a short failure message when degraded.
- Plan distribution uses a horizontal bar chart when plan names are long. Subscription status uses a compact donut or segmented summary with an adjacent accessible legend.
- Charts expose text summaries and tooltips, keep zero-data states meaningful and avoid horizontal overflow.
- Loading skeletons mirror the KPI and chart geometry. A partial service-health failure must not replace otherwise valid business metrics with a full-page error.

### 8.6 Tenant directory blueprint

The tenant directory is a fixed-viewport data workspace with three stable regions: heading/actions, filters and results.

```text
+--------------------------------------------------------------------------------+
| Tenants                                         Result count / Refresh          |
| Search and manage organizations across the platform                            |
+--------------------------------------------------------------------------------+
| Search tenant/email | Tenant status | Subscription | Plan | Sort | Clear        |
+--------------------------------------------------------------------------------+
| Tenant              | Owner        | Plan         | Users | Warehouses | Status |
| sticky table header                                                            |
| internally scrollable rows                                                      |
| ...                                                                              |
+--------------------------------------------------------------------------------+
| Showing x-y of n                          Page size        Pagination            |
+--------------------------------------------------------------------------------+
```

Desktop behavior:

- Search occupies the widest filter column. Status, subscription, plan and sort controls use compact Select/Combobox primitives with `align="start"` and `sideOffset={4}`.
- Keep the status and tenant name visible while horizontally scrolling a genuinely wide result set. Prefer reducing optional columns before adding sticky columns.
- Tenant name is the explicit detail link. Do not make the entire row a fake clickable control.
- Row actions use a right-aligned dropdown menu with `align="end"`; destructive state changes are not executed directly from the menu and always open the reason dialog.
- Pagination remains outside the scrolling table body using Pattern C from `.rules`.

Mobile behavior:

- The search field remains visible. Secondary filters move into a Sheet with an active-filter count and a clear-all action.
- Results become one card/item per tenant: tenant name and status first, owner and plan second, compact user/warehouse counts last.
- Tapping the tenant name/details link navigates to detail. The overflow menu remains a real button with an accessible name.
- Mobile uses natural vertical scrolling and never renders the desktop table squeezed into the viewport.

### 8.7 Tenant detail blueprint

Desktop uses an 8/4 split. Read-only business information stays on the left; tenant state and high-risk actions stay in a clearly separated right rail.

```text
+--------------------------------------------------------------------------------+
| Back to tenants / Tenant name                         Status badge / Refresh     |
+------------------------------------------------------+-------------------------+
| Organization and owner (8 columns)                   | Tenant state (4 cols)   |
| - contact and address                                | current status           |
| - owner identity and last login                      | suspend/reactivate       |
|                                                      | audit reason required    |
+------------------------------------------------------+-------------------------+
| Usage summary                                        | Subscription snapshot    |
| active/total users and warehouses                    | plan, cycle, expiry      |
+------------------------------------------------------+-------------------------+
| Subscription lifecycle and pending change            | Billing summary          |
| start/end, auto-renew, cancellation                  | last paid / total paid   |
+------------------------------------------------------+-------------------------+
```

Layout behavior:

- The right rail may be sticky at desktop only when it fits within the viewport; it becomes normal flow on tablet/mobile.
- The tenant status panel uses an Alert-style tonal container so the destructive action is visually distinct from ordinary details.
- Suspend/reactivate opens an AlertDialog/Dialog containing a React Hook Form reason field. The dialog states the access impact before confirmation and places the destructive action last.
- Organization and owner data use definition-list semantics or labeled item groups, not disabled form inputs.
- Usage values are compact metrics, not another four-card dashboard row.
- Subscription and billing sections show explicit empty states for tenants without a subscription or completed payment.
- On mobile, order sections as status/action, organization/owner, usage, subscription, billing so the most consequential state is visible early.

### 8.8 Subscription-plan administration blueprint

Retain and evolve the current Subscription Plans screen instead of redesigning it as a separate visual system.

```text
+--------------------------------------------------------------------------------+
| Subscription plans                                         Create plan          |
| Catalog rules and subscriber impact                                             |
+--------------------------------------------------------------------------------+
| Compact summary: active / inactive / current subscribers / pending changes      |
+--------------------------------------------------------------------------------+
| Search | Status | Sort                                      Clear filters       |
+--------------------------------------------------------------------------------+
| Plan | Monthly | Yearly | Features | Current | Pending | Status | Actions       |
| internally scrollable table and fixed pagination footer                         |
+--------------------------------------------------------------------------------+
```

Layout behavior:

- Keep the current form dialog and feature editor composition, but align it with the finalized BE create/update validators before coding.
- The summary is one divided tonal strip, not four floating decorative cards.
- Current and pending subscriber counts are visible before the action column so the administrator understands impact before opening the menu.
- Inactive plans remain legible and filterable; use muted treatment without reducing text contrast below WCAG AA.
- The deactivation dialog explains that current subscribers continue, the plan disappears from new selection and pending-plan references can block the action.
- On mobile, plan items show name/status/pricing first and place feature count plus subscriber impact in a collapsible details region. Editing continues in a full-height scroll-safe dialog or Drawer using existing primitives.

### 8.9 Interaction, responsive and accessibility acceptance

- Desktop target: 1280px and above; tablet: 768-1279px; mobile: below 768px.
- All controls have visible labels, focus states and keyboard access. Icon-only actions include accessible names and tooltips where the icon meaning is not universal.
- Status is always represented by label plus color/icon. Charts have a textual equivalent and do not rely solely on hover.
- Dialogs focus the heading or first invalid field, trap focus and return focus to the trigger after close.
- Filter changes announce result-count changes without aggressively moving focus.
- Loading, error, empty, success, stale/refetching and disabled/submitting states are designed for every page.
- Realtime refresh preserves the user's current filters, page and open detail context. Do not reset the table to page 1 for an unrelated notification.
- Use the animation durations already mandated by `.rules`: 200ms dropdowns, 250ms dialogs and 300ms sheets. No autonomous dashboard animation is required.
- Verify no horizontal viewport overflow at 360px, 768px, 1280px and 1440px, and verify internal table scrolling does not cause the full screen to scroll vertically on desktop.

## 9. Authorization and Security

- Keep platform data outside tenant query filters only for authenticated System Admin requests with explicit permissions.
- Validate all IDs and enums through FluentValidation and return the project-standard error envelope.
- Add a tenant-active authorization check after authentication for all tenant-scoped users; exempt System Admin and public/auth/health/payment callback routes as appropriate.
- Suspension revokes `refresh_token:{userId}` for all tenant users. Cache invalidation failures must be observable and handled according to the project failure policy.
- Do not allow a tenant ID from request input to define notification or audit scope.
- Do not expose payment provider IDs or sensitive configuration in dashboard/detail responses.

## 10. Data and Migration Decision

The target behavior can be implemented with current entities and computed projections. No entity or schema change is currently required.

If implementation proves that a new persisted field is required, update the entity/configuration first and generate the EF migration using the repository command from `.rules`/`AGENTS.md`; never hand-write a migration. Do not add a migration merely for DTO, validator, query or notification-enum changes.

Run migration generation from the BE repository root:

```bash
dotnet ef migrations add <MigrationName> --project Infrastructure --startup-project API
dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API
```

Review the generated migration and model snapshot before accepting them. Do not manually create the migration, designer or snapshot files.

## 11. Implementation Phases and Progress

### Phase 0 - Discovery and contract freeze

- [x] Read FE/BE `.rules`, `AGENTS.md` and referenced coding/workflow documents.
- [x] Read Jira epics and child-task scope for WMS-154/184.
- [x] Compare Jira with the local UC checklist and current FE/BE code.
- [x] Identify Platform Services as an explicit dependency.
- [x] Create stacked FE and BE feature branches.
- [x] Write and review this BE-to-FE specification.
- [x] Confirm final response DTO examples with FE types before implementation.

### Phase 1 - BE tenant administration

- [x] Add validated tenant list filters/sort and SQL-side projection.
- [x] Expand tenant detail contract and projection.
- [x] Add reason DTO/validators and strict tenant state transitions.
- [x] Enforce suspended-tenant login, refresh and request blocking.
- [x] Revoke tenant refresh tokens on suspension.
- [x] Persist and publish owner notifications after successful state changes.
- [x] Add audit reason and old/new status assertions.
- [x] Add handler and authentication-state tests.

### Phase 2 - BE subscription-plan administration

- [x] Separate admin plan listing from public/tenant active catalog.
- [x] Add admin filters, pagination and subscriber-impact counts.
- [x] Harden create/update validation and unique-name rules.
- [x] Align create/update response contracts with the CQRS `Guid`/`Unit` repository rule.
- [x] Replace delete/hard-delete behavior with soft deactivation.
- [x] Define pending-plan blocker and existing-subscriber behavior.
- [x] Persist/publish affected-owner notifications.
- [x] Add plan lifecycle, audit and notification tests.

### Phase 3 - BE dashboard and service health

- [x] Replace in-memory materialization with database aggregates.
- [x] Count only completed payments by `PaidAt`.
- [x] Add effective subscription breakdown and plan distribution.
- [x] Add an application-facing SQL/Redis/API health reader.
- [x] Add aggregate and degraded-health presentation tests.

### Phase 4 - FE foundation and platform dashboard

- [x] Add API endpoints, contracts, query keys, services and hooks.
- [x] Add `/admin/dashboard` and update System Admin default redirect.
- [x] Add navigation/route permission coverage.
- [x] Build dashboard loading/error/success/degraded-health states.
- [x] Add component/service/query tests.

### Phase 5 - FE tenant administration

- [x] Build tenant directory filters, sort and pagination.
- [x] Build responsive list/table states without page overflow.
- [x] Build tenant detail sections.
- [x] Build accessible suspend/reactivate reason dialogs.
- [x] Implement mutation cache invalidation and conflict handling.
- [x] Add component, schema and service workflow tests.

### Phase 6 - FE subscription-plan completion

- [x] Integrate admin plan endpoint and inactive plans.
- [x] Correct mutation response typing.
- [x] Show subscriber impact and deactivation rules.
- [x] Preserve existing create/update/deactivate regressions and add admin endpoint filtering tests.

### Phase 7 - Integration and QA

- [x] Run BE build/tests and migration-model verification.
- [x] Run FE format/lint/typecheck/tests/build.
- [x] Test System Admin dashboard, tenant list/detail and plan catalog APIs.
- [x] Test tenant-owner notification persistence and recipient routing.
- [x] Test the SignalR popup directly in a browser.
- [x] Test realtime failure while database state and notification remain saved.
- [x] Test suspended tenant login, refresh and active-token rejection.
- [x] Verify tenant isolation and permission denial.
- [x] Verify responsive layouts at 360px, 768px, 1280px and 1440px in a browser.
- [ ] Update Jira child-task status only after the matching acceptance checks pass.

Runtime QA note (2026-09-02): System Admin login and read-only calls for dashboard, tenant
filter/detail and admin plan catalog passed against the local API. A reversible tenant lifecycle run
also passed: suspend response, blocked login, active-token rejection, reactivate response, restored
login, two owner notifications, two reasoned Audit Log entries and Tenant Owner denial on the admin
dashboard. The tenant was restored to `Active`. API, Redis and SQL Server all reported `Healthy`.
Authenticated visual QA passed for the System Admin dashboard, tenant list/detail and subscription
plan catalog at 360px, 768px, 1280px and 1440px without page-level horizontal overflow. A real
subscription-plan update event also reached the Tenant Owner browser through SignalR, incremented
the unread badge and displayed the Sonner popup; the Premium plan display order was restored to `3`
after the reversible check. The 24 temporary recipient notifications and 12 audit entries produced
by the subscription-plan QA toggles were removed after verification.

## 12. Automated Test Matrix

Backend minimum:

- Tenant query validation, filters, stable pagination and projection.
- Active-to-suspended and suspended-to-active success paths.
- Invalid/repeated transitions and missing reason.
- Suspended tenant login, refresh token and authenticated API rejection.
- Tenant-owner recipient routing and no cross-tenant notification.
- Persisted notification survives realtime publisher failure.
- Completed-only revenue and month/year boundaries.
- Effective subscription-status counts.
- Admin plan inactive visibility; public plan inactive exclusion.
- Duplicate names, duplicate feature codes and invalid values.
- Deactivation with current subscribers, pending-plan blocker and repeated deactivation.

Frontend minimum:

- System Admin route redirect and navigation visibility.
- Tenant query-param serialization and debounce behavior.
- Tenant directory loading, error, empty and paged success states.
- Detail rendering with nullable subscription/payment data.
- Required reason validation and mutation conflict recovery.
- Plan active/inactive filters and correct mutation contract.
- Dashboard zero-data and degraded-health states.
- Notification type parsing and route mapping.
- No horizontal viewport overflow at supported mobile/desktop widths.

## 13. Definition of Done

The module is complete only when:

- All seven Jira use cases work through real BE contracts and FE workflows.
- Tenant suspension is an enforceable access-control state, not a display-only flag.
- Revenue and subscription metrics are business-correct and tested.
- Plan deactivation preserves history and current subscribers while hiding the plan from new selection.
- Audit and notification integration reuses WMS-151/183 and passes persistence/realtime-failure tests.
- FE has no mocked controls, dead actions, contract casts or unhandled loading/error/empty states.
- BE and FE validation commands are green and authenticated browser QA is recorded.
- The Platform Services PR lands before the Platform Administration PRs, and both final branches are synchronized with the latest `dev`.
