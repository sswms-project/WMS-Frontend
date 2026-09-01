# WMS-151/183 Platform Services Specification

## 1. Document Control

| Field                | Value                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend Jira        | [WMS-183 - Frontend Platform Services](https://ngocthiennguyen28052004-1779890740761.atlassian.net/browse/WMS-183)                                                                  |
| Backend Jira         | [WMS-151 - Backend Platform Services](https://ngocthiennguyen28052004-1779890740761.atlassian.net/browse/WMS-151)                                                                   |
| Backend child tasks  | `WMS-152` (Notification REST), `WMS-153` (Audit Log), `WMS-259` (Notification realtime)                                                                                             |
| Frontend child tasks | `WMS-233` (Notification REST UI), `WMS-235` (Audit Log UI), `WMS-260` (Notification realtime UI)                                                                                    |
| Checklist source     | [Report3_ProjectTracking](https://docs.google.com/spreadsheets/d/1JZHPvytTkcLCPws7zllLrkqNMNCujeHK5SK_FN3CnU8/edit?gid=1480330355#gid=1480330355), `Use Case Registry` rows 109-110 |
| Frontend baseline    | `dev` at `0b38095`                                                                                                                                                                  |
| Backend baseline     | `dev` at `cebda04`                                                                                                                                                                  |
| Frontend branch      | `feat/wms-183-platform-services`                                                                                                                                                    |
| Backend branch       | `feat/wms-151-complete-platform-services`                                                                                                                                           |
| Created              | 2026-08-31                                                                                                                                                                          |
| Last updated         | 2026-09-01                                                                                                                                                                          |
| State                | Implementation complete; realtime workflow, routing, persistence, and popup verified end to end; narrow-viewport visual QA remains                                                  |
| Accepted use cases   | `0 / 2`                                                                                                                                                                             |

This file is the canonical implementation specification and progress tracker for Platform Services
from backend contract through frontend delivery. Existing scaffold or endpoints are baseline evidence,
not proof that a use case is complete.

## 2. Status Legend And Update Rules

- `Not started`: no implementation beyond the baseline described here.
- `In progress`: implementation exists but the acceptance checklist is incomplete.
- `Blocked`: a named dependency prevents safe progress.
- `Ready for QA`: implementation and automated checks pass; authenticated browser QA remains.
- `Done`: automated checks, permission tests, responsive QA, and acceptance criteria pass.

Progress rules:

- Check an item only when code or test evidence exists.
- Update the phase table, use-case state, accepted count, and progress log together.
- Do not count a route, DTO, placeholder, or mock-data screen as a completed use case.
- Backend contracts must be completed and verified before frontend service integration is frozen.
- Jira status must not be changed unless the user explicitly requests it.

## 3. Source Reconciliation

### Jira

- `WMS-183` requires Notification and Audit Log screens with search, filters, read states,
  permission controls, API integration, and complete loading/empty/pending/error/success states.
- `WMS-233` implements `UC-NT-01` against the backend `WMS-152` contract.
- `WMS-235` implements `UC-AU-01` against the backend `WMS-153` contract.
- `WMS-259` implements persisted-first ASP.NET Core SignalR delivery under backend Epic `WMS-151`.
- `WMS-260` implements the single authenticated SignalR client/provider under frontend Epic
  `WMS-183` and depends on `WMS-233` plus `WMS-259`.
- `WMS-151` is the backend Epic. Its existing implementation is only a partial baseline and does
  not satisfy all checklist filters, authorization, validation, or presentation needs.

### Checklist

| Use case   | Goal                                                   | Actors                                           | Required flow/business rules                                                                                                                               |
| ---------- | ------------------------------------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `UC-NT-01` | Review event-driven notifications relevant to the user | Tenant Owner, Warehouse Manager, Warehouse Staff | Open Notifications; filter by type, date, and read state; preserve read state; return only the current user's notifications in the active tenant (`BR-27`) |
| `UC-AU-01` | Trace approvals and business-significant actions       | Tenant Owner, Warehouse Manager, Platform Admin  | Filter by actor, action, entity, and date; deny cross-scope access; Platform Admin sees platform logs only (`BR-25`, `BR-26`)                              |

Relevant business rules:

- `BR-25`: maker-checker separation is mandatory for approval flows.
- `BR-26`: approvals, rejections, lifecycle changes, authentication-sensitive changes, and
  inventory-changing actions create immutable audit entries.
- `BR-27`: notifications are user-scoped, retain read state, and are visible only to the addressed
  user within the active tenant.

### Repository Tracking Document

`SSWMS-Backend/docs/USE_CASE_TRACKING.md` still marks both use cases as missing and describes the
old state before the current controllers existed. Update that document only after implementation and
verification; do not treat it as the current contract.

## 4. Scope

### Required Scope

- Complete searchable, filterable, paginated Notification API and UI.
- Keep notification read state persistent and tenant/user isolated.
- Add an idempotent mark-all-read operation for the page and header experience.
- Replace the header's sample notification data with React Query-backed API data.
- Deliver newly persisted notifications in real time with ASP.NET Core SignalR and the official
  `@microsoft/signalr` JavaScript client.
- Treat SQL Server/REST as the source of truth: a realtime event triggers cache invalidation and
  refetch rather than becoming a second notification store.
- Complete searchable, filterable, paginated Audit Log API and UI.
- Expose actor and reason data needed to understand an audit entry without extra per-row requests.
- Correct role/permission behavior for Tenant Owner, Warehouse Manager, Warehouse Staff, and
  Platform Admin.
- Preserve immutable, read-only Audit Log behavior; no edit/delete endpoint is allowed.
- Add responsive pages, URL-backed filters, loading, empty, no-result, error, pending, and success
  states.
- Add backend unit/integration tests and frontend component/page/contract tests.

### Completeness Work Required By Warehouse Operations

- Audit entries must remain tenant-scoped for tenant actors and `TenantId == null` for platform
  actions. A Platform Admin must never receive tenant audit rows through this endpoint.
- Existing workflow audit reasons must be returned so approval/rejection decisions are traceable.
- Add audit coverage for the platform lifecycle actions already exposed by this project (tenant
  suspend/reactivate and subscription-plan create/update) so the Platform Admin view is useful.
- Add audit coverage for authentication-sensitive account changes in the existing settings/auth
  flows where the command can safely record an entry without secrets.
- Preserve current workflow audit coverage for purchase, inbound, stock adjustment, cycle count,
  transfer, outbound, return, delivery, and tenant-role permission transitions.
- Publish realtime notification events only after the database write succeeds. Offline or
  reconnecting clients recover through REST refetch, so transient delivery never causes data loss.
- Notification producer expansion beyond events already generated by implemented business flows is
  tracked separately in Section 15 and must not silently expand this ticket into a scheduler or
  messaging-platform project.

### Out Of Scope

- Email, SMS, mobile/browser push delivery, and external message queues.
- Redis backplane or Azure SignalR Service in the first single-instance delivery. These become
  required only when the production backend runs multiple application instances.
- User-configurable notification preferences or notification templates.
- Exporting Audit Log to Excel/PDF; that is a reporting/export use case.
- Editing, deleting, restoring, or manually creating Audit Log records.
- An audit-retention administration screen.
- Redesigning unrelated workflow pages.

## 5. Rules And Implementation Constraints

Implementation priority:

1. Each repository's `.rules` and `AGENTS.md`.
2. FE references: `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`,
   `docs/GIT_WORKFLOW.md`, `docs/AI_WORKFLOW.md`, and `src/app/index.css`.
3. Existing Clean Architecture, CQRS, FluentValidation, React Query, Axios, React Hook Form, Zod,
   logger, Sonner, shadcn/ui, and Lucide patterns.
4. Backend DTOs and validators are authoritative for frontend contracts.

Required architecture:

- Controllers use `ISender` only and return `ApiResponse<T>`.
- Queries/commands and handlers live in Application; response DTOs live in Contract.
- Use a dedicated read abstraction for audit actor projection if the generic repository cannot
  provide a single efficient projection. Do not introduce N+1 user lookups.
- Every list query has FluentValidation for page bounds, date order, search length, and accepted
  enum/filter values.
- FE pages/hooks own server state, URL filters, mutations, permission checks, and orchestration.
- FE presentational components receive typed values and callbacks and never call services directly.
- Query keys include every server filter; mutations invalidate header and page queries consistently.
- Tables/lists scroll inside the application workspace. Do not add page-level horizontal overflow or
  unnecessary document-level vertical scrolling.
- Do not use sample data or optimistic local-only read state as the source of truth.
- Never render raw audit JSON as HTML. Format known JSON safely and fall back to escaped text.
- Use one authorized SignalR connection per authenticated browser session, hosted by the private
  application layout. Pages and presentational components must not open their own connections.
- Derive realtime user routing from verified JWT `tenant_id` and user identifier claims. Never let a
  client choose another user's group or routing key.
- Realtime payloads are minimal invalidation signals and must not contain secrets or full audit data.

Realtime technology references:

- [ASP.NET Core SignalR JavaScript client](https://learn.microsoft.com/en-us/aspnet/core/signalr/javascript-client)
- [SignalR authentication and authorization](https://learn.microsoft.com/en-us/aspnet/core/signalr/authn-and-authz)
- [SignalR production hosting and scaling](https://learn.microsoft.com/en-us/aspnet/core/signalr/scale)
- The single-instance server uses SignalR from the ASP.NET Core shared framework. FE adds
  `@microsoft/signalr`. Add `Microsoft.AspNetCore.SignalR.StackExchangeRedis` only if a reviewed
  multi-instance deployment adopts a Redis backplane.

Migration rule:

- If entity configuration, columns, relationships, constraints, or indexes change, generate the
  migration with the repository's EF command from the correct startup/project paths. Never create a
  migration file or model snapshot by hand.
- Review the generated migration and snapshot, then run migration discovery/build tests. Do not run
  a destructive database update against a shared database without explicit authorization.

## 6. Current Baseline And Confirmed Gaps

### Backend Baseline

- `GET /api/notifications` supports `IsRead`, `Type`, `PageNumber`, and `PageSize`.
- `PUT /api/notifications/{id}/read` persists one notification's read state.
- `GET /api/audit-logs` supports entity, actor ID, date, and pagination filters.
- Global EF tenant query filters provide an additional tenant boundary.
- `WorkflowAuditLogger` records state changes and reason data for many warehouse workflows.
- Delivery failure currently creates the only confirmed application notification.
- No SignalR services, hub endpoint, authenticated user routing, or realtime publisher currently
  exists.

### Backend Gaps

| Severity | Gap                                                                                                | Required resolution                                                                                             |
| -------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| High     | `audit-logs:view` is classified Tenant Owner-only, contrary to `UC-AU-01` Warehouse Manager access | Make it manager-eligible while retaining guaranteed Tenant Owner access and Platform Admin platform-only access |
| High     | Tenant Owner permission synchronization does not explicitly grant `audit-logs:view`                | Backfill/synchronize the required owner permission and test existing tenants                                    |
| High     | Audit query cannot filter by `Action` and response omits `Reason`/actor display data               | Extend query/contract and use an efficient actor projection                                                     |
| High     | Platform actions are not currently represented in the audit producer coverage                      | Audit existing tenant lifecycle and plan lifecycle commands with `TenantId == null`                             |
| Medium   | Notification query lacks search and date filters required by Jira/checklist                        | Add normalized search and inclusive date-range filtering                                                        |
| Medium   | There is no mark-all-read endpoint                                                                 | Add an idempotent active-user/active-tenant bulk command                                                        |
| Medium   | Persisted notifications are not delivered to connected clients                                     | Add an authorized SignalR hub and publish a minimal event after successful persistence                          |
| Medium   | No reconnect/recovery contract exists                                                              | Make REST refetch authoritative after event receipt and every successful reconnect                              |
| Medium   | Notification and Audit Log queries have no validators                                              | Enforce page/date/search bounds with FluentValidation                                                           |
| Medium   | Date-only UI values can exclude the end date if sent at midnight                                   | Define an end-exclusive UTC contract or normalize inclusive end-of-day consistently                             |
| Medium   | Sort is only by `CreatedAt`, which is unstable for equal timestamps                                | Add `Id` as the deterministic secondary order                                                                   |
| Medium   | Current database indexes do not match the main tenant/user/date/read query patterns                | Add generated EF migration for reviewed composite indexes if query-plan inspection confirms it                  |
| Low      | `docs/USE_CASE_TRACKING.md` is stale                                                               | Update after verified completion                                                                                |

### Frontend Baseline

- `NotificationBell` exists in the private header.
- `queryKeys.notifications` exists as a partial scaffold.
- Tenant Owner sidebar contains planned, non-navigable `Thông báo` and `Audit Log` items.
- There are no Platform Services feature types, schemas, services, hooks, pages, page tests, routes,
  or API endpoint constants.

### Frontend Gaps

| Severity | Gap                                                  | Required resolution                                                                                          |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| High     | Header notifications come from dashboard sample data | Load server data and persist read mutations through the API                                                  |
| High     | No `/notifications` page                             | Implement the complete `UC-NT-01` workspace                                                                  |
| High     | No `/audit-logs` page                                | Implement the complete `UC-AU-01` workspace                                                                  |
| High     | No role/route/permission coverage for either page    | Add route guards, sidebar permission checks, and tests                                                       |
| Medium   | No API contracts or Zod schemas                      | Mirror final backend fields, enums, defaults, and validation limits                                          |
| Medium   | No shared invalidation between page and header       | Use common query-key roots and invalidate both surfaces after read mutations                                 |
| Medium   | No realtime client/provider exists                   | Add one authenticated `@microsoft/signalr` connection at private-layout scope with automatic reconnect       |
| Medium   | No reference navigation policy                       | Navigate only for known reference types/routes; unsupported references remain readable without a broken link |

Decision: both repositories require implementation branches. The old remote BE branch
`feat/wms-151-platform-services` contains the earlier partial implementation, so completion uses the
new branch `feat/wms-151-complete-platform-services` based on the latest `dev`.

## 7. Authorization And Data-Scope Matrix

| Actor                          | Notifications                      | Tenant Audit Log                                      | Platform Audit Log                  |
| ------------------------------ | ---------------------------------- | ----------------------------------------------------- | ----------------------------------- |
| Tenant Owner                   | Own notifications in active tenant | Allowed and guaranteed                                | Denied                              |
| Warehouse Manager              | Own notifications in active tenant | Allowed when granted `audit-logs:view` by tenant RBAC | Denied                              |
| Warehouse Staff                | Own notifications in active tenant | Denied                                                | Denied                              |
| Platform Admin (`SystemAdmin`) | Not required by `UC-NT-01`         | Denied; tenant rows must not leak                     | Allowed for `TenantId == null` only |

Enforcement rules:

- Backend authorization and query scope are authoritative; hidden FE navigation is not security.
- Notification list and mutation predicates include both current `UserId` and active `TenantId`, in
  addition to the EF global tenant filter.
- Realtime routing uses a server-derived composite key such as
  `tenant:{tenantId}:user:{userId}`; client-supplied tenant/user routing is forbidden.
- Audit queries never accept a tenant ID supplied by the client.
- Platform Admin queries must explicitly document and test the `TenantId == null` scope.
- Not-found behavior for a notification outside the active scope must not reveal whether it exists.

## 8. Target Backend Contract

All dates are ISO-8601 UTC instants. FE date-only controls convert local start/end dates into a UTC
half-open interval before sending. The final naming must be frozen from implemented validators and
OpenAPI before FE integration.

### Notifications

#### `GET /api/notifications`

Query parameters:

| Parameter    | Type                | Rules                                                                                      |
| ------------ | ------------------- | ------------------------------------------------------------------------------------------ |
| `SearchText` | `string?`           | Trimmed; bounded length; searches title/message                                            |
| `Type`       | `NotificationType?` | One defined enum value                                                                     |
| `IsRead`     | `bool?`             | `null` means all                                                                           |
| `DateFrom`   | `DateTimeOffset?`   | Inclusive                                                                                  |
| `DateTo`     | `DateTimeOffset?`   | Exclusive upper bound; must be after/equal to start according to final validator semantics |
| `PageNumber` | `int`               | `>= 1`                                                                                     |
| `PageSize`   | `int`               | `1..AppConstants.MaxPageSize`                                                              |

Response:

```text
NotificationListResponse
  Items: NotificationResponse[]
  TotalCount: int
  PageNumber: int
  PageSize: int

NotificationResponse
  Id: Guid
  Type: string
  Title: string
  Message: string
  IsRead: bool
  ReferenceType: string?
  ReferenceId: Guid?
  CreatedAt: DateTimeOffset
```

#### `PUT /api/notifications/{id}/read`

- Idempotently marks one in-scope notification as read.
- Returns success if it was already read.
- Returns not found for a missing or out-of-scope notification.

#### `PUT /api/notifications/read-all`

- Idempotently marks all unread notifications for the current user and active tenant as read.
- Returns the number of changed records so the UI can provide accurate feedback.
- Does not accept `UserId` or `TenantId` from the client.

The header obtains its unread badge through a small `GET /api/notifications?IsRead=false` query and
uses `TotalCount`; no extra count endpoint is necessary.

### Notification Realtime Hub

#### Connection endpoint: `/hubs/notifications`

- Technology: ASP.NET Core SignalR on BE and `@microsoft/signalr` on FE.
- The endpoint requires a valid JWT and the same active tenant context used by REST requests.
- JWT bearer handling may read `access_token` from the query string only for the exact hub path.
  Production uses HTTPS and request logging must redact the token/query value.
- Server routing uses a composite tenant/user identifier derived from claims. A single user's
  multiple tabs/devices in the same tenant may all receive the event.
- The MVP directly hosts SignalR in the existing API process. Redis/Azure scale-out is conditional
  on multi-instance production deployment and is not required for local/single-instance delivery.

Server-to-client event:

```text
Event name: NotificationCreated

NotificationRealtimeEvent
  NotificationId: Guid
  Type: string
  CreatedAt: DateTimeOffset
```

Delivery semantics:

1. The business handler persists `Notification` and completes the database commit.
2. The BE publisher sends `NotificationCreated` to the addressed composite tenant/user key.
3. FE invalidates/refetches notification list and unread queries instead of inserting the event
   payload as authoritative data.
4. After reconnect, FE invalidates/refetches even if it received no event while offline.
5. Repeated events are harmless because refetch and mark-read commands are idempotent.

The realtime channel is best-effort acceleration, not durable storage. A publish failure must not
roll back or delete an already persisted notification. If production later requires retried delivery
across process crashes, introduce a transactional outbox under a separate reviewed scope.

### Audit Log

#### `GET /api/audit-logs`

Query parameters:

| Parameter    | Type              | Rules                                                                             |
| ------------ | ----------------- | --------------------------------------------------------------------------------- |
| `SearchText` | `string?`         | Trimmed; bounded; searches action/entity/description/reason and safe actor fields |
| `Action`     | `string?`         | Exact normalized action filter                                                    |
| `EntityType` | `string?`         | Exact normalized entity filter                                                    |
| `EntityId`   | `Guid?`           | Optional record trace                                                             |
| `UserId`     | `Guid?`           | Actor filter                                                                      |
| `DateFrom`   | `DateTimeOffset?` | Inclusive                                                                         |
| `DateTo`     | `DateTimeOffset?` | Exclusive upper bound                                                             |
| `PageNumber` | `int`             | `>= 1`                                                                            |
| `PageSize`   | `int`             | `1..AppConstants.MaxPageSize`                                                     |

Response:

```text
AuditLogListResponse
  Items: AuditLogResponse[]
  TotalCount: int
  PageNumber: int
  PageSize: int

AuditLogResponse
  Id: Guid
  TenantId: Guid?
  UserId: Guid
  ActorName: string
  ActorEmail: string
  Action: string
  EntityType: string
  EntityId: Guid
  Description: string
  Reason: string?
  OldValue: string?
  NewValue: string?
  CreatedAt: DateTimeOffset
```

No POST, PUT, PATCH, or DELETE Audit Log endpoint is allowed.

## 9. Backend Implementation Plan

### Phase BE-0 - Contract, Scope, And Tests

Status: `Done`

- [x] Add failing validator tests for both list queries.
- [x] Add failing notification isolation/search/date/read-state tests.
- [x] Add realtime authentication, tenant/user routing, post-commit publication, and
      publish-failure persistence tests.
- [ ] Add explicit reconnect-recovery contract tests.
- [x] Add failing audit actor/action/entity/date/search/scope tests.
- [x] Add permission-policy tests for all four roles in Section 7.
- [x] Freeze response/query names before FE type implementation.

### Phase BE-1 - Notification Query And Read Commands

Status: `Done`

- [x] Extend `GetNotificationsQuery` with normalized search and date filters.
- [x] Add `GetNotificationsQueryValidator`.
- [x] Use deterministic `CreatedAt DESC, Id DESC` ordering.
- [x] Keep current-user and active-tenant predicates explicit.
- [x] Keep single-read idempotent and scope-safe.
- [x] Add `MarkAllNotificationsReadCommand`, handler, route, permission, and tests.
- [x] Preserve existing `ApiResponse<T>` envelope and cancellation-token flow.

### Phase BE-2 - Notification Realtime Delivery

Status: `Done`

- [x] Register ASP.NET Core SignalR and map the authorized `/hubs/notifications` endpoint.
- [x] Configure JWT bearer extraction only for the hub path and ensure logs do not expose tokens.
- [x] Implement a claim-derived composite tenant/user identifier or equivalent server-managed group.
- [x] Add an Application abstraction for publishing notification invalidation events; keep SignalR
      types in the API/Infrastructure boundary.
- [x] Publish `NotificationCreated` only after a notification database commit succeeds.
- [x] Keep the payload limited to notification ID, type, and created timestamp.
- [x] Test tenant-qualified routing, multiple users, unauthorized connection rejection, and
      publish-failure persistence behavior.
- [ ] Add explicit multi-connection delivery coverage for one user.
- [x] Document single-instance deployment requirements and the multi-instance scale-out trigger.

### Phase BE-3 - Audit Query And Read Model

Status: `Done`

- [x] Extend `GetAuditLogsQuery` with search and action filters.
- [x] Add `GetAuditLogsQueryValidator`.
- [x] Add actor name/email and reason to the response contract.
- [x] Implement one efficient projection/read service; verify no N+1 queries.
- [x] Use deterministic `CreatedAt DESC, Id DESC` ordering.
- [x] Keep tenant and platform scopes mutually exclusive and covered by tests.
- [x] Confirm old/new values never expose password, token, 2FA secret, or other credentials.

### Phase BE-4 - Permission And Producer Completeness

Status: `Done`

- [x] Make `audit-logs:view` eligible for Warehouse Manager delegation.
- [x] Guarantee Tenant Owner receives `audit-logs:view` for existing and new tenants.
- [x] Keep System Admin access platform-scoped.
- [x] Audit tenant suspend/reactivate and subscription-plan create/update with null tenant scope.
- [x] Audit supported authentication-sensitive changes without logging secrets.
- [x] Re-run maker-checker tests so audit additions do not weaken approval separation.
- [x] Document which business events currently produce notifications and create a separate follow-up
      for producer expansion not owned by `UC-NT-01`.

### Phase BE-5 - Persistence And Verification

Status: `Done`

- [x] Review expected query plans/index coverage for notification and audit filters.
- [x] If indexes/configuration change, generate the EF migration by CLI; never hand-write it.
- [x] Review generated `Up`, `Down`, designer, and model snapshot.
- [x] Build the solution.
- [x] Run targeted Platform Services, SignalR authorization/routing, permission, workflow, and
      migration tests.
- [x] Run the full backend test suite.
- [x] Verify OpenAPI contracts and representative authorized/forbidden API calls.
- [x] Update `docs/USE_CASE_TRACKING.md` only after evidence is complete.

## 10. Frontend Architecture And Implementation Plan

Create `src/features/platform-services` with separate notification and audit subareas where useful,
while keeping one feature boundary and public barrel. Follow the existing service/hook/page split.

Expected structure:

```text
src/features/platform-services/
  components/
    NotificationDirectory.tsx
    NotificationFilters.tsx
    NotificationList.tsx
    AuditLogDirectory.tsx
    AuditLogFilters.tsx
    AuditLogTable.tsx
    AuditLogDetailSheet.tsx
  hooks/
    use-notifications.ts
    use-audit-logs.ts
    use-notification-realtime.ts
  pages/
    NotificationsPage.tsx
    AuditLogsPage.tsx
  schemas/
    platform-services.schema.ts
  services/
    platform-services.service.ts
    notification-realtime.service.ts
  providers/
    NotificationRealtimeProvider.tsx
  types/
    platform-services.types.ts
  utils/
    platform-services-query.ts
    platform-services-format.ts
  index.ts
```

### Phase FE-0 - Contract Foundation

Status: `Done`

- [x] Add `API_ENDPOINTS.notifications` and `API_ENDPOINTS.auditLogs`.
- [x] Add `APP_ROUTES.notifications` and `APP_ROUTES.auditLogs`.
- [x] Add complete notification and audit query keys.
- [x] Add backend-exact response/query/request types.
- [x] Add Zod schemas mirroring backend validators and date semantics.
- [x] Add query builders that trim/omit empty filters and reset page on filter changes.
- [x] Add the official `@microsoft/signalr` dependency and a hub URL builder that uses the API origin
      without the REST `/api` suffix.

### Phase FE-1 - Notification Page And Header

Status: `Done`

- [x] Add `/notifications` App Router page using the feature page default export.
- [x] Implement URL-backed search, type, read state, date range, and paging.
- [x] Provide distinct loading, error, empty, filtered-no-result, and populated states.
- [x] Mark one notification read through the API and invalidate all notification queries.
- [x] Add mark-all-read pending/success/error behavior.
- [x] Replace AppHeader sample data with a small unread query and recent notification query.
- [x] Keep the bell dropdown compact and provide a `Xem tất cả` link.
- [x] Navigate references only through an explicit safe reference-type map.
- [x] Make unread state distinguishable without depending on color alone.

### Phase FE-2 - Notification Realtime Integration

Status: `Done`

- [x] Mount exactly one `NotificationRealtimeProvider` in the authenticated private layout.
- [x] Connect to `/hubs/notifications` with the latest JWT through `accessTokenFactory`.
- [x] Enable automatic reconnect and implement a bounded manual restart after terminal close.
- [x] On `NotificationCreated`, invalidate the notification query root so header and page refetch.
- [x] On successful reconnect, invalidate/refetch to recover notifications missed while offline.
- [x] Stop the connection and remove listeners on logout/unmount; avoid duplicate listeners during
      React development remounts.
- [x] Show a concise Sonner toast for a new event without treating the event payload as stored state.
- [x] Suppress duplicate user-facing toasts while keeping repeated invalidation safe.
- [x] Expose connection status only where useful; loss of realtime must not block REST usage.

### Phase FE-3 - Audit Log Page

Status: `Ready for QA`

- [x] Add `/audit-logs` App Router page using the feature page default export.
- [x] Implement URL-backed search, actor, action, entity, date range, and paging.
- [x] Render actor name/email, action, entity/reference, reason, and timestamp in the directory.
- [x] Add a read-only detail sheet for description and old/new values.
- [x] Safely format JSON differences and preserve an escaped text fallback.
- [x] Provide distinct loading, error, empty, filtered-no-result, and populated states.
- [x] Use internal table/workspace scrolling and responsive mobile cards where the table would
      otherwise force document-level horizontal scrolling.

### Phase FE-4 - Navigation, Permission, And UX Integration

Status: `Done`

- [x] Replace Tenant Owner planned sidebar entries with permission-aware routes.
- [x] Add Notifications navigation for Warehouse Manager and Warehouse Staff.
- [x] Add Audit Log navigation for Warehouse Manager only when permission is granted.
- [x] Add Platform Admin Audit Log navigation without exposing tenant navigation.
- [x] Add route-role guards for both pages and preserve backend `403` handling.
- [x] Add page-heading labels and active-section tests.
- [x] Ensure initial sidebar groups remain closed unless the current route belongs to that group.

### Phase FE-5 - Automated And Browser Verification

Status: `In progress`

- [x] Test services against exact endpoint paths and serialized query parameters.
- [x] Test query builders, schemas, date conversion, and reference routing.
- [ ] Test notification page states and read mutation invalidation.
- [ ] Test header unread badge, dropdown states, and mark-read behavior.
- [x] Test one-connection startup, event invalidation, cleanup, and duplicate-event safety with a
      mocked HubConnection boundary.
- [x] Add explicit JWT-factory and reconnect-refetch assertions at the mocked HubConnection boundary.
- [ ] Test Audit Log permission visibility and safe detail rendering.
- [x] Update nav-config and route-permission tests for all roles.
- [x] Run formatter/lint, typecheck, targeted tests, and full FE tests.
- [ ] Perform authenticated desktop and narrow-viewport browser QA with Tenant Owner, Warehouse
      Manager, Warehouse Staff, and System Admin accounts.
- [ ] Verify no horizontal document scroll and no unnecessary vertical document scroll.
- [x] Verify a notification created in an authenticated BE workflow appears in the intended user's
      header/page without manual refresh and never appears for another user or tenant.

## 11. Use-Case Acceptance Tracker

### UC-NT-01 - View And Search Notifications

Status: `In progress`

- [x] List returns only notifications addressed to the current user in the active tenant.
- [x] Search covers title/message and filters cover type, date, and read state.
- [x] Pagination is validated and deterministic.
- [x] Single-read and mark-all-read states persist after refresh and are idempotent.
- [x] Header badge/dropdown and full page use live API data and remain cache-consistent.
- [x] A newly persisted notification reaches the intended connected user without manual refresh.
- [x] Realtime events never cross user/tenant boundaries.
- [ ] Missed offline events appear after
      reconnect refetch.
- [x] Duplicate events do not duplicate persisted notifications or user-facing state.
- [x] Known references navigate correctly; unknown references do not produce broken links.
- [ ] Loading, empty, no-results, error, pending, success, and responsive states pass.
- [x] Tenant Owner, Warehouse Manager, and Warehouse Staff access passes; cross-user/cross-tenant
      access fails.

### UC-AU-01 - View And Search Audit Log

Status: `In progress`

- [x] Search and actor/action/entity/date filters work with validated deterministic pagination.
- [x] Entries identify actor, action, entity/reference, description, reason, before/after, and time.
- [x] Tenant Owner sees only active-tenant logs.
- [ ] Warehouse Manager sees only active-tenant logs when authorized.
- [x] Warehouse Staff is denied.
- [x] Platform Admin sees platform logs only and cannot obtain tenant logs through query input.
- [x] The module remains immutable with no write/delete operation.
- [x] Representative approval, rejection, lifecycle, inventory, platform, and auth-sensitive actions
      create safe audit evidence.
- [ ] Loading, empty, no-results, error, detail, and responsive states pass.

## 12. End-To-End Delivery Order

| Order | Phase                             | Dependency           | Status       |
| ----- | --------------------------------- | -------------------- | ------------ |
| 1     | BE-0 contract/scope tests         | None                 | Done         |
| 2     | BE-1 notifications                | BE-0                 | Done         |
| 3     | BE-2 notification realtime        | BE-1                 | Done         |
| 4     | BE-3 audit query/read model       | BE-0                 | Done         |
| 5     | BE-4 permissions/producers        | BE-1, BE-3           | Done         |
| 6     | BE-5 persistence and verification | BE-1..BE-4           | Done         |
| 7     | FE-0 contract foundation          | Final BE contract    | Done         |
| 8     | FE-1 notification REST UI         | FE-0 and BE-1        | Ready for QA |
| 9     | FE-2 notification realtime        | FE-0, FE-1, and BE-2 | Done         |
| 10    | FE-3 audit log                    | FE-0 and BE-3/BE-4   | Ready for QA |
| 11    | FE-4 navigation/permissions       | FE-1..FE-3           | Done         |
| 12    | FE-5 verification                 | All prior phases     | In progress  |

Parallelism is allowed only where contracts are already frozen. FE must not invent fields while BE
contracts remain in progress.

## 13. Verification Matrix

### Backend

- Query validation: invalid page/page size, overlong search, invalid date order, invalid enum.
- Notification security: current user/tenant only, other user denied, other tenant not found.
- Notification behavior: search/filter combinations, idempotent single/all read, stable pagination.
- SignalR security: unauthorized connection rejected; routing key comes from claims; no cross-user or
  cross-tenant event delivery.
- SignalR behavior: publish only after commit, all current-user connections receive the event,
  publish failure does not lose stored data, and the scale-out condition is documented.
- Audit security: owner, manager with/without permission, staff, System Admin platform scope.
- Audit behavior: actor/action/entity/date/search, actor projection, reason and diff response.
- Audit producers: representative workflow, platform, and authentication-sensitive transitions.
- Persistence: generated migration discovery and expected indexes if schema changes.
- Regression: maker-checker, warehouse access, and full solution tests.

### Frontend

- Contract serialization and response parsing.
- URL filter parsing/building and page reset.
- Query-key isolation for every filter combination.
- Header/page cache invalidation after mutations.
- SignalR lifecycle: one connection, current access token, automatic reconnect, reconnect refetch,
  listener cleanup, duplicate-event safety, and graceful REST-only degradation.
- Permission-aware sidebar and direct-route behavior for all roles.
- Safe audit diff rendering and fallback.
- Keyboard navigation, focus visibility, labels, status not conveyed by color alone.
- Desktop and narrow viewport without document overflow.

## 14. Definition Of Done

- Both use-case acceptance checklists are complete.
- Backend build, targeted tests, full tests, and migration checks pass.
- Frontend format/lint, typecheck, targeted tests, full tests, and authenticated browser QA pass.
- API and FE contracts match field-for-field with no `any` or unchecked response assumptions.
- No cross-tenant, cross-user, or platform/tenant audit leakage is reproducible.
- Header contains no sample notification data.
- Connected users receive newly persisted notifications without manual refresh, while offline users
  recover the same data through REST after reconnect.
- Realtime delivery uses one authenticated private-layout connection and never becomes a second
  source of truth.
- Audit Log remains read-only and sensitive values are neither stored by new producers nor rendered.
- This spec and `docs/USE_CASE_TRACKING.md` contain current evidence and dates.
- Changes are committed/pushed only after explicit user request.

## 15. Follow-Up Backlog Outside Current Use Cases

Create separate Jira work rather than silently extending `UC-NT-01` for:

- A central notification publisher abstraction and template catalog.
- Event producers for low stock, task assignment, all approval outcomes, and delivery milestones.
- Notification preference controls and delivery channels.
- Multi-instance SignalR scale-out through a colocated Redis backplane or Azure SignalR Service.
- Transactional outbox/retry delivery if future reliability requirements exceed best-effort realtime
  plus REST recovery.
- Audit export, archival/retention jobs, and compliance administration.
- A dedicated audit-event taxonomy/versioned payload if reporting requires structured diffs.

## 16. Risks And Decisions

| Item                                                              | Decision                                                                                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Old `feat/wms-151-platform-services` remote branch already exists | Do not reuse it; use the new completion branch based on current `dev`                                  |
| Warehouse Manager audit access conflicts with current policy      | Checklist is authoritative; make permission manager-eligible and retain backend enforcement            |
| Platform Admin has no tenant context                              | Treat `TenantId == null` as platform scope and test it explicitly                                      |
| End-date ambiguity                                                | Use a documented UTC half-open interval to avoid excluding events later on the selected day            |
| Actor display could cause N+1 queries                             | Use one projected read query/read service                                                              |
| Audit old/new values may contain sensitive data                   | Audit producers must whitelist safe summaries; FE must never render as HTML                            |
| Notification data is currently sparse                             | Complete view/read API in this scope; track broad producer expansion separately                        |
| SignalR events are transient                                      | Persist first, publish second, and refetch after every event/reconnect; SQL/REST remains authoritative |
| Multi-tenant users can have multiple active connections           | Route with a server-derived composite tenant/user key rather than user ID alone                        |
| FE REST base URL ends in `/api` but hubs do not                   | Build the hub URL from the configured API origin and append `/hubs/notifications` exactly once         |
| Multiple BE instances do not share in-memory connections          | Single-instance MVP is allowed; require Azure SignalR or a colocated Redis backplane before scale-out  |

## 17. Progress Log

| Date       | Update                                                                                                                                                                                                                                                                                                                                          | Evidence                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-31 | Synced FE and BE `dev`, read repository rules/references, inspected Jira and live checklist, audited current contracts and UI, confirmed both repositories require completion branches, and created this spec                                                                                                                                   | FE `0b38095`; BE `cebda04`; Jira `WMS-151/152/153/183/233/235`; checklist rows 109-110                                                |
| 2026-09-01 | Re-fetched both remote `dev` branches and confirmed both feature branches remain exactly aligned with their latest baselines                                                                                                                                                                                                                    | `HEAD...origin/dev = 0 0` in both repositories                                                                                        |
| 2026-09-01 | Added realtime notification delivery to required scope using persisted-first ASP.NET Core SignalR plus React Query refetch, with explicit auth, reconnect, testing, and scale-out rules                                                                                                                                                         | Target hub `/hubs/notifications`; event `NotificationCreated`; BE-2 and FE-2 phases                                                   |
| 2026-09-01 | Synchronized Jira scope, split REST and realtime responsibilities, created realtime tasks inside their existing Epics, and moved the expanded BE Epic from Testing to In Progress                                                                                                                                                               | BE `WMS-259` under `WMS-151`; FE `WMS-260` under `WMS-183`                                                                            |
| 2026-09-01 | Implemented Notification REST/read state, Audit query/read model, role permission sync, persisted-first SignalR, FE directories/header/realtime provider, generated query-index migration, and passed full automated verification; authenticated visual QA remains pending because the in-app browser runtime could not initialize              | BE build + `143/143`; FE lint/typecheck/build + `380/380`; authenticated REST role matrix; authorized/unauthorized SignalR handshakes |
| 2026-09-01 | Verified the real persisted-first realtime path end to end: Manager failed an `AssignedToTransport` QA delivery, Owner received one unread notification and a Sonner popup without reload, Manager/Staff received zero, and one audit event was stored. Added provider regression coverage and removed all temporary QA records/code afterward. | Real API + SignalR hub + FE provider/Sonner DOM; BE `145/145`; FE `385/385`; build/lint/typecheck passed                              |
