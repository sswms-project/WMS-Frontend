# Subscription PayOS x Platform Services Integration Audit

## 1. Document Control

| Field               | Value                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Date                | 2026-09-03                                                                                                            |
| Scope               | Subscription billing, PayOS payment lifecycle, persisted notifications, SignalR realtime and Audit Log                |
| Backend baseline    | `feat/wms-154-platform-administration` at `65db46f`, including the latest `origin/dev` PayOS changes                  |
| Frontend baseline   | `feat/wms-184-platform-administration` at `e7ecdf4`, including the latest `origin/dev` changes                        |
| Platform dependency | WMS-151/183 Platform Services                                                                                         |
| Purpose             | Record every confirmed gap and define the work required to integrate PayOS with Notification/Platform Services safely |
| Status              | Implementation in progress; core BE/FE integration completed and regression-tested                                    |

## 2. Executive Summary

The existing Platform Services implementation is reusable and already provides persisted notifications, per-user SignalR routing, realtime cache refresh, generic popup handling and workflow audit storage. Subscription checkout can create a PayOS payment link, receive a verified success webhook, register the webhook URL at application startup and poll PayOS by `orderCode` from the payment-result page.

The two modules are not integrated yet. PayOS handlers update `Payment` and `TenantSubscription` directly without creating an audit record or persisted notification and without publishing a realtime event. The webhook and polling paths duplicate the same state transition, have no sufficient concurrency protection and can later create duplicate side effects if notification logic is added independently to both handlers.

The integration is not production-ready until the P0 items in this document are resolved and covered by automated tests.

## 3. Verified Current Flow

```text
Tenant Owner selects plan
  -> POST /api/subscriptions/payment-link
  -> Payment(Pending) is saved
  -> Browser redirects to PayOS
  -> PayOS returns browser to /payment-result
  -> FE calls authenticated POST /api/subscriptions/payments/{orderCode}/sync
  -> BE queries PayOS payment status by the same orderCode

In parallel:
API startup -> PayOS ConfirmAsync(WebhookUrl)
PayOS -> POST /api/subscriptions/payos-webhook

Webhook or polling
  -> shared idempotent settlement service owns the terminal transition
  -> Payment becomes Completed/Failed and stores provider status
  -> TenantSubscription is updated or scheduled
  -> AuditLog + persisted Notification are committed
  -> SignalR is published after commit
```

### 3.1 Components that are already reusable

- BE `Notification` entity and query APIs.
- BE `IAuditLog`/`WorkflowAuditLogger`.
- BE `INotificationRealtimePublisher` and `SignalRNotificationRealtimePublisher`.
- SignalR user routing by composite `tenantId:userId` identity.
- Failure isolation: realtime publishing logs delivery failure without undoing already persisted data.
- FE `NotificationRealtimeProvider` in the private layout.
- FE notification header queries, notification directory, filter schema and reference routing.
- FE payment-result polling and subscription/payment query invalidation.

### 3.2 PayOS contract to preserve during Notification/Audit integration

The following integration points were added or confirmed in the latest `origin/dev` baseline. They
are owned by the PayOS billing flow and must not be removed, renamed or reimplemented by the
Notification/Platform Services work:

- `Payment.PayOSOrderCode` is the unique correlation key for payment-status synchronization. The
  PayOS adapter now calls the provider's status API with this `orderCode`; `PayOSPaymentLinkId`
  remains stored as provider metadata but is not the polling correlation key.
- `POST /api/subscriptions/payos-webhook` remains the anonymous provider callback and must retain
  cryptographic payload verification before settlement is attempted.
- At startup, `ConfirmPayOSWebhookAsync` registers the configured `PayOSSettings.WebhookUrl` with
  PayOS. A registration failure is intentionally logged as non-fatal so an external PayOS outage
  does not prevent the API from starting.
- Status synchronization is now `POST /api/subscriptions/payments/{orderCode}/sync`, requires
  `subscriptions:view`, verifies tenant ownership and preserves the `orderCode` correlation contract.

The Notification/Audit implementation may refactor only the business settlement boundary after a
provider status has been verified. It must leave checkout-link creation, PayOS SDK calls, webhook
configuration, callback URLs and the `orderCode` provider contract owned by the PayOS flow.

## 4. Confirmed Findings

### P0 - Must fix before integration is considered complete

#### PAY-NOTIF-01: Pending payment creation has no audit record

`CreateSubscriptionPaymentCommandHandler` creates and saves a `Payment` with `Pending` status but does not use `IAuditLog`. There is no durable record identifying who initiated checkout, which plan was requested, billing cycle, calculated amount or PayOS order code.

Required work:

- Record `CreateSubscriptionPayment: None -> Pending` in the same transaction as the payment.
- Include safe context such as plan, billing cycle and order code; never store PayOS secrets or webhook signatures.
- Associate the event with the authenticated initiating user.

#### PAY-NOTIF-02: Successful webhook has no audit, notification or realtime event

`HandlePayOSWebhookCommandHandler` marks a payment `Completed` and applies an upgrade or scheduled downgrade, then saves the unit of work. It does not create a notification, record the payment/subscription transition or invoke the realtime publisher.

Required work:

- Persist one payment audit and, when applicable, one subscription state-change audit.
- Persist one notification for the intended recipient.
- Commit the transaction before publishing SignalR.
- Treat SignalR failure as non-fatal after persistence succeeds.

#### PAY-NOTIF-03: Polling duplicates settlement logic and has no integration side effects

`SyncPaymentStatusCommandHandler` duplicates the webhook settlement logic. It can complete a payment and update a subscription or mark a cancelled/expired PayOS link as failed, but it creates no audit or notification.

Required work:

- Remove duplicated settlement behavior from both entry handlers.
- Route webhook and polling through one shared application service/use case.
- Ensure the shared operation owns payment transition, subscription transition, audit and notification creation.

#### PAY-NOTIF-04: Settlement is not concurrency-safe or fully idempotent

Webhook and browser polling may load the same pending payment concurrently. The current `payment.Status == Pending` checks are not enough because two separate database contexts can both read `Pending` before either commits. Adding notification code directly to both paths would allow duplicate audits, notifications or subscription transitions.

Required work:

- Add an optimistic concurrency token to `Payment`, or use an atomic conditional update/transaction strategy supported by the repository architecture.
- Only the request that successfully owns `Pending -> terminal status` may create settlement side effects.
- A repeated success webhook or poll must return the already stored status without creating new records.
- Add a unique/deduplication boundary for settlement notification if concurrency protection alone cannot guarantee it.

#### PAY-NOTIF-05: Anonymous polling endpoint mutates tenant data

`GET /api/subscriptions/payment-status/{orderCode}` is `AllowAnonymous` and can update `Payment` and `TenantSubscription`. It does not verify that the caller belongs to the payment tenant. A GET request also has a server-side mutation, which makes authorization, caching and observability harder.

Required work:

- Require authentication and the appropriate subscription permission.
- Verify `payment.TenantId == IUserContext.TenantId`.
- Prefer `POST /api/subscriptions/payments/{orderCode}/sync` or another explicit command endpoint.
- Update FE to call the protected endpoint through the authenticated API client.
- Keep the PayOS webhook anonymous, but only after cryptographic signature verification.

#### PAY-NOTIF-06: Payment does not identify its initiating user

`Payment` contains `TenantId` but no initiating user. The webhook has no authenticated user context, so it cannot reliably attribute audit activity or route the notification to the exact user who started checkout.

Required work:

- Add `InitiatedByUserId` to `Payment` and populate it from `IUserContext.UserId` at creation.
- Define a user relationship and deletion behavior consistent with audit retention.
- Generate the migration with EF CLI; do not create migration files manually.
- Handle existing payment rows by adding the column nullable first or backfilling from `Tenant.OwnerId` before enforcing a required constraint.

#### PAY-NOTIF-07: No Payment/Subscription notification contract exists

BE `NotificationType` and FE `NOTIFICATION_TYPES` contain `SubscriptionPlanUpdate`, but no type represents a tenant payment or subscription lifecycle result. Reusing `SubscriptionPlanUpdate` would mix catalog administration with customer billing events.

Required work:

- Add a coordinated BE/FE notification type. Recommended minimum: `SubscriptionPaymentUpdate`.
- Use clear titles/messages for completed, failed/cancelled and scheduled plan changes.
- Use `ReferenceType = Payment` and `ReferenceId = payment.Id` for payment events.
- Add FE routing from `Payment` to payment history or subscription details.
- Update filter labels, schemas, type guards and tests in the same release.

#### PAY-NOTIF-08: Legacy subscription commands bypass PayOS

`POST /api/subscriptions/upgrade` can immediately apply an upgrade and create a `Completed` payment without PayOS. `POST /api/subscriptions/renew` also extends the subscription and creates a `Completed` payment directly. FE no longer uses direct upgrade for normal plan selection, but both APIs remain callable.

Required work:

- Decide one canonical billing policy.
- For paid customer actions, require the PayOS pending-payment flow and settle only from verified PayOS state.
- Remove, disable or restrict the legacy direct-completion endpoints.
- If an internal/manual settlement workflow is required, expose it only to an explicit administrative permission and audit it as a manual action.
- Renewals that require payment must create a PayOS link rather than a completed payment.

#### PAY-NOTIF-09: Failed/cancelled webhook outcomes are not persisted

The webhook returns immediately when verification fails or the verified code is not `00`. Only browser polling maps PayOS `CANCELLED`/`EXPIRED` to `PaymentStatus.Failed`. If the user never returns to the result page, a cancelled or expired payment may remain `Pending` indefinitely.

Required work:

- Distinguish invalid signatures from valid non-success lifecycle messages.
- Persist supported terminal failure/cancellation outcomes from verified PayOS data.
- Add a reconciliation job for stale pending payments because browser return and webhook delivery are not guaranteed.
- Do not notify on an invalid/unverified payload.

### P1 - Required quality and business-completeness work

#### PAY-NOTIF-10: Subscription lifecycle audit is incomplete

The direct upgrade, renew and cancel handlers do not record workflow audit events. The target audit coverage is:

- Payment created: `None -> Pending`.
- Payment completed: `Pending -> Completed`.
- Payment failed/cancelled/expired: `Pending -> Failed` or a more precise future status.
- Subscription upgraded immediately after successful payment.
- Subscription downgrade scheduled after successful payment.
- Subscription renewed after successful payment.
- Subscription cancellation scheduled.
- Manual/admin settlement, if retained, with an explicit reason.

Audit events must be written once and in the same database transaction as the corresponding state transition.

#### PAY-NOTIF-11: Recipient policy must be explicit

The desired recipient is described as the initiating user, while tenant billing is generally owned by the Tenant Owner. These can differ if permissions expand later.

Required decision:

- Send the transaction result to `InitiatedByUserId`.
- Optionally notify the Tenant Owner as a separate recipient when the initiator is different.
- Do not create duplicate notifications when the initiator is the owner.

#### PAY-NOTIF-12: Pending checkout policy is undefined

The current handler can create multiple pending payments for the same subscription. This can leave multiple valid PayOS links capable of changing the plan later.

Required work:

- Allow at most one active pending subscription payment per tenant/subscription, or explicitly expire/cancel the previous PayOS link before creating another.
- Prevent an older checkout from overwriting a newer subscription decision.
- Add a database constraint or transaction-safe application rule where practical.

#### PAY-NOTIF-13: PayOS nullable mapping warnings remain

`PayOSService` currently produces nullable-reference warnings while copying SDK webhook fields into the application contract. These must be normalized or validated at the adapter boundary so application handlers receive a reliable verified model.

#### PAY-NOTIF-14: Payment status model loses failure detail

PayOS `CANCELLED` and `EXPIRED` are both mapped to the generic domain status `Failed`. This is functional but limits accurate audit messages, notification copy and operational reporting.

Required decision:

- Keep `Failed` and store a reason/provider status; or
- Extend `PaymentStatus` with `Cancelled`/`Expired` if reporting requires separate states.

Any entity/schema change must use an EF CLI-generated migration.

### P2 - Frontend experience and maintainability

#### PAY-NOTIF-15: Payment-result page does not host realtime notification UI

The PayOS return route is under the public layout, while `NotificationRealtimeProvider` is mounted only in the private layout. The result page correctly renders its own payment status, but it will not show the global notification popup while it remains public.

Expected behavior:

- Keep the result page self-contained for success/failure feedback.
- Persist the notification on BE regardless of realtime availability.
- When the authenticated user returns to the private area, header queries/provider startup load the persisted notification.
- Do not move the result route to private layout unless authentication after third-party redirect is guaranteed and tested.

#### PAY-NOTIF-16: FE payment cache invalidation excludes notifications

On successful polling, `PaymentResultPage` invalidates subscription and payment caches only. After BE integration it should also invalidate notification queries so persisted results become visible immediately whenever the notification query exists in the current client session.

#### PAY-NOTIF-17: Duplicate public payment-result routes exist

Both `/payment-result` and `/subscription/payment-result` render the same page, while BE currently returns PayOS to `/payment-result`.

Required work:

- Choose one canonical route.
- Redirect the compatibility route to the canonical route if it must remain.
- Keep BE return/cancel URL, FE routes and deployment configuration aligned.

## 5. Target Integration Design

### 5.1 Recommended backend flow

```text
Create checkout (authenticated)
  -> validate tenant/subscription/plan and pending-payment policy
  -> create PayOS link
  -> save Payment(Pending, InitiatedByUserId)
  -> save audit None -> Pending
  -> commit

Webhook or authenticated sync
  -> obtain verified provider status
  -> shared SettleSubscriptionPayment operation
       -> begin transaction
       -> load payment with concurrency protection
       -> return stored status if already terminal
       -> transition Payment
       -> transition TenantSubscription when required
       -> write payment/subscription audit records
       -> write recipient Notification rows
       -> commit
  -> publish SignalR after commit for each persisted notification
  -> log realtime failures without rolling back settlement
```

### 5.2 Suggested application components

- `ISubscriptionPaymentSettlementService` or one shared command/handler.
- A settlement result containing final status and notifications that were newly persisted.
- Provider status normalization at `IPayOSService` boundary.
- A reconciliation command/job for stale pending payments.
- Tests using a fake `IPayOSService` and fake `INotificationRealtimePublisher`.

Avoid placing database or notification logic inside `PayOSService`; it is an external-service adapter only.

### 5.3 Transaction and realtime boundary

The required ordering is:

1. Change payment/subscription state.
2. Add audit and notification entities.
3. Save/commit successfully.
4. Publish SignalR.
5. Log and swallow realtime-delivery failures.

Never publish before persistence. Never roll back a verified payment because SignalR is unavailable.

## 6. Required Backend Work Checklist

- [x] Define canonical PayOS-only policy for upgrade, downgrade and renewal.
- [x] Add `Payment.InitiatedByUserId` and relationship configuration.
- [x] Generate and review EF CLI migration, including legacy-row backfill strategy.
- [x] Add payment optimistic concurrency/atomic settlement protection.
- [x] Add pending-checkout uniqueness/expiry policy.
- [x] Add `SubscriptionPaymentUpdate` notification type.
- [x] Add the shared settlement service/use case.
- [x] Refactor webhook to call shared settlement.
- [x] Replace anonymous mutating GET polling with an authenticated tenant-scoped command endpoint.
- [x] Refactor polling to call shared settlement.
- [x] Persist verified failure/cancel/expiry outcomes.
- [x] Add Quartz reconciliation for stale pending transactions.
- [x] Record audit on pending creation.
- [x] Record audit on every terminal payment transition.
- [x] Record audit on subscription upgrade/downgrade/renew/cancel transitions.
- [x] Persist recipient notification in the settlement transaction.
- [x] Publish SignalR only after successful commit.
- [x] Resolve PayOS adapter nullable warnings.
- [x] Remove legacy direct-completion upgrade and renew handlers; both routes now create PayOS links.
- [ ] Confirm `dotnet ef migrations has-pending-model-changes` reports no pending changes.

## 7. Required Frontend Work Checklist

- [x] Add the coordinated payment/subscription notification type.
- [x] Add localized filter label mapping.
- [x] Map `ReferenceType = Payment` to the canonical payment history route.
- [x] Update payment-result success handling to invalidate notification queries.
- [x] Change polling to the protected tenant-scoped command endpoint.
- [x] Use the authenticated API client for payment sync.
- [x] Choose `/payment-result` as the canonical route and remove the duplicate.
- [x] Ensure plan changes and paid renewals use only PayOS checkout.
- [x] Show a useful terminal state for failed/cancelled/expired payments.
- [x] Preserve the self-contained public result UI even when SignalR is unavailable.

## 8. Automated Test Plan

### 8.1 Backend tests

- [x] Creating checkout persists `Payment(Pending)` with tenant and initiating user.
- [x] Creating checkout invokes exactly one audit record.
- [x] Invalid webhook verification errors propagate without invoking settlement.
- [ ] Verified success completes an upgrade and records correct subscription dates.
- [ ] Verified downgrade schedules the next plan without applying it immediately.
- [ ] Verified failure/cancellation updates payment without changing subscription.
- [x] Successful renewal settlement persists exactly one notification and publishes once after save.
- [ ] Realtime failure does not undo payment, subscription, audit or notification data.
- [x] Repeated settlement is idempotent.
- [ ] Webhook and polling race produces one settlement, one audit set and one notification.
- [ ] Polling rejects anonymous callers.
- [x] Polling rejects a user from another tenant without calling PayOS.
- [ ] Stale pending reconciliation reaches the correct terminal state.
- [ ] Legacy direct upgrade/renew endpoints cannot bypass the canonical payment policy.

### 8.2 Frontend tests

- [x] Checkout sends `{ newPlanId, billingCycle }` and redirects to returned PayOS URL.
- [x] Payment-result polls only with a valid order code and renders a safe missing-code error.
- [x] Completed result invalidates subscription, payment and notification caches.
- [x] Failed/cancelled/expired results stop polling and render the correct message.
- [x] Protected sync uses the shared authenticated Axios client and command endpoint.
- [ ] `SubscriptionPaymentUpdate` realtime payload passes schema validation.
- [ ] Realtime event invalidates notification queries and shows one deduplicated popup.
- [ ] Clicking a payment notification navigates to the canonical billing route.
- [ ] Persisted notification appears after entering the private layout even if realtime was missed.

## 9. QA Scenarios

1. Tenant Owner creates a monthly upgrade, pays successfully and sees the result, updated plan, payment history, notification and audit trail.
2. Tenant Owner creates a yearly upgrade and verifies correct amount, dates and invoice data.
3. Tenant Owner schedules a downgrade and verifies it is not applied before the next cycle.
4. User cancels at PayOS and verifies terminal payment state without subscription change.
5. User closes the PayOS/browser result page; webhook or reconciliation still settles the payment and persists notification.
6. Deliver webhook twice and confirm no duplicate audit/notification.
7. Trigger webhook and polling concurrently and confirm exactly-once side effects.
8. Disable SignalR during settlement and confirm persisted data remains correct; notification appears after reconnect/page entry.
9. Attempt to sync another tenant's order code and expect authorization/not-found behavior without information leakage.
10. Attempt the legacy direct upgrade/renew route and confirm it cannot bypass payment.

## 10. Acceptance Criteria

The integration is complete only when all of the following are true:

- Every billable subscription transition is based on verified PayOS state or an explicitly authorized and audited manual workflow.
- Payment settlement is idempotent under repeat and concurrent webhook/poll requests.
- Payment, subscription, audit and notification records are transactionally consistent.
- The correct tenant user receives one persisted notification.
- SignalR is published after commit and delivery failure is non-fatal.
- Anonymous/cross-tenant callers cannot query or mutate payment state.
- Cancelled/expired payments cannot remain pending indefinitely.
- BE and FE share the same notification type and reference contract.
- Automated BE/FE tests cover success, failure, authorization, concurrency, realtime failure and missed-realtime recovery.
- EF migration is CLI-generated and the model reports no pending schema changes.
- Full BE tests, FE typecheck, lint, tests and production build pass.

## 11. Progress Tracking

| Phase   | Scope                                                                   | Status      |
| ------- | ----------------------------------------------------------------------- | ----------- |
| Phase 0 | Confirm business policy, recipient and canonical routes                 | Completed   |
| Phase 1 | Payment initiator, migration, concurrency and pending-payment integrity | Completed   |
| Phase 2 | Shared settlement, audit, notification and realtime publishing          | Completed   |
| Phase 3 | Secure polling, webhook failure handling and reconciliation             | Completed   |
| Phase 4 | FE notification contract, routing and payment-result integration        | Completed   |
| Phase 5 | Automated tests, QA, migration verification and regression gates        | In progress |

## 12. Current Verification Baseline

- 2026-09-03 integration verification: BE build passed with zero warnings; 165/165 BE tests passed.
- EF reports no pending model changes, and the generated migration SQL was inspected successfully.
- FE typecheck and lint passed; 402/402 tests passed; production build passed with 53 routes.
- Dedicated tests now cover checkout initiator/pending policy, invalid webhook propagation,
  cross-tenant sync isolation, verified amount mismatch, renewal settlement idempotency, protected
  FE sync routing, untrusted return URL handling and notification cache invalidation.
- Live PayOS sandbox QA and a true parallel SQL Server webhook/poll race test remain release QA work.
