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
