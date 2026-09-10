# WMS-269/270 Secure Staff Invitations & Personnel Import Specification

## 1. Document Control

| Field             | Value                                                                                                                         |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Date              | 2026-09-08                                                                                                                    |
| Backend epic      | WMS-267 - `[Backend] Organization & Staff`                                                                                    |
| Frontend epic     | WMS-268 - `[Frontend] Organization & Staff`                                                                                   |
| Backend task      | WMS-270 - `[Backend] Secure Staff Invitations & Personnel Bulk Import`                                                        |
| Frontend task     | WMS-269 - `[Frontend] Secure Staff Invitations & Personnel Bulk Import`                                                       |
| Backend branch    | `feat/wms-270-staff-invitations-import`                                                                                       |
| Frontend branch   | `feat/wms-269-staff-invitations-import`                                                                                       |
| Backend baseline  | `f29940f` from `dev`                                                                                                          |
| Frontend baseline | `24fc463` from `dev`                                                                                                          |
| Dependencies      | Existing staff membership, warehouse assignment, RBAC, Audit Log, persisted notifications, SignalR and email infrastructure   |
| Status            | `IMPLEMENTED_REVIEW_PENDING` - implementation, automated gates, live import and both invitation acceptance paths are verified |

### Progress legend

- `[x]` completed and verified.
- `[~]` in progress or implemented but not fully verified.
- `[ ]` not started.
- A phase is complete only when its implementation, automated tests and progress evidence are all complete.

## 2. Goal

Deliver one secure, invitation-first personnel onboarding workflow for KOVIA:

1. A Tenant Owner creates one personnel invitation or imports many personnel records.
2. The system creates `Pending` invitations, not user accounts with owner-known passwords.
3. Each invited person receives a single-use, expiring activation link.
4. A new KOVIA user confirms the invitation and sets their own password.
5. An existing KOVIA user authenticates, accepts the new tenant membership and switches into that tenant without resetting their password.
6. Acceptance atomically activates the membership and all initial warehouse assignments.
7. Invitation and import actions are visible through Audit Log; important completion events use the existing persisted notification and SignalR pipeline.

This module must support both individual creation and CSV/XLSX import without introducing a second staff, notification, audit or authentication subsystem.

## 3. Non-goals

- Sending or importing passwords, temporary passwords or password hashes.
- Creating active users immediately from an uploaded file.
- Allowing Warehouse Manager or Warehouse Staff to invite personnel; `staff:invite` remains Tenant Owner-only.
- Replacing the existing staff directory, role-permission editor or post-accept warehouse reassignment workflow.
- Adding arbitrary custom roles to the import format. This release supports `WarehouseManager` and `WarehouseStaff` only.
- Importing legacy `.xls`, PDF or image files.
- Using AI to interpret personnel files. The template is deterministic and versioned.
- Automatically replacing an existing warehouse manager.
- Exposing invitation tokens, password values or uploaded file contents in logs, audit records or notifications.

## 4. Current-state Assessment

### 4.1 Backend

| Area                 | Current implementation                                             | Gap to close                                                                                                          |
| -------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Single invitation    | `POST /api/invitations` accepts `email`, `role`, one `warehouseId` | Missing full name and multiple initial warehouses                                                                     |
| Invitation token     | Raw token is stored in `Invitation.Token` and indexed              | New tokens must be opaque, high entropy and stored as a hash; resend must rotate the token                            |
| Expiration           | Hard-coded to seven days                                           | Default must be configurable; target UX is 24 hours                                                                   |
| Acceptance           | One anonymous endpoint accepts `fullName` and `password`           | No preview endpoint; full name is not owner-controlled/read-only; existing-user behavior is unsafe and incomplete     |
| Existing KOVIA user  | Handler reuses `User` and creates `UserTenant`                     | Submitted name/password are silently ignored, and authentication cannot retain/switch the selected membership context |
| Warehouse assignment | One nullable `WarehouseId`; acceptance creates one `WarehouseUser` | Must support multiple assignments and revalidate every warehouse at accept time                                       |
| Manager occupancy    | Vacancy is checked at invitation and acceptance                    | Must check every selected warehouse and detect conflicts within a bulk file                                           |
| Invitation list      | Lists email, role, one warehouse ID and status                     | Missing name, warehouse summaries, effective expiry and delivery metadata                                             |
| Audit/notification   | Staff assignment flows use Platform Services                       | Invitation create/resend/revoke/accept/expire and bulk import are not integrated                                      |
| Email                | Existing `IBackgroundJobService` starts a fire-and-forget task     | Not durable enough for bulk delivery; API currently cannot distinguish queued, sent and failed delivery               |
| Bulk import          | Product import and generic `ImportJob` infrastructure exist        | No personnel template, parser, preview, commit or row-level result contract                                           |
| Rate limiting        | IP limiter exists; only inbound document upload has a rule         | Public preview/accept and owner resend/import endpoints need explicit limits                                          |
| Concurrency          | Acceptance changes the tenant concurrency token                    | Invitation itself has no row-version guard; simultaneous accept/resend can race                                       |

### 4.2 Frontend

| Area                  | Current implementation                                | Gap to close                                                                              |
| --------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Staff workspace       | `/staff` has `Nhân sự` and `Lời mời` tabs             | No bulk-import entry point, import page or resumable result                               |
| Single invite         | Dialog accepts email, role and one initial warehouse  | Missing full name and multi-warehouse selection                                           |
| Accept invitation     | Public form asks recipient for full name and password | No token preview; name/email are not read-only; no separate existing-account path         |
| Existing account      | No authenticated accept flow or tenant switch         | User can create membership in BE but cannot reliably enter the new tenant                 |
| Invitation management | Resend/revoke and status list exist                   | Missing warehouse list, expiry countdown/effective status and delivery state              |
| Import                | None                                                  | Needs template download, upload, validation, preview, selection, commit and result states |

### 4.3 Existing code to reuse

- BE: `Invitation`, `UserTenant`, `WarehouseUser`, `ImportJob`, `ImportError`, `IUnitOfWork`, `IEmailSender`, Quartz, `IAuditLog`, `IPlatformNotificationService` and tenant-scoped recipient resolution.
- FE: `StaffDirectoryPage`, `InviteStaffDialog`, `InvitationManagementPanel`, `AcceptInvitationPage`, warehouse query hooks, React Query, React Hook Form, Zod and existing shadcn/ui primitives.
- Existing `ImportJob` is reused with `ImportType = "PersonnelInvitation"`; do not create a parallel generic import aggregate.

## 5. Final Business Decisions

### 5.1 Invitation-first lifecycle

```text
Tenant Owner enters one person or validates an import
        -> Pending invitation is persisted
        -> activation email is queued
        -> recipient previews the invitation
        -> new user sets password OR existing user authenticates
        -> invitation is revalidated and accepted atomically
        -> User/UserTenant/WarehouseUser state is active
        -> inviter receives persisted + realtime completion notification
```

1. Creating an invitation never creates a `User`, `UserTenant` or `WarehouseUser`.
2. The invitation stores the owner-provided full name, normalized email, role and initial warehouse set.
3. A new `User` is created only when a valid invitation is accepted.
4. An existing global `User` keeps their current full name and password. Acceptance adds only the new active `UserTenant` and warehouse assignments.
5. An inactive membership in the same tenant is not reactivated through invitation. The Owner must use the existing staff reactivation workflow.
6. An active membership in the same tenant makes the row/invitation invalid with `409 Conflict`.
7. `Pending -> Accepted`, `Pending -> Revoked` and `Pending -> Expired` are the only terminal transitions. Resending an expired invitation creates a fresh `Pending` token/version for the same invitation record.
8. Accepting, resending or revoking a terminal/stale version must not create duplicate users, assignments, audit rows or notifications.

### 5.2 Roles and warehouse assignments

1. Allowed roles are `WarehouseManager` and `WarehouseStaff`.
2. At least one active same-tenant warehouse is required for both roles.
3. One invitation may contain multiple unique warehouses.
4. A Staff member may be assigned to multiple active warehouses.
5. A Manager may manage multiple warehouses, but each warehouse has at most one active Manager.
6. Manager invitations fail validation when any selected warehouse already has an active Manager. The flow never silently replaces that Manager.
7. Dynamic rules are checked twice: during create/preview and again immediately before accept/commit.
8. If a warehouse becomes inactive or occupied after invitation creation, acceptance returns `409` with an actionable message. The invitation remains `Pending` so the Owner can revoke and create a corrected invitation.

### 5.3 Token and expiration rules

1. Generate at least 64 random bytes and Base64URL-encode the raw bearer token.
2. Store only a SHA-256 hash in the invitation aggregate. Never log or audit the raw token.
3. The raw token may exist only in request memory and an encrypted, expiring email-outbox payload until delivery; it is cleared after send, revoke, expiry or superseding resend.
4. Default lifetime is `24` hours from `InvitationOptions:ExpirationHours`; allowed configuration range is 1-168 hours.
5. Resend rotates the raw token/hash and invalidates every previous link.
6. Acceptance is single-use. Invitation row-version concurrency converts simultaneous attempts into one success and one deterministic conflict.
7. Public errors do not echo the token and use stable codes: `INVITATION_INVALID`, `INVITATION_EXPIRED`, `INVITATION_USED`, `INVITATION_REVOKED`.

### 5.4 Existing-user tenant context

`UserTenant` already permits one global identity to join multiple tenants, but current access/refresh tokens are derived from `User.TenantId` and `User.RoleId`. The following is required; otherwise existing-user acceptance is functionally incomplete:

1. Add an authenticated tenant-membership list query.
2. Add a tenant-context switch command that verifies an active user, active membership and active tenant, then issues access/refresh tokens for that membership's `TenantId` and `RoleId`.
3. Refresh tokens retain the selected tenant context instead of reverting to the user's primary tenant.
4. The existing invitation accept endpoint verifies the authenticated account's normalized email exactly matches the invitation email.
5. After acceptance, FE switches to the new tenant context and refetches `/auth/me`, permissions, notification count and warehouse-scoped caches.
6. A compact tenant switcher is added to the existing account menu only when more than one active membership exists.

### 5.5 Bulk-import semantics

1. Supported files: `.csv` and `.xlsx`, maximum 5 MiB and maximum 500 data rows.
2. Required columns are `FullName`, `Email`, `RoleCode`, `WarehouseCodes`.
3. `WarehouseCodes` contains one or more codes separated by semicolons, for example `FPT-01;FPT-02`.
4. Password is forbidden. A column named `Password`, `TemporaryPassword` or equivalent rejects the file.
5. Upload never commits data immediately. The mandatory flow is template -> upload -> validate/preview -> select valid rows -> confirm -> commit.
6. Duplicate normalized emails inside one file make every duplicate occurrence invalid, avoiding arbitrary first-row selection.
7. Multiple Manager rows claiming the same warehouse make all conflicting rows invalid.
8. At commit time the server revalidates memberships, pending invitations, roles, warehouse activity and Manager occupancy.
9. If any selected row became invalid after preview, commit creates nothing and returns `409 IMPORT_PREVIEW_STALE` with refreshed row errors.
10. A completed `ImportJob` is idempotent. Repeating the same commit returns the stored result and creates no duplicate invitations.
11. Email dispatch occurs after the database transaction. Per-row delivery state may be `Queued`, `Sent` or `Failed`; a delivery failure does not roll back a valid invitation.
12. Original upload files are private and retained for at most 24 hours. They are removed after successful commit/cancel and by a cleanup job after expiry.

## 6. Domain and Persistence Design

### 6.1 `Invitation` changes

| Field              | Type               | Rule                                                       |
| ------------------ | ------------------ | ---------------------------------------------------------- |
| `FullName`         | `string`           | Required, trimmed, max 300                                 |
| `Email`            | `string`           | Original display email, required, max 320                  |
| `NormalizedEmail`  | `string`           | Trimmed lowercase invariant, required, max 320             |
| `RoleId`           | `Guid`             | Required, allowed role checked in handler                  |
| `TokenHash`        | `string`           | SHA-256 uppercase hex, 64 characters, unique when non-null |
| `ExpiresAt`        | `DateTimeOffset`   | Required and UTC-based                                     |
| `AcceptedAt`       | `DateTimeOffset?`  | Set only on successful acceptance                          |
| `AcceptedByUserId` | `Guid?`            | Actual accepted global user identity                       |
| `InvitedBy`        | `Guid`             | Tenant Owner actor                                         |
| `Status`           | `InvitationStatus` | Pending/Accepted/Expired/Revoked                           |
| `RowVersion`       | `byte[]?`          | SQL row version for accept/resend/revoke races             |
| `WarehouseId`      | `Guid?`            | Legacy transition field only; no new writes                |
| `Token`            | `string?`          | Legacy transition field only; cleared after hash backfill  |

Indexes:

- Unique filtered index on `TokenHash` where non-null.
- Index on `(TenantId, NormalizedEmail, Status)` for duplicate checks/listing.
- Index on `(TenantId, Status, ExpiresAt)` for expiration processing.

### 6.2 `InvitationWarehouse`

Create a tenant-owned join entity:

```text
Id, TenantId, InvitationId, WarehouseId, CreatedAt
```

- Unique `(InvitationId, WarehouseId)`.
- Index `(TenantId, WarehouseId)`.
- Cascade delete from Invitation; restrict delete from Warehouse.
- Every query and mutation validates that join row tenant, invitation tenant and warehouse tenant agree.

### 6.3 Email outbox

Add a narrow `InvitationEmailOutbox` entity rather than using fire-and-forget `Task.Run` for bulk delivery:

```text
Id, TenantId, InvitationId, RecipientEmail, EncryptedToken,
TemplateVersion, Status, AttemptCount, NextAttemptAt,
LastErrorCode, SentAt, ExpiresAt, RowVersion, CreatedAt
```

- `EncryptedToken` is never projected by an API and is cleared after terminal processing.
- Quartz processes bounded batches, uses exponential backoff and stops after five attempts or invitation expiry.
- Only one active outbox record per invitation token version.
- Resend supersedes any older queued record before creating the next record.
- Delivery failure is operationally logged; it does not place SMTP details in Audit Log.

### 6.4 Reusing `ImportJob`

- `ImportType = "PersonnelInvitation"`.
- `Status` uses existing values: `Processing`, `NeedsReview`, `Completed`, `Failed`, `Cancelled`.
- `ExtractionJson` stores normalized parsed rows; `ReviewJson` stores validation/result data and selected row numbers. Neither stores a password or token.
- Existing `ImportError` stores sanitized row errors.
- Existing `RowVersion` is the optimistic-concurrency/version value used by commit.
- Inbound-specific nullable fields stay null. Do not add a second import-job table.

### 6.5 Migration workflow

All model changes must be made in Domain/configuration first, then generated with EF CLI:

```powershell
dotnet ef migrations add SecureStaffInvitationsAndPersonnelImport --project Infrastructure --startup-project API
dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API
```

Do not hand-create a migration, designer or model snapshot.

Compatibility rollout:

1. Keep legacy `Token` and `WarehouseId` nullable for this release.
2. After the generated schema migration, an idempotent startup initializer hashes every legacy raw token into `TokenHash`, clears raw token data and backfills `InvitationWarehouse` from `WarehouseId`.
3. During a rolling deployment, acceptance may compare a legacy raw token only when `TokenHash` is null, then immediately hash/clear it in the same transaction.
4. A later cleanup task may remove the two legacy columns after production verification; it is not part of WMS-269/270.

## 7. Backend API Contract

All endpoints keep the existing `ApiResponse<T>` envelope, camelCase JSON and string enum convention. Controllers inject only `ISender`; commands/queries and validators live in Application; response DTOs live in Contract.

### 7.1 Create one invitation

```http
POST /api/invitations
Authorization: Bearer <tenant-owner-token>
Permission: staff:invite
Content-Type: application/json
```

Request:

```json
{
  "fullName": "Nguyen Van A",
  "email": "a@example.com",
  "role": "WarehouseStaff",
  "warehouseIds": ["warehouse-guid-1", "warehouse-guid-2"]
}
```

Response `data` is the created invitation `Guid`, following the repository command contract. The owner-facing list is refreshed through `GET /api/invitations`, which returns:

```text
id, fullName, email, role,
warehouses[] { id, warehouseCode, warehouseName },
status, effectiveStatus, expiresAt, createdAt,
deliveryStatus, lastSentAt, canResend, canRevoke
```

Validation:

- Full name required, max 300.
- Email required, valid, max 320 and normalized once.
- 1-100 unique warehouse IDs.
- Existing active/inactive same-tenant membership, duplicate pending invitation, invalid role, inactive/cross-tenant warehouse and occupied Manager warehouse return a stable 4xx response.

### 7.2 Public preview

```http
GET /api/invitations/{token}/preview
AllowAnonymous
```

Response:

```text
fullName, email, tenantName, role,
warehouses[] { warehouseCode, warehouseName },
expiresAt, effectiveStatus,
accountMode: NewAccount | ExistingAccount
```

The token is a bearer secret. The response contains only data already represented by that invitation and never exposes tenant IDs, role IDs, user IDs or other tenant members.

### 7.3 Accept as a new user

```http
POST /api/invitations/{token}/accept-new
AllowAnonymous
```

```json
{
  "password": "P@ssw0rd123",
  "confirmPassword": "P@ssw0rd123"
}
```

- Allowed only when preview mode is `NewAccount`.
- Password validator mirrors tenant registration strength rules.
- Full name/email/role/warehouses come exclusively from the persisted invitation.
- Creates `User`, `UserTenant` and all `WarehouseUser` rows in one save.

### 7.4 Accept as an existing user

```http
POST /api/invitations/{token}/accept-existing
Authorization: Bearer <existing-user-token>
```

- No password or profile fields are accepted.
- Authenticated normalized email must equal invitation normalized email.
- Creates only the new membership and warehouse assignments.
- Returns the accepted tenant ID so FE can request a tenant-context switch.

### 7.5 Invitation management

Existing routes remain:

```http
GET    /api/invitations
POST   /api/invitations/{invitationId}/resend
DELETE /api/invitations/{invitationId}
```

Enhancements:

- List filters: `searchText`, `status`, `deliveryStatus`, `top`, `skip`, `needTotalCount`.
- Effective expiry is computed even before the expiration worker persists `Expired`.
- Resend rotates the token, resets expiry and creates a new outbox item; the command returns `Unit` and FE invalidates the invitation list.
- Revoke clears/supersedes pending delivery; the command returns `Unit` and FE invalidates the invitation list.

### 7.6 Tenant contexts

```http
GET  /api/auth/tenant-memberships
POST /api/auth/switch-tenant

{ "tenantId": "tenant-guid" }
```

Membership item:

```text
tenantId, tenantName, role, status, isCurrent
```

Switch response reuses `SignInResponse`. Token claims and refresh state must carry the selected membership role and tenant session version. Switching cannot mutate `User.TenantId` or `User.RoleId`.

### 7.7 Personnel template

```http
GET /api/staff/import-template?format=xlsx
Permission: staff:invite
```

- `format` is `csv` or `xlsx`; default `xlsx`.
- Workbook includes a `Personnel` sheet, a `README` sheet and sample rows.
- Role and warehouse instructions are deterministic; no secrets or tenant personnel are embedded.
- CSV uses UTF-8 with BOM so Vietnamese names open correctly in Excel.

### 7.8 Preview import

```http
POST /api/staff/imports/preview
Permission: staff:invite
Content-Type: multipart/form-data
```

Multipart fields: `file` and optional `schemaVersion`.

The preview command returns `data: importId` (`Guid`). FE then reads the tenant/creator-scoped preview with `GET /api/staff/imports/{importId}`. Its `preview` payload is:

```text
importId, rowVersion, fileName, expiresAt,
summary { total, valid, invalid, warning },
rows[] {
  rowNumber, fullName, email, roleCode, warehouseCodes[],
  resolvedWarehouses[], accountMode, status,
  errors[] { code, field, message }, warnings[]
}
```

### 7.9 Read/cancel import

```http
GET    /api/staff/imports/{importId}
DELETE /api/staff/imports/{importId}
Permission: staff:invite
```

- Both are tenant- and creator-scoped for Tenant Owner accounts.
- GET enables reload/resume during the 24-hour retention window.
- DELETE is allowed only before completion and removes the private source file.

### 7.10 Commit selected rows

```http
POST /api/staff/imports/{importId}/commit
Permission: staff:invite
```

```json
{
  "selectedRowNumbers": [2, 3, 7],
  "rowVersion": "base64-row-version"
}
```

The command returns `Unit`. FE invalidates and reads `GET /api/staff/imports/{importId}`; the resulting `commit` payload is:

```text
importId, status, createdCount, skippedCount,
results[] { rowNumber, invitationId, email, status, deliveryStatus, message }
```

Commit is database-atomic for all selected invitations, audits and outbox records. Realtime publication and email delivery run only after persistence succeeds.

## 8. Backend Implementation Plan

### Phase BE-0 - Baseline and contract freeze

- [x] Capture current build/test baseline and remote base hashes.
- [x] Add API contract DTOs in `Contract/Models/Organization/`.
- [x] Define stable validation/error codes used by FE.
- [x] Freeze endpoint names and JSON fields before FE schemas/services are written.

### Phase BE-1 - Domain, security and migration

- [x] Extend `Invitation` and configuration.
- [x] Add `InvitationWarehouse` and `InvitationEmailOutbox` entities/configurations.
- [x] Add `InvitationOptions` and environment-safe configuration binding.
- [x] Add `IInvitationTokenService` in Application and cryptographic implementation in Infrastructure.
- [x] Add bounded Quartz email-outbox and expiration jobs.
- [x] Generate the EF migration with CLI; review generated migration/designer/snapshot.
- [x] Add idempotent legacy token and warehouse backfill initializer.
- [x] Verify no pending model changes.

### Phase BE-2 - Secure single-invitation workflow

- [x] Update create command/validator/handler for full name and warehouse IDs.
- [x] Add public preview query with effective status.
- [x] Split new-account and existing-account acceptance commands.
- [x] Revalidate tenant, role, membership, warehouses and Manager vacancies on acceptance.
- [x] Add invitation row-version concurrency and idempotency tests.
- [x] Update list, resend and revoke responses and state guards.

### Phase BE-3 - Tenant-context authentication

- [x] Add active membership query and switch command.
- [x] Issue access tokens from selected `UserTenant` role/tenant.
- [x] Preserve selected context through refresh and 2FA completion.
- [x] Reject inactive user, membership or tenant on switch/refresh.
- [x] Invalidate permission and session caches correctly after acceptance/switch.

### Phase BE-4 - Personnel import

- [x] Add `IPersonnelImportParser` contract and CSV/XLSX Infrastructure implementations.
- [x] Add file signature, size, row, cell, ZIP expansion and formula-safety guards.
- [x] Add template download query.
- [x] Add preview, read, cancel and commit handlers/validators.
- [x] Reuse `ImportJob`, `ImportError`, private document storage and row-version concurrency.
- [x] Revalidate selected rows immediately before atomic commit.
- [x] Make completed commit replay idempotent.

### Phase BE-5 - Platform Services integration

- [x] Add `StaffInvitationUpdate` to `NotificationType` and FE-compatible string mapping.
- [x] Audit create, resend, revoke, accept, expire, import preview/cancel/commit.
- [x] Persist one acceptance notification for the inviter/Owner.
- [x] Persist one bulk-completion summary notification for the initiating Owner.
- [x] Publish SignalR only after save; realtime failure must not roll back data.
- [x] Use safe reference types `Invitation`, `Staff` and `PersonnelImport`.

### Phase BE-6 - Backend verification

- [~] Every new validator is covered; core state transitions are covered, while simultaneous handler-level acceptance/resend/revoke still needs live SQL Server verification.
- [~] Handler tests cover new/existing users, invitation replay, multiple warehouses and core Manager conflicts; relational concurrency coverage remains pending.
- [~] Controller authorization/permission contracts and import tenant/creator isolation are covered; live endpoint matrix remains pending.
- [~] Token hashing, expiry and replay paths are covered; simultaneous relational acceptance remains pending.
- [x] CSV/XLSX parser, template round-trip, forbidden password/formula, duplicate header, sparse column, shared-string and archive-boundary tests.
- [~] Duplicate commit idempotency and atomic stale lifecycle rollback are covered; preview-stale bulk commit on SQL Server remains pending.
- [x] Invitation/import audit persistence, recipient routing and publish-after-save are covered; generic publisher-failure persistence is covered by Platform Services tests.
- [x] Outbox send-once, retry, terminal failure cleanup and expired-delivery supersession tests.
- [x] Full solution build/tests, changed-file format, migration script review and `git diff --check`.

## 9. Frontend Information Architecture

### 9.1 Routes

```text
/staff                         existing directory and invitation management
/staff/import                  new protected personnel import workspace
/invitations/accept?token=... existing public route, redesigned around preview
```

`/staff/import` requires `staff:invite`. Route guards and sidebar visibility continue to use effective permissions from `/api/auth/me`.

### 9.2 Feature structure

```text
src/features/staff/
  components/
    StaffDirectoryPage/
      InviteStaffDialog.tsx
      InvitationManagementPanel.tsx
      ...existing components
    PersonnelImportPage/
      ImportStepHeader.tsx
      PersonnelFileUpload.tsx
      ImportSummary.tsx
      ImportPreviewToolbar.tsx
      ImportPreviewTable.tsx
      ImportCommitDialog.tsx
      ImportResult.tsx
      index.ts
    AcceptInvitationPage/
      InvitationSummary.tsx
      AcceptNewAccountForm.tsx
      AcceptExistingAccount.tsx
      index.ts
  hooks/
    use-invitations.ts
    use-personnel-import.ts
    use-tenant-memberships.ts
  pages/
    StaffDirectoryPage.tsx
    PersonnelImportPage.tsx
    AcceptInvitationPage.tsx
  schemas/
    send-invitation.schema.ts
    accept-new-invitation.schema.ts
    personnel-import.schema.ts
  services/
    invitation.service.ts
    personnel-import.service.ts
    tenant-membership.service.ts
  types/
    invitation.types.ts
    personnel-import.types.ts
    tenant-membership.types.ts
  utils/
    invitation-status.ts
    personnel-import.ts
```

Rules:

- Page owns all query/mutation hooks and server state.
- Dialog/table/form components receive data, form objects and callbacks through typed props.
- Zod mirrors the final BE validators exactly; update order is schema -> types -> service -> hook -> component.
- React Query stores server data. Zustand only stores authenticated client/session state.
- Reuse shadcn `Button`, `Dialog`, `Sheet`, `Table`, `Tabs`, `Progress`, `Alert`, `Badge`, `Checkbox`, `Combobox`, `ScrollArea`, `Field` and `Input` before adding primitives.

## 10. Design Direction and Layout

Design read: a high-confidence, task-first personnel administration flow for a B2B warehouse product. It must feel compact, calm and operational rather than promotional.

| Design dial      | Value | Reason                                                                   |
| ---------------- | ----- | ------------------------------------------------------------------------ |
| Design variance  | 3/10  | Preserve familiar staff-management patterns and the current KOVIA system |
| Motion intensity | 2/10  | Only existing dialog/dropdown/step transitions; respect reduced motion   |
| Visual density   | 7/10  | Previewing hundreds of personnel rows requires compact scanning          |

Global visual rules:

- Keep Inter, Lucide and the existing Fresh Logistics tokens from `src/app/index.css`.
- Use `bg-background`, `bg-card`, `bg-muted`, `border-border`, `text-foreground`, `text-muted-foreground`, `text-primary` and `text-destructive`; no hard-coded palette values.
- Prefer borders and tonal surfaces over heavy shadows.
- Keep the current utilitarian radius scale; do not turn each section into a floating card.
- Never use color as the only status signal. Every badge includes a readable label.
- All dialogs/dropdowns/sheets use the animation durations and Radix state selectors defined in `.rules`.

### 10.1 Staff directory layout

```text
+-----------------------------------------------------------------------+
| Tổ chức và nhân sự                         [Nhập danh sách] [Thêm nhân sự] |
| Quản lý tài khoản, lời mời và phạm vi kho                             |
+-----------------------------------------------------------------------+
| [Nhân sự] [Lời mời]                                                   |
+-----------------------------------------------------------------------+
| Search / role filter / warehouse filter / status                       |
+-----------------------------------------------------------------------+
| Name | Email | Role | Status | Warehouse scope | Last login | Actions |
| ...                                                                   |
+-----------------------------------------------------------------------+
| Pagination                                                            |
+-----------------------------------------------------------------------+
```

- Rename the primary action from `Mời nhân sự` to `Thêm nhân sự`; its confirmation action is `Tạo và gửi lời mời`.
- Add the outline secondary action `Nhập danh sách` immediately before the primary action.
- Preserve the existing `Nhân sự` and `Lời mời` tabs.
- The directory/table follows the fixed-viewport pattern: page root `h-full flex flex-col`, content `flex-1 min-h-0`, and table-only internal scrolling.
- Desktop table remains compact. Below `xl`, use the existing responsive list pattern rather than horizontal page scrolling.

### 10.2 Single invitation dialog

Order fields by decision flow:

1. `Họ và tên`.
2. `Email`.
3. `Vai trò` radio group.
4. `Kho làm việc ban đầu` multi-select.
5. Small summary line: role, warehouse count and expiration duration.

Behavior:

- Dialog max width is approximately 560 px and bounded to `90dvh` with internal vertical scroll.
- Warehouse combobox supports search, paged loading and selected chips without losing selections between pages.
- For Manager role, occupied warehouses are disabled and display `Đã có quản lý: <name>` when the current API permits that information.
- Changing Manager/Staff role preserves only selections that remain valid and asks for explicit confirmation before discarding invalid selections.
- Submit stays disabled while warehouse options are unavailable, validation fails or mutation is pending.
- Success closes the dialog, invalidates invitation queries and switches to the `Lời mời` tab with a success toast.

### 10.3 Personnel import workspace

Use a dedicated page, not a narrow dialog, because preview and row remediation require a wide data region.

```text
+-----------------------------------------------------------------------+
| <- Nhân sự     Nhập danh sách nhân sự                                 |
| [1 Tải tệp] ---- [2 Kiểm tra] ---- [3 Xác nhận] ---- [4 Kết quả]      |
+-----------------------------------------------------------------------+
| Step-specific instructions / summary                                  |
+-----------------------------------------------------------------------+
| Bounded work area; preview table scrolls internally                    |
+-----------------------------------------------------------------------+
| [Hủy]                                      [Back] [Primary next action] |
+-----------------------------------------------------------------------+
```

Step 1 - `Tải tệp`:

- Provide `Tải file mẫu Excel` and `Tải file mẫu CSV` links.
- Use an accessible file input with browse action and optional drag/drop enhancement.
- Show accepted formats, 5 MiB and 500-row limits before upload.
- Do not upload automatically after selection; show file name/size and an explicit `Kiểm tra dữ liệu` action.

Step 2 - `Kiểm tra`:

- Show summary counts: total, valid, invalid and warnings.
- Filters: `Tất cả`, `Hợp lệ`, `Có lỗi`, plus search by name/email.
- Table columns: select, row, full name, email, role, warehouse codes, account mode, result.
- Invalid rows are not selectable. Selecting all affects visible valid rows only and announces the count.
- Row errors appear in an expandable detail or accessible popover, not in a tooltip-only interaction.
- Primary action label is `Nhập {n} dòng hợp lệ`.

Step 3 - `Xác nhận`:

- Use a confirmation dialog summarizing invitation count by role and warehouse.
- Explicit copy: accounts are not active yet and no passwords will be generated.
- Prevent duplicate submission while commit is pending.

Step 4 - `Kết quả`:

- Show created, queued/sent, failed-delivery and skipped counts.
- Show row-level results and actions `Xem lời mời`, `Tải kết quả CSV` and `Về danh sách nhân sự`.
- CSV export escapes formula-leading values (`=`, `+`, `-`, `@`).

### 10.4 Invitation acceptance layout

Reuse the current public auth shell and `BenefitsPanel`; do not create a separate visual identity.

```text
+--------------------------------+--------------------------------------+
| Existing KOVIA benefits panel  | Lời mời tham gia KOVIA              |
| hidden below lg                | [Organization / role / warehouses]   |
|                                | Name  [read-only]                    |
|                                | Email [read-only]                    |
|                                | New: password + confirmation        |
|                                | OR Existing: sign in and accept      |
|                                | [Kích hoạt tài khoản / Chấp nhận]   |
+--------------------------------+--------------------------------------+
```

States:

- Preview loading: skeletons preserve form dimensions.
- Invalid/revoked/used/expired: dedicated Alert with one clear next action.
- New account: read-only name/email summary, password requirements and confirmation fields.
- Existing account, signed out: `Đăng nhập để chấp nhận`; preserve the exact return URL.
- Existing account, wrong email: show the invited email and `Đăng nhập bằng tài khoản khác`.
- Existing account, correct email: confirmation with tenant/role/warehouse scope, no password fields.
- Success: new user goes to login; existing user switches tenant context then goes to the role dashboard.

### 10.5 Invitation management layout

- Each row shows full name, email, localized role, warehouse summary, effective status, expiry and email delivery state.
- Pending action menu includes resend and revoke. Failed delivery makes `Gửi lại lời mời` visible without relying on an icon alone.
- Expired invitations can be resent; accepted/revoked invitations are read-only.
- Resend success updates the expiry immediately and invalidates the old link.
- Maintain internal scrolling for a long invitation list; pagination remains outside the scrolling table region.

### 10.6 Responsive and accessibility requirements

- At 1280 px and above, render full tables; 768-1279 px may hide lower-priority columns; below 768 px use stacked row summaries.
- No browser-level horizontal scroll at 390, 768, 1280 or 1440 px.
- On mobile, step actions use a sticky bottom action bar that does not cover content.
- Keyboard users can upload, select rows, inspect errors, change steps and confirm without pointer input.
- Dialog/Sheet focus is trapped and restored to the opening control.
- Form errors are field-associated; import summary changes use `aria-live="polite"`.
- Honor `prefers-reduced-motion` and preserve minimum 44 px touch targets on mobile.

## 11. Frontend Implementation Plan

### Phase FE-0 - Contract alignment

- [x] Read the finalized BE commands, validators and response DTOs.
- [x] Update invitation Zod schemas and infer form/request types from them.
- [x] Update API endpoint constants and query keys.
- [x] Update service functions before hooks/components.

### Phase FE-1 - Secure single invitation

- [x] Move server-state ownership to `StaffDirectoryPage` and keep dialog components presentational.
- [x] Add full-name and multi-warehouse fields.
- [x] Update invitation list/management states and actions.
- [x] Implement preview query and split new/existing acceptance UI.
- [x] Preserve invitation return URL through login.
- [x] Implement membership list/switch and refresh all tenant-scoped state after switching.

### Phase FE-2 - Personnel import

- [x] Add protected `/staff/import` route and directory entry action.
- [x] Build upload, preview, confirmation and result states.
- [x] Keep filters, selection and pagination in `PersonnelImportPage`.
- [x] Implement resume/cancel behavior from persisted import ID.
- [x] Add safe results CSV export.
- [x] Handle loading, empty, invalid-file, stale-preview, conflict, partial email-delivery and retry states.

### Phase FE-3 - Frontend verification

- [x] Zod schema tests mirror BE validation.
- [x] Service tests assert exact endpoints, multipart fields and payload names.
- [~] Hook tests assert personnel-import cache invalidation and one commit mutation; remaining invitation hook cases are pending.
- [~] Component/page tests cover single invite, action errors, wrong-account protection and core bulk states; migrated-runtime acceptance remains pending.
- [~] Accessibility tests cover labels, row selection and live summaries; full keyboard/focus pass remains pending.
- [x] Mock-backed Visual QA passed at 1440x1000, 768x1024 and 390x844 with no horizontal page overflow; import, invalid-link, new-account and existing-account states were inspected.
- [x] Run `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, Prettier check and `git diff --check`.

## 12. Validation Matrix

| Case                                      | Preview/create result    | Commit/accept result    | UI behavior                                       |
| ----------------------------------------- | ------------------------ | ----------------------- | ------------------------------------------------- |
| Invalid email/name/role                   | 400 row/field error      | Blocked                 | Inline field or row error                         |
| Password column present                   | Reject whole file        | N/A                     | Explain passwords are never imported              |
| Duplicate email in file                   | All duplicates invalid   | Not selectable          | Group duplicate row references                    |
| Active membership in tenant               | 409/invalid row          | Blocked                 | Link to existing personnel record when authorized |
| Inactive membership in tenant             | 409/invalid row          | Blocked                 | Tell Owner to reactivate existing account         |
| Existing user in another tenant           | Valid, `ExistingAccount` | Authenticated accept    | Sign in; never request new password               |
| Pending invitation in tenant              | 409/invalid row          | Blocked                 | Open invitation tab/resend existing invite        |
| Revoked/expired old invite                | New invitation allowed   | Old token blocked       | Resend or create fresh invite                     |
| Missing/inactive/cross-tenant warehouse   | 400/404/invalid row      | Revalidated and blocked | Identify warehouse code/row safely                |
| Occupied Manager warehouse                | 409/invalid row          | Revalidated and blocked | No implicit replacement                           |
| Two imported Managers claim one warehouse | Both rows invalid        | Not selectable          | Show conflicting row numbers                      |
| Token expired/revoked/used                | Preview stable error     | Blocked                 | One actionable error state                        |
| Simultaneous token acceptance             | One may succeed          | One 409                 | Success is idempotent; no duplicates              |
| File changed after preview                | N/A                      | 409 stale preview       | Keep selection, reload validation                 |
| Duplicate commit                          | N/A                      | Return stored result    | No duplicate invitations/emails                   |
| SMTP/realtime unavailable                 | Invitation remains valid | Data stays committed    | Show queued/failed delivery; allow resend         |

## 13. Audit and Notification Matrix

| Event               | Audit                        | Persisted notification   | Realtime   | Reference         |
| ------------------- | ---------------------------- | ------------------------ | ---------- | ----------------- |
| Invitation created  | Yes, Owner actor             | No recipient account yet | No         | `Invitation`      |
| Invitation resent   | Yes, no raw token            | No                       | No         | `Invitation`      |
| Invitation revoked  | Yes                          | No                       | No         | `Invitation`      |
| Invitation expired  | Yes, system actor convention | No                       | No         | `Invitation`      |
| Invitation accepted | Yes, accepting user          | Inviter/Owner            | After save | `Staff`           |
| Import previewed    | Summary audit only           | No                       | No         | `PersonnelImport` |
| Import cancelled    | Yes                          | No                       | No         | `PersonnelImport` |
| Import committed    | Created/invalid counts only  | Initiating Owner summary | After save | `PersonnelImport` |

Audit values may contain role/status/counts and warehouse IDs/codes needed for traceability, but not passwords, tokens, uploaded row payloads or SMTP errors.

## 14. Testing and QA Plan

### 14.1 Backend automated coverage

- Validator parity for all commands.
- New user acceptance creates exactly one user, one membership and N assignments.
- Existing user acceptance preserves global profile/password and creates only membership/assignments.
- Existing inactive membership is routed to reactivation, not silently reactivated.
- Tenant switch/refresh uses the selected membership role and rejects stale/inactive context.
- Token hash is stored, raw token absent from Invitation, resend invalidates the old token and replay is blocked.
- SQL Server or relational-provider concurrency for simultaneous accept/resend/revoke.
- Manager uniqueness across current DB and selected file rows.
- Cross-tenant warehouse, invitation, import and membership isolation.
- CSV UTF-8/Vietnamese, quoted fields, semicolon warehouses and malformed rows.
- XLSX missing sheet/header, hidden/oversized rows, ZIP expansion and invalid signature.
- Import preview/commit atomicity, stale row version and completed-job replay.
- Outbox send/retry/expiry and token-payload clearing.
- Audit/notification stored before realtime and publisher failure isolation.

### 14.2 Frontend automated coverage

- Exact BE payload/response types and endpoint routes.
- Single-invite form full name, role and multi-warehouse validation.
- Selected warehouses survive server pagination/search refetch.
- Accept page preview loading, invalid, expired, new and existing modes.
- Login return URL and wrong-account protection.
- Tenant switch clears/refetches tenant-scoped state.
- Import file selection does not submit automatically.
- Invalid rows cannot be selected; select-all affects valid visible rows only.
- Stale preview preserves user context and offers revalidation.
- Double-click/Enter cannot issue duplicate create/commit requests.
- Result export sanitizes spreadsheet formulas.

### 14.3 Visual QA

Use isolated QA data and the provided accounts where appropriate:

```text
tenant.owner@sswms.local       Tenant Owner
system.admin@sswms.local       System Admin
warehouse.manager@sswms.local Warehouse Manager
warehouse.staff@sswms.local   Warehouse Staff
```

Scenarios:

1. Owner creates Staff invitation with two warehouses.
2. Owner creates Manager invitation and sees occupied warehouses blocked.
3. New account previews read-only identity, sets password and activates.
4. Existing account signs in, accepts, switches tenant and sees correct permissions.
5. CSV and XLSX each preview mixed valid/invalid records.
6. Owner imports selected valid rows only and sees delivery results.
7. Resend invalidates the first link; revoke/expired/accepted screens are correct.
8. Invitation accepted notification appears persisted and realtime for Owner.
9. Desktop/mobile layouts have no page-level horizontal or unnecessary vertical overflow.

If test seed data is added, place it under BE `Infrastructure/Data/SeedData`, make it explicitly QA-only, and remove both the seed code and created QA records after verification.

## 15. Error Mapping

| HTTP    | Stable code                                                                                                             | FE action                                                                         |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 400     | `INVITATION_INVALID`, `IMPORT_FILE_INVALID`, `IMPORT_ROW_INVALID`                                                       | Show field/row error; retain form/import state                                    |
| 401     | `INVITATION_AUTH_REQUIRED`                                                                                              | Redirect to login with return URL                                                 |
| 403     | `INVITATION_ACCOUNT_MISMATCH`, `FORBIDDEN`                                                                              | Explain wrong account or unavailable permission                                   |
| 404     | `INVITATION_NOT_FOUND`, `IMPORT_NOT_FOUND`                                                                              | Show terminal/expired workspace state without leaking tenant data                 |
| 409     | `INVITATION_ALREADY_MEMBER`, `INVITATION_USED`, `INVITATION_STATE_CONFLICT`, `MANAGER_CONFLICT`, `IMPORT_PREVIEW_STALE` | Refetch relevant data and require explicit retry                                  |
| 413     | `IMPORT_FILE_TOO_LARGE`                                                                                                 | Show 5 MiB limit before reselecting                                               |
| 415     | `IMPORT_FILE_TYPE_UNSUPPORTED`                                                                                          | Accept CSV/XLSX only                                                              |
| 422     | `IMPORT_NO_VALID_ROWS`                                                                                                  | Keep preview and row errors visible                                               |
| 429     | `RATE_LIMITED`                                                                                                          | Disable immediate retry and show retry guidance                                   |
| 500/503 | infrastructure failure                                                                                                  | Log through `logger`, toast actionable generic message, preserve safe draft state |

## 16. Deployment and Rollback

Deployment order:

1. Deploy BE migration/backfill and API first.
2. Confirm legacy token hashes and invitation-warehouse rows are backfilled; no raw token remains after initializer completion.
3. Confirm email-outbox worker and expiration job health.
4. Deploy FE after API contract is frozen and available.
5. Run one new-account and one existing-account smoke test before enabling bulk import for all Owners.

Rollback:

- FE can roll back independently while BE keeps old routes compatible during this release.
- Do not roll back the database migration after new invitation warehouse/outbox data exists. Roll back application behavior forward with a corrective deployment.
- If email delivery is degraded, keep invitations persisted and pause the outbox worker; do not delete or regenerate all invitations.
- If bulk import must be disabled, gate only the import endpoints/action while preserving individual invitations and acceptance.

## 17. Definition of Done

The module is complete only when all conditions below are met:

- [x] Tenant Owner can create a named invitation with one or more warehouses.
- [x] New user activation never exposes a password to the Owner.
- [x] Existing user acceptance works end-to-end with correct tenant context.
- [x] Raw invitation tokens are absent from Invitation storage/logs/audits.
- [x] Resend rotation, expiry, revoke and single-use behavior are concurrency-safe.
- [x] CSV/XLSX import supports preview, validation, selected atomic commit and idempotent replay.
- [x] Manager and warehouse business rules are enforced both at preview and commit/accept.
- [x] Email delivery is queued/retryable and visible without rolling back invitations.
- [x] Audit, persisted notification and SignalR ordering follow Platform Services conventions.
- [x] FE matches the finalized BE validators/contracts and follows page-owned server state.
- [x] Desktop/mobile visual QA and accessibility checks pass.
- [x] BE build/tests/migration checks and FE typecheck/lint/tests/build pass.
- [x] No QA seed, uploaded personnel file, raw token or temporary test account remains after testing.
- [ ] `docs/AI_REVIEW.md` receives implementation and independent review evidence before PR readiness.

## 18. Progress Tracker

| Phase                                | Owner    | Status      | Evidence                                                                                                                                                                   |
| ------------------------------------ | -------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Jira epics/tasks created             | Team     | Completed   | WMS-267, WMS-268, WMS-269, WMS-270                                                                                                                                         |
| Feature branches created             | Team     | Completed   | FE `feat/wms-269-staff-invitations-import`; BE `feat/wms-270-staff-invitations-import`                                                                                     |
| Rules and current code audited       | Codex    | Completed   | FE/BE `.rules`, `AGENTS.md`, referenced docs and current staff/auth/import/platform code reviewed                                                                          |
| Cross-repo spec and design layout    | Codex    | Completed   | This document                                                                                                                                                              |
| BE-0 Contract freeze                 | BE       | Completed   | Contracts frozen; stable invitation codes are returned in `errors.code`; command responses aligned with repository rules                                                   |
| BE-1 Domain/security/migration       | BE       | Completed   | Hashed tokens, multi-warehouse, encrypted outbox, expiry/backfill jobs and EF migration `20260908055721_AddSecureStaffInvitationsAndEmailOutbox`; no pending model changes |
| BE-2 Single invitation               | BE       | Completed   | Create/preview/new/existing/resend/revoke, revalidation, expiry and concurrency paths implemented and covered by invitation regression tests                               |
| BE-3 Tenant context                  | BE       | Completed   | Membership query, switch token issuance, selected-context refresh and permission-cache invalidation implemented                                                            |
| BE-4 Personnel import                | BE       | Completed   | CSV/XLSX template/parser, guards, preview/read/cancel/commit and 24-hour cleanup implemented; template round-trip tests added                                              |
| BE-5 Platform integration            | BE       | Completed   | Invitation/import audit, persisted notification and post-save realtime publication implemented                                                                             |
| BE-6 Backend verification            | BE/QA    | Completed   | Build clean; 267/267 tests; migration/model checks pass; live XLSX plus new/existing-account invitation E2E passed; QA residue is zero                                     |
| FE-0 Contract alignment              | FE       | Completed   | Types, Zod schemas, endpoints, query keys, services and hooks aligned to BE command/query contracts                                                                        |
| FE-1 Single invitation               | FE       | Completed   | Owner name, multi-warehouse invite, token preview, new/existing acceptance, return URL and tenant switcher implemented                                                     |
| FE-2 Personnel import                | FE       | Completed   | Template download, guarded upload, summary, row selection, confirmation, cancel and completion result UI implemented                                                       |
| FE-3 Frontend verification/Visual QA | FE/QA    | Completed   | Typecheck/lint/build and 469/469 tests passed; responsive live QA has no page overflow; invitation screen passes axe WCAG A/AA scan                                        |
| Independent code/business review     | Reviewer | In progress | Cross-layer self-review completed; independent reviewer evidence still pending in BE `docs/AI_REVIEW.md`                                                                   |
| PR readiness                         | Team     | In progress | Gates are green and both `origin/dev` refs match the feature baselines; commit, independent review evidence and post-commit mergeability check remain                      |

### Progress update rule

After every phase:

1. Change only that phase's checkboxes and tracker status.
2. Add exact commands, pass counts, migration name/hash and QA evidence under its Evidence cell or a dated appendix.
3. Do not mark a phase `Completed` when implementation exists but verification remains pending; use `In progress`.
4. Record deferred items explicitly; never hide them by marking the whole module complete.

### 2026-09-08 implementation checkpoint

- BE application and test projects compile successfully with the secure invitation changes.
- Migration generated with EF CLI: `20260908055721_AddSecureStaffInvitationsAndEmailOutbox` (plus designer and model snapshot). The generated migration was reviewed and augmented with deterministic legacy email/token/warehouse backfill; its down path restores unique non-null legacy tokens.
- `dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API` passed with no pending model changes.
- Targeted command: `dotnet test Application.Tests/Application.Tests.csproj --no-build --filter "FullyQualifiedName~Invitation|FullyQualifiedName~StaffWarehouseAssignment"`.
- Result: 29 total, 21 passed, 8 failed. Remaining failures are legacy tests/fixtures that still assume anonymous acceptance can attach an existing global user, omit active tenant defaults, or do not mock the new batch repositories. These must be corrected before BE-2/BE-6 can be completed.
- Deferred at this checkpoint: expiration worker, idempotent legacy backfill, tenant-context authentication, personnel import, FE implementation and Visual QA.

### 2026-09-09 verification checkpoint

- Fixed the existing-account retry gap: accepted invitations retain only the token hash and return the tenant id idempotently to the same active member, allowing a failed tenant switch to be retried without duplicate membership, audit or notification writes.
- FE now keeps invitation details and the retry action visible after acceptance/switch errors, blocks acceptance under a different signed-in email, and reports tenant-switch failures instead of producing an unhandled promise rejection.
- Personnel import additionally rejects inactive KOVIA accounts, supports legacy blank normalized invitation emails, validates optional schema versions, recognizes safe common CSV MIME aliases, rejects duplicate headers, and bounds malicious XLSX column/shared-string references.
- Backend verification: `dotnet build SSWMS-API.slnx --no-restore` succeeded with 0 warnings/errors; `dotnet test SSWMS-API.slnx --no-restore` passed 255/255; EF reported no pending model changes.
- Email-outbox verification now covers send-once semantics, transient retry with encrypted-token retention, terminal failure cleanup, and expired-delivery supersession without sending.
- Relational SQLite verification confirms a stale invitation transition rolls back its companion outbox insert. Accept/resend/revoke/expiry now translate optimistic-concurrency races to `409 INVITATION_STATE_CONFLICT` instead of leaking a 500.
- Personnel import now returns stable machine codes and semantic HTTP statuses for invalid, oversized, unsupported and empty files; commit/cancel concurrency returns `409 IMPORT_PREVIEW_STALE`. Commit idempotency, audit/notification routing, private-file cleanup fallback, and tenant/creator isolation are covered.
- Frontend verification: `pnpm typecheck`, `pnpm lint`, `pnpm test -- --run` (463/463) and `pnpm build` passed; `/staff/import` and `/invitations/accept` are present in the production route manifest.
- Mock-backed browser evidence covers 1440x1000, 768x1024 and 390x844. Import and invalid-link states fit their viewports; new-account mobile uses expected vertical document scrolling (`954 > 844`); all inspected states had `document.scrollWidth === window.innerWidth`.
- New-account password activation, existing-account wrong-user guidance and invalid-link recovery were visually inspected. This does not replace the pending migrated-database end-to-end acceptance test.
- No seed data, imported file, invitation, account or database migration was created during this QA pass. The temporary mock server, browser profile and QA script were removed afterward.
- Work resumed after the 5-hour quota reset. Final verification and live import QA continued; no commit or push was performed.

### 2026-09-09 live import checkpoint

- Created and visually verified `kovia-personnel-import-qa.xlsx` with two valid staff rows, one invalid email and one duplicated-email pair. The workbook contains the exact `FullName`, `Email`, `RoleCode` and `WarehouseCodes` contract and no password column.
- The first live upload exposed a BE contract defect: generated `WarehouseStaff`/`WarehouseManager` codes were compared directly with display names `Warehouse Staff`/`Warehouse Manager`. Import role-code mapping now keeps stable compact codes while resolving persisted role names, and the compact-code commit regression test passes.
- The first browser upload exposed a FE multipart defect: the Axios JSON default caused ASP.NET to receive no `file`. The preview service now removes the default content type so the browser supplies the multipart boundary; a service regression test covers this request configuration.
- Live E2E on the migrated development API passed: login, XLSX upload, preview of 2 valid and 3 invalid rows, selection of both valid rows, and cancel back to `/staff/import`. The page had no horizontal overflow at 1440x1000.
- Cancellation removed each uploaded XLSX from `API/App_Data/inbound-documents`. Cleanup then removed exactly 5 QA import records, 20 associated import errors and 10 associated audit records after validating their IDs, import type, filename and cancelled status. No personnel-import seed, invitation, email delivery, raw invitation token or temporary account remains.
- Final regression after the fixes: BE build succeeded with 0 warnings/errors and 255/255 tests passed; FE typecheck, lint, build and 463/463 tests passed.

### 2026-09-09 live invitation acceptance checkpoint

- Added one deterministic QA-only pending invitation through a temporary seed under BE `Infrastructure/Data/SeedData`, then removed the seed and startup hook immediately after the run. No real recipient email or SMTP transport was used.
- Live mobile E2E at 390x844 passed against the migrated development API: public token preview rendered the owner-provided read-only identity and FPT-01 assignment, the recipient set and confirmed their own password, and the UI displayed `Kích hoạt thành công` without horizontal overflow.
- Database verification confirmed the invitation transitioned to `Accepted`; the new user became `Active` and email-verified; one active `Warehouse Staff` membership and one active FPT-01 assignment were created; and exactly one invitation audit plus one owner notification were persisted.
- Cleanup deleted exactly one QA notification, audit, invitation warehouse, invitation, warehouse assignment, membership and user. No outbox item existed because the isolated seed intentionally bypassed email transport. Post-cleanup checks found zero QA invitation/account residue, and all temporary QA scripts/build folders were removed.
- Remaining live SMTP transport is a deployment smoke test. Its outbox behavior is automated-test covered but is not inferred from this new-account E2E.

### 2026-09-09 existing-account acceptance checkpoint

- Added one deterministic existing QA user without a tenant membership and one pending invitation through a temporary seed under BE `Infrastructure/Data/SeedData`. The seed intentionally omitted email delivery and was removed after the run.
- Live mobile E2E at 390x844 passed: the public preview selected `ExistingAccount`, preserved the invitation return URL through login, authenticated the matching email, accepted the invitation, issued the selected-tenant session and navigated to the Warehouse Staff dashboard. Logout completed afterward.
- Database verification confirmed one active `Warehouse Staff` membership, one active FPT-01 assignment, an `Accepted` invitation attributed to the existing user, exactly one audit and exactly one Owner notification.
- The invitation screen produced zero axe-core violations for WCAG 2 A/AA and WCAG 2.1 A/AA. Both invitation and loaded dashboard states had no page-level horizontal overflow.
- Cleanup deleted the exact QA notification, audit, invitation warehouse, invitation, warehouse assignment, membership and pre-existing QA user; the refresh-token key was removed through logout. Post-cleanup database and temporary-directory residue was zero.
- Actual SMTP transport remains a deployment smoke test because local QA deliberately uses reserved `.invalid` recipients. Email outbox send-once, encrypted-token retention, retry, terminal-failure and expiry behavior remains covered by backend tests.
- Final post-cleanup regression passed: BE build completed with 0 warnings/errors, all 255 tests passed, EF reported no pending model changes and changed-file formatting/diff checks passed. FE typecheck, lint, all 463 tests, production build, Prettier and diff checks passed.
- Full-solution `dotnet format --verify-no-changes` still reports unrelated baseline whitespace in files outside this feature diff; the complete changed/untracked C# file set passes the same formatter check.
- After fetching both remotes, neither FE nor BE `origin/dev` contains commits newer than the feature baseline. Configuration review found only invitation batch/expiry and rate-limit rule paths changed; no new secret-bearing configuration path was introduced.

### 2026-09-10 review-fix checkpoint

- Tenant staff lifecycle now treats `UserTenant.Status` as the tenant-local access state and
  reserves `User.Status` for global account security. Inactive memberships remain visible in list
  and details so an Owner can reactivate them; global inactive/locked identities expose no tenant
  reactivation action.
- Legacy invitations with a blank persisted name remain usable through an optional acceptance
  fallback. Current invitations still render the persisted identity as read-only and never let the
  recipient overwrite it.
- Resend revalidates current tenant, role, warehouse, account, membership, and manager occupancy
  before token rotation. Single invitation creation now shares the tenant concurrency boundary
  used by bulk import and warehouse assignment.
- Invitation warehouse selection uses debounced server search, 100-row incremental pages, and
  persistent selected chips. FE and BE now enforce the same explicit password-special-character
  set.
- Final regression: BE build passed with 0 warnings/errors and 267/267 tests; FE typecheck, lint,
  469/469 tests and production build passed. This fix round changed no entity or database schema,
  so no migration was required.
