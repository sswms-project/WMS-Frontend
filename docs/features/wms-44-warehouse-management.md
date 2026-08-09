# WMS-44 - Warehouse Management UI

## Goal

Provide Tenant Owners with a responsive operational screen to browse, create, inspect, and update warehouses. The feature uses the existing warehouse API and remains safe for a data-dense B2B workspace.

## Scope

### Included

- Route: `/warehouses`, accessible only to `Tenant Owner`.
- Browse warehouses with server search and pagination.
- Create a warehouse from a central dialog.
- View warehouse details on `/warehouses/[warehouseId]`.
- Update warehouse name and address from the detail screen.
- View the warehouse layout as a read-only zone, rack, and slot hierarchy.
- Loading, error, empty, permission, duplicate-code, and success states.
- Responsive behavior for 360px mobile, 768px tablet, and 1366px desktop.

### Explicitly excluded

- Deactivate a warehouse, despite `PATCH /api/warehouses/{id}/deactivate` being available. This needs a separate business confirmation flow.
- Create, edit, or delete zones, racks, and slots. The API exists, but this is the dedicated layout-configuration workflow rather than WMS-44.
- Warehouse locations search, barcode generation, inventory operations, and manager assignment.
- Backend, database, API-contract, or permanent seed-data changes.

## Backend Contract

All calls require an authenticated `Tenant Owner` session with the corresponding warehouse permission. The backend scopes warehouse data to the current tenant.

| Use case | Endpoint                          | Request                                              | Response                         | Notes                                                                                                |
| -------- | --------------------------------- | ---------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Browse   | `GET /api/warehouses`             | Query: `top`, `skip`, `searchText`, `needTotalCount` | `QueryResult<WarehouseResponse>` | Searches code and name.                                                                              |
| Create   | `POST /api/warehouses`            | `{ warehouseCode, warehouseName, address }`          | `Guid`                           | Duplicate code returns a conflict.                                                                   |
| Detail   | `GET /api/warehouses/{id}`        | -                                                    | `WarehouseDetailResponse`        | Includes `zoneCount` and modification date.                                                          |
| Update   | `PUT /api/warehouses/{id}`        | `{ warehouseName, address }`                         | `WarehouseDetailResponse`        | Warehouse code is immutable. Omit unchanged optional fields only when supported by the form payload. |
| Layout   | `GET /api/warehouses/{id}/layout` | -                                                    | `ZoneResponse[]`                 | Each zone contains racks and slots. Read-only in this feature.                                       |

Shared API envelopes:

```ts
interface ApiResponse<T> {
  isSuccess: boolean
  statusCode: number
  message: string
  data: T
}

interface QueryResult<T> {
  items: T[]
  totalCount: number
}
```

Relevant response fields:

```ts
interface WarehouseResponse {
  id: string
  warehouseCode: string
  warehouseName: string
  address: string | null
  status: string
  createdAt: string
}

interface WarehouseDetailResponse extends WarehouseResponse {
  zoneCount: number
  modifiedAt: string | null
}

interface ZoneResponse {
  id: string
  zoneCode: string
  zoneName: string
  description: string | null
  status: string
  racks: RackResponse[]
}
```

## Frontend Architecture

- Keep `src/app/(private)/warehouses/page.tsx` and `src/app/(private)/warehouses/[warehouseId]/page.tsx` as default-export route wrappers only.
- Place orchestration, services, React Query hooks, Zod schemas, DTOs, and page-specific visual components in `src/features/warehouse/`.
- Reuse `axiosClient`, `API_ENDPOINTS.warehouses`, and `queryKeys.warehouses`. Extend endpoint constants for detail, update, and layout only; do not hard-code paths in components.
- Promote the shared warehouse response type used by both the staff assignment flow and this feature to `src/types/` if doing so removes the existing duplication. Do not refactor unrelated staff behavior.
- Services unwrap Axios response data. Queries and mutations own server state through TanStack Query; pages own dialog and navigation state; presentational components receive props and callbacks only.

## UX And Responsive Design

### Warehouse list

- Compact B2B header with page context, current total, search, refresh, and primary `Tạo kho` action.
- Desktop/tablet: semantic table with code, name, address, status, created date, and a detail action.
- Mobile: vertically stacked warehouse items that preserve code, status, address, and detail action without page-level horizontal overflow.
- Search is debounced and resets pagination to the first page. Pagination uses `top`, `skip`, and `needTotalCount: true`.
- Use shadcn `Table`, `Button`, `Input`, `Skeleton`, `Empty`, `Pagination`, `Badge`, and `Tooltip`; use Lucide icons where an icon is clearer than repeated action text.

### Create warehouse dialog

- Central shadcn `Dialog` with accessible title and description.
- React Hook Form + Zod schema:
  - `warehouseCode`: trimmed, required, maximum 50 characters.
  - `warehouseName`: trimmed, required, maximum 255 characters.
  - `address`: trimmed, optional, maximum 500 characters.
- Use `FieldGroup`, `Field`, `Input`, and `Textarea`; set `data-invalid` and `aria-invalid` for invalid fields.
- Disable submit while pending. On success: close and reset the dialog, invalidate `queryKeys.warehouses.all`, then show a success toast.
- Map conflict/field errors for the warehouse code to the code field. Network, permission, and unexpected errors log with `console.error` and display a Vietnamese toast/contextual error.

### Detail and update

- Detail page exposes operational metadata: immutable code, name, address, status, zone count, created date, and last modified date.
- Edit action opens an accessible dialog prefilled with name and address. It never presents warehouse code as editable.
- On update success, refresh the detail and list caches, close/reset the dialog, and show a success toast.
- A back action returns to the list without losing the architectural boundary between route and feature page.

### Layout view

- Detail screen includes a `Bố cục kho` tab/section that queries layout only when opened.
- Render zone, rack, and slot data as an accessible read-only hierarchy using existing shadcn composition such as `Accordion` and `Badge`.
- Show zone/rack/slot codes with the mono token where appropriate and display empty-layout guidance when no zones exist.
- Do not expose edit/add/delete layout controls in this ticket.

### Visual rules

- Follow `AGENTS.md`, `.rules`, `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, and `docs/AI_WORKFLOW.md` before implementation.
- Use only semantic Tailwind tokens from `src/app/index.css`; never add hard-coded palette colors to feature classes.
- Product UI stays dense, border-led, and scannable. Use natural mobile scroll, `min-w-0`, responsive grids, and localized truncation/wrapping to prevent overflow.
- Apply `shadcn`, `vercel-react-best-practices`, and `web-design-guidelines`. `design-taste-frontend` is advisory only because this is an operational product screen.

## Access Control

- Add `/warehouses` and its child detail route to `src/config/route-permissions.ts` for `Tenant Owner` only.
- Retain the sidebar entry only for `Tenant Owner`; hide it from `System Admin`, `Warehouse Manager`, and `Warehouse Staff`.
- Proxy must redirect unauthorized roles to `/unauthorized`. The API remains the final permission authority.

## Test Strategy

### Automated

- Schema tests: required fields, whitespace, maximum lengths, and optional address.
- Pure helper tests: pagination/search query derivation and API conflict-to-form-field mapping.
- Component tests: create dialog submits the expected payload, pending state disables submit, success closes/invalidate behavior, and errors are visible near the relevant field.
- Run `pnpm lint`, `pnpm test`, `pnpm build`, and `git diff --check`.

### Manual browser checks

- Sign in as `tenant.owner@sswms.local` using the local development password supplied for the project.
- Verify list load, search, pagination, create with a unique temporary code, duplicate-code error, detail route, update, and an empty layout.
- Verify `system.admin@sswms.local`, `warehouse.manager@sswms.local`, and `warehouse.staff@sswms.local` cannot open `/warehouses` and do not see the sidebar entry.
- Check 360x800, 768x1024, and 1366x768. There must be no horizontal page overflow, clipped dialog, inaccessible action, or overlapping text.
- Test data is created through the local API/UI only and is never added as committed seed data.

## Progress Tracker

- [x] Audit backend warehouse API and tenant isolation.
- [x] Confirm role decision: Tenant Owner only.
- [x] Create feature branch.
- [x] Create implementation spec.
- [ ] Add route, endpoint constants, permissions, and navigation visibility.
- [ ] Add warehouse types, schemas, service, and React Query hooks.
- [ ] Implement list, search, pagination, and create dialog.
- [ ] Implement detail route and update dialog.
- [ ] Implement lazy read-only layout hierarchy.
- [ ] Add automated tests.
- [ ] Run lint, test, build, browser checks, and UI guideline review.
- [ ] Commit task-scoped files with `feat(wms-44): add warehouse management screen`.
