# Storage capacity — FE Gate B handoff

Canonical spec: `../../../SSWMS-Backend/docs/features/2026-10-01-storage-location-capacity-spec.md`.
Branch: `feat/storage-location-capacity`.

## Status

FE functional implementation and the required Gate B automated/focused browser checks passed. The user authorized adding QA data to production database db71143, assigning Staff to the QA warehouse, and adding permissions needed for testing. Permission blocker resolved through a user-specific override, not a global role change. Ready for the FE-only Gate B commit. Gate C has not started; its broader browser/visual matrix remains outstanding.

## Implemented

- Shared None/Quantity policy fields for regular slots and RackLevel racks in the location directory and diagram designer.
- Active capacity units, conditional validation, stocked type/unit locks, normalized-used lower bound, legacy warning, and preserved hidden legacy mass metadata and physical dimensions.
- Capacity summaries use `capacityUsed`, not receipt/base-unit quantity or legacy occupancy.
- Put-away options show normalized capacity and disable full/pending locations. BE performs final conversion/capacity validation; FE does not compare quantities in different units or fetch conversions per SKU.
- Existing product conversion UI retained. Expected conversion-lock/put-away errors preserve Vietnamese BE messages without logging expected 400/409 responses through console.error.

## Verification

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test`: 45 files, 146 tests passed (rerun after live-browser GUID validation fix).
- `pnpm build`: passed, 61 static pages generated.
- `git diff --check`: passed.
- GitNexus context/impact analysis before changes; `detect_changes` after changes reports HIGH aggregate impact across shared form, designer/viewer, and put-away flows. Regression tests cover those shared callers.
- GitNexus full-text query is unavailable (missing FTS table), including after index rebuild. Symbol context and impact tools work; file search supplemented with rg.
- These are automated checks and implementation self-review, not an independent security review or live end-to-end validation.

## Remaining gate checks

Browser access recovered after the user restarted Codex. On 2026-10-02, signed in using the supplied Tenant Owner account and inspected warehouse DN-01 / Đà Nẵng. Verified legacy warnings on A01/A02, active unit loading, None/Quantity conditional fields, blocked submission with missing maximum, and viewer legacy summary plus Owner configuration action. Canceled edited forms without saving. No console errors were observed in these tested flows.

Live QA found a real mismatch: z.uuid rejected the seeded Thùng unit GUID `09dcfa34-643a-b355-d8b0-45a0f0caadbf`, whose bits do not satisfy RFC UUID restrictions. Switched the shared capacity unit schema to existing Zod z.guid validation, still rejecting Guid.Empty. Added a rack/slot regression test and verified on the live form that selecting Thùng no longer raises an invalid-unit error while missing maximum remains blocked. GitNexus schema impact returned LOW; both shared form paths are covered by automated tests.

On 2026-10-02 the user explicitly authorized adding/seeding QA data on db71143 without deleting the database. Verified the effective EF provider/server/database before writes: Microsoft.EntityFrameworkCore.SqlServer, db71143.public.databaseasp.net, db71143. Added master data through existing business APIs, not raw SQL or the whole-tenant seed:

- Warehouse QA-CAP-261002 / QA-CAP Kiểm thử sức chứa: 3920ee02-37dd-4848-77ce-08df203d3e75.
- Zone QA-CAP-Z: 5af56e53-30c4-42db-feed-08df203d3fb0.
- RackLevel racks QA-CAP-R20 (20 Thùng), QA-CAP-R1 (1 Thùng), QA-CAP-NONE (None); mixed products enabled.
- Category QA-CAP-261002 and products QA-CAP-24 (1 Thùng = 24 Lon), QA-CAP-12 (1 Thùng = 12 Lon), QA-CAP-NOCONV (Lon, no conversion).

Live Owner browser QA successfully saved QA-CAP-NONE as Quantity / 5 Thùng, reopened the form and verified persisted maximum/unit, then saved it back to None. The directory displayed the updated policy after both saves. No console errors were observed. These edits only affected the dedicated QA rack. QA fixtures remain in place.

Remaining: stocked Quantity locks, legacy remediation persistence, mixed-SKU put-away conversion/insufficient-capacity messages, and product conversion lock messages. Following explicit user confirmation, assigned warehouse.staff@sswms.local only to QA-CAP-261002 (existing assignment list was empty; optimistic expectedWarehouseIds used). Created approved inbound request IR-20261002043213-65526152 (3c7c655f-a048-4af8-e1cf-08df203e2196) via the Owner business flow: 240 Lon QA-CAP-24, 24 Lon QA-CAP-12, 1 Lon QA-CAP-NOCONV. Assigned its receiving task to Staff.

The next operation was rejected with HTTP 403. Fresh Staff login + auth/me confirmed effective permissions are only suppliers:view, warehouse-tasks:manage-own, warehouse-tasks:view-own, warehouses:view. Thus Staff lacks goods-receipt creation/put-away permissions; no receipt or inventory was created. Do not change tenant role permissions or bypass authorization without explicit approval. QA fixtures and queued receiving task remain in place.

Following the user's subsequent explicit approval, added only goods-receipts:view/create/submit/putaway as user-specific grants for warehouse.staff@sswms.local, preserving its existing four effective permissions. No approval/rejection permission, global role change, or additional warehouse assignment was added. Fresh auth/me confirmed the eight effective permissions. This configuration remains in place for testing.

Created receipt GR-20261002043815-090A4CC2 (564909e8-a859-4664-0344-08df203ef9be) as Staff, submitted as Staff, approved as Owner, and assigned put-away to Staff. Live Staff FE QA verified:

- 48 Lon QA-CAP-24 to QA-CAP-R1 rejected: 2 Thùng exceeds 1 Thùng. No console.error/Next overlay.
- 192 Lon QA-CAP-24 plus 24 Lon QA-CAP-12 to QA-CAP-R20 succeeded. Receipt remaining quantities are 48 Lon and 1 Lon; normalized capacity display updated to 10 / 20 Thùng, remaining 10, 50%.
- 1 Lon QA-CAP-NOCONV to QA-CAP-R20 rejected with a Vietnamese missing-conversion message, no console.error/Next overlay.
- BE messages and receipt location display still expose **SYSTEM_DEFAULT** for RackLevel locations instead of the public rack code; recorded as a live QA usability finding, not silently marked fixed.

Additional live Owner QA on 2026-10-02 verified stocked policy locks/lower bound: QA-CAP-R20 shows 10 / 20 Thùng; type and unit controls are disabled with a Vietnamese explanation. Setting maximum to 9 is rejected by FE before submission; canceled without changing the stored maximum.

On QA-CAP-24, attempted changing Thùng factor from 24 to 25 and deactivating the conversion. Both returned expected HTTP 409 with Vietnamese explanation that stocked capacity locations require the conversion. No console.error or Next overlay; expected business responses use logger.warn. The table still shows 1 Thùng = 24 Lon and Active. No conversion mutation succeeded.

Legacy warnings were verified read-only on existing DN-01 rows. Legacy remediation payload/null-clearing and metadata preservation are covered by automated component/schema tests; deployed legacy persistence was deliberately not exercised against existing business rows. SlotLevel visibility/edit restrictions are covered by automated tests. This is not a claim that Gate C's full live matrix has passed. All QA fixtures and posted inventory remain in place; no cleanup is authorized.

After focused browser QA passes: repeat GitNexus change detection and diff checks, commit FE-only Gate B changes, report, and stop for the user's instruction before Gate C.

## Safety

No database deletion, reset, destructive rollback, or deletion of user files was performed. No migration or full seed runner was executed during this FE gate. Only explicitly authorized QA master-data additions, QA rack form edits, Staff QA assignment/user-specific grants, and QA receipt/put-away operations above were submitted. BE was separately started at the user's request with startup migration/seed disabled; its existing background jobs continue normally. No BE source changes, push, PR, or branch synchronization were performed.
