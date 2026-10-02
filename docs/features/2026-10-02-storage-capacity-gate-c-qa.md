# Storage location capacity — Gate C QA

Date: 2026-10-02. Branch: `feat/storage-location-capacity`.

## Implementation

- Capacity controls are grouped under Thông tin chi tiết, separate from physical dimensions.
- Shared Quantity summary includes used/maximum, remaining, status, and accessible progress.
- Warning threshold is centralized at 80%; full starts at 100%. None and pending configuration have no progress.
- Quantity → None asks for confirmation; cancellation preserves the current form and confirmation does not save automatically.
- Capacity input retains numeric values after blur; validation focuses the invalid maximum/unit control.
- Shared Progress passes its value to Radix to expose determinate accessibility state.
- Existing warehouse permissions, inventory calculations and physical metadata remain unchanged.

## Automated verification

- FE: lint, typecheck and production build passed.
- FE: 47 test files, 158 tests passed, including confirmation/cancellation, numeric blur, locked fields, invalid units, maximum below used, legacy/None, viewer summary and progress accessibility.
- BE presentation regression: 110 warehouse/ledger/put-away/transfer tests passed (Debug build, isolated InMemory/SQLite fixtures). No deployed DB migrations were run for Gate C.
- GitNexus impact/detect_changes reviewed. Shared Progress and BE capacity policy are high-impact dependencies; the BE change affects message labels only.

## Browser coverage

- Owner: empty and occupied RackLevel, locked type/unit, below-used validation and focus, confirmation cancel/accept without saving.
- Manager: assigned only to QA-CAP-261002 with explicit user confirmation. Can edit occupied RackLevel. Saved maximum 10 to exercise full state, then restored and verified 20. Inventory quantities unchanged.
- Staff: QA warehouse visible, no add/edit/diagram-setup controls. Summary works and keyboard panel resize works. Inventory requests receive HTTP 403 in BE logs under this account's existing permissions; no additional inventory permission was granted. Owner receives the stock table normally. This is expected denial, not evidence of an inventory-table regression.
- Owner viewer: close/reopen resets selection, current capacity is 10/20 Thùng after the full-state test was restored. Stock rows contain 24 and 192 Lon. After keyboard resize, the inventory panel client/scroll widths are both 426px; the table has its own 410px/736px horizontal scroller.
- SlotLevel: added QA-CAP-SLOTS and child QA-CAP-S01 (20 Thùng, empty). Rack form hides operational capacity; child create and reopened edit use the shared policy/summary, showing 0/20 and remaining 20.
- Legacy: inspected Đà Nẵng/A01 pending-configuration warning without saving any changes to that warehouse.
- Responsive Sheet: desktop, 900px, 600px, 390px; capacity fits and physical-dimensions table has its own horizontal scroll. Light and dark themes inspected.
- Browser console: no new error/warning observed during form and permission tests.

## Database scope

Effective target verified through EF context info: Microsoft.EntityFrameworkCore.SqlServer,
server `db71143.public.databaseasp.net`, database `db71143`.
Only user-authorized QA assignment/configuration changes were performed.
No database deletion, reset, rollback, migration or bulk cleanup.

## QA records retained

- Manager QA assignment and SlotLevel fixture remain in place for follow-up testing. QA-CAP-R20 maximum was restored to 20.
- Screenshots are kept outside the FE repository in `../qa-artifacts/` (manager assignment, occupied/full dark form, SlotLevel light form, legacy warning, Owner viewer and Staff read-only list).
- Compatible/incompatible mixed-SKU put-away flows were browser-verified in Gate B and remain covered by BE regression tests in this gate.
- No new browser error/warning attributable to the capacity UI was observed. Existing Staff inventory denial is explicitly documented above.
- Self-verification is not an independent code review. No PR/push is authorized by this gate.
