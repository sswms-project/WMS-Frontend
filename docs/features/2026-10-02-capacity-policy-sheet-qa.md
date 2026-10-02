# Capacity policy table and shared Sheet animation

## Scope

- Capacity policy uses one table row with three columns: type, maximum capacity, unit.
- Quantity validation, occupied-location locks and unlimited-capacity confirmation are unchanged.
- Shared Radix Sheets use `data-state` selectors, 300 ms directional entrance/exit and reduced-motion support. Centered dialogs are unchanged.
- Mixed-product policy is retained: it controls SKU mixing, independently of capacity. Backend put-away checks distinct incoming and existing products; updating a rack cannot disable mixing while it contains multiple products.

## Verification

- Full Vitest suite: 48 files, 171 tests passed.
- Targeted regression suite after strict TypeScript test correction: 2 files, 20 tests passed.
- ESLint, typecheck and production build passed.
- Browser: rack editing and product creation Sheets resolve to `animation-name: enter`, `animation-duration: 0.3s`, entrance translation `100%`.
- Desktop: capacity controls align in one three-column row.
- 390 px viewport: table scrolls inside its container (544 px content / 333 px container, `overflow-x: auto`), not outside the form.
- Browser forms were cancelled without saving. No migrations, seed or database writes were performed.
- GitNexus reports shared Sheet callers including product editing, permissions and operational detail panels; existing props, sizing, focus/dismissal handlers and submission guards are unchanged.

## Follow-up UX fixes

- Length/width/height are optional. Zod clears units for blank dimensions before submission, maintaining the BE value/unit pairing contract. Entered dimensions still require positive values and units; operational capacity validation is unchanged.
- The legacy capacity-configuration notice is omitted only inside editing forms, not from operational lists or put-away validation.
- Location forms close their Radix Sheet first and notify the parent in `onCloseAutoFocus`, allowing exit animation before conditional unmount. Shared Sheet exit is now 180 ms; entrance remains 300 ms, with reduced-motion support.
- Stock-status filters read cached counts during placeholder loading and remain mounted; stale product rows are not shown under the new filter. URL state continues to use native history, with no page navigation.
- Browser confirmed location Sheet `data-state=closed`, `animation-name=exit`, `animation-duration=0.18s`; a first stock-filter switch retained all three controls while loading the result body.
- Centered supplier/customer Dialogs were inspected but not changed: proposed fade plus subtle 95-to-100% scale, 200 ms entrance / 140 ms exit, disabled for reduced motion. Current shared Dialog uses incompatible `data-open` selectors, to fix if this proposal is approved.
- QA only opened/cancelled forms and changed list filters; no database writes.
- Follow-up verification: 49 test files / 177 tests passed; ESLint, typecheck, production build and diff checks passed.
