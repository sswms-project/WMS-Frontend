# Warehouse Layout Designer - Design Specification

## 1. Document Control

| Item                   | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| Scope                  | 2D warehouse layout designer for the Warehouse Management workspace |
| Frontend repository    | `SSWMS-Frontend`                                                    |
| Backend repository     | `SSWMS-Backend`                                                     |
| Existing related work  | WMS-85 and WMS-86 warehouse workspace and layout explorer           |
| Planned backend branch | `feat/wms-85-89-warehouse-structure` from current `origin/dev`      |
| Status                 | Phase 1 and Phase 2 implemented; Phase 3 mobile path is partial     |
| Last updated           | 2026-08-11                                                          |

## 2. Objective

Provide an operational 2D designer where an authorized Warehouse Manager or Tenant Owner can position warehouse entities on a canvas that represents the real floor layout.

The canvas is not an image editor and must not become a separate source of truth. It must connect visual objects to existing Warehouse, Zone, Rack, and Slot entities so that future inventory, put-away, and location workflows can use the same data.

The intended experience is a compact, draw.io-like workspace:

```text
+----------------------+-----------------------------------------+----------------------+
| Toolbox              | Design canvas                           | Properties           |
| Zone                 |                                         | only when selected   |
| Rack                 |     [ Zone A ]    [ Rack A-01 ]         |                      |
| Door / Aisle         |     [ Rack A-02 ]    [ Receiving ]      | selected object form |
| Operational areas    |                                         |                      |
+----------------------+-----------------------------------------+----------------------+
```

## 3. Product Decisions

### 3.1 In scope

- 2D canvas only. No Three.js, 3D racks, or 3D camera.
- Select, drag, resize, rotate, duplicate where valid, delete where valid, zoom, pan, grid, snap, undo, redo, and explicit save.
- Dynamic properties based on the selected object.
- Visual connection to real Zones, Racks, and later Slots.
- Mobile view and inspect support with a touch-appropriate editing path.

### 3.2 Out of scope for the first release

- FIFO, FEFO, smart put-away, route optimization, and allocation logic.
- Inventory mutation from the canvas.
- Multi-user live collaboration.
- Direct business deletion of a Zone, Rack, or Slot from the keyboard Delete key.
- Generic whiteboard features such as freehand drawing, comments, or arbitrary text boxes.

### 3.3 Explicit design choices

- Do not embed draw.io, Excalidraw, or tldraw as a full editor. They would make the WMS domain model and access control secondary to a generic diagram format.
- Do not replace the existing WMS-86 explorer. The explorer remains a fast operational view; the designer is a distinct edit mode.
- Do not create a duplicate `LayoutObject` record for Zone, Rack, or Slot geometry that already exists in the backend entities.

## 4. Current Architecture and Reuse

### 4.1 Existing business model

The backend already owns this hierarchy:

```text
Warehouse
  -> Zone
       -> Rack
            -> Slot
```

`Zone`, `Rack`, and `Slot` already contain nullable `X`, `Y`, `Width`, and `Height` decimal fields. Their EF Core configurations already persist these fields with precision `(10, 2)`.

### 4.2 Existing APIs

| Existing endpoint                                         | Purpose                                                    | Keep as-is |
| --------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| `GET /api/warehouses/{warehouseId}/layout`                | Returns Zone, Rack, and Slot hierarchy for WMS-86 explorer | Yes        |
| `POST /api/warehouses/{warehouseId}/zones`                | Creates Zone business entity                               | Yes        |
| `POST /api/warehouses/{warehouseId}/zones/{zoneId}/racks` | Creates Rack business entity                               | Yes        |
| `POST /api/warehouses/{warehouseId}/racks/{rackId}/slots` | Creates Slot business entity                               | Yes        |

The current layout DTO deliberately exposes business hierarchy, not a canvas scene. It does not return geometry, rotation, z-index, canvas settings, or non-business objects.

### 4.3 Existing frontend architecture

- Next.js App Router with feature-first folders.
- TanStack React Query for server state and Zustand for client UI state.
- shadcn/ui with Radix primitives and Fresh Logistics semantic Tailwind tokens.
- Existing `ResizablePanelGroup`, `Sheet`, `Drawer`, `Tooltip`, `ToggleGroup`, `ScrollArea`, `Field`, and `Button` can be reused.
- Existing layout route: `/warehouses/{warehouseId}/layout`.

## 5. Proposed Data Model

### 5.1 Single source of truth

Business entities keep their business identity and geometry:

| Entity | Existing persisted fields   | Designer responsibility                        |
| ------ | --------------------------- | ---------------------------------------------- |
| Zone   | `X`, `Y`, `Width`, `Height` | Position and dimensions of a zone boundary     |
| Rack   | `X`, `Y`, `Width`, `Height` | Position and dimensions of a rack              |
| Slot   | `X`, `Y`, `Width`, `Height` | Reserved for later fine-grained slot placement |

The designer must render a business object by its real `id`. It must never create a second visual record that points to the same Zone/Rack/Slot solely to store the four existing geometry fields.

### 5.2 New persistence that is required

Add a one-to-one canvas settings record and a non-business decoration record:

```text
WarehouseLayoutSettings
  warehouseId (unique)
  canvasWidth
  canvasHeight
  gridSize
  version

WarehouseLayoutDecoration
  id
  warehouseId
  type: Door | Aisle | Receiving | Packing | Picking | Damaged | Office | Other
  label
  x, y, width, height
  rotation
  zIndex
```

Add `Rotation` and `ZIndex` to Zone and Rack only when the design requires them. Slot geometry should not be moved independently in the first release because slots will be rendered as the internal structure of a rack.

### 5.3 Rack configuration remains domain work

The current Rack model has no `levels` or `columns`; the current Slot model is created one at a time. A later Warehouse Structure phase must define rack-level configuration, slot generation, and slot-code rules. This work must not be hidden inside a canvas-only component.

## 6. Proposed API Contract

Keep the current explorer endpoint stable. Add a scene contract dedicated to the designer. Endpoint names remain a backend design decision, but the following shape fits the existing controller convention:

| Endpoint                                          | Permission                    | Purpose                                  |
| ------------------------------------------------- | ----------------------------- | ---------------------------------------- |
| `GET /api/warehouses/{id}/layout/scene`           | `warehouses:view`             | Read complete editable scene             |
| `PUT /api/warehouses/{id}/layout/scene`           | `warehouses:configure-layout` | Save a batch of geometry and decorations |
| `POST /api/warehouses/{id}/layout/scene/validate` | `warehouses:configure-layout` | Optional pre-save validation             |

The scene response should include:

```text
version
canvas: width, height, gridSize
zones: business fields plus geometry and optional rotation/zIndex
racks: business fields plus geometry and optional rotation/zIndex
slots: current hierarchy and operational summary only
decorations: non-business layout objects
```

### Save semantics

- Dragging, resizing, and rotating update a local editor draft only.
- The user sees a dirty state and saves intentionally from the top toolbar.
- One `PUT` persists the batch. Do not issue an API request for every pointer movement.
- The request includes `version`. A stale save returns `409 Conflict` and lets the user reload or resolve intentionally.
- Creating a Zone or Rack uses the existing domain command first. The scene updates only after that command succeeds.

## 7. Frontend Architecture

### 7.1 Canvas library

Adopt `react-konva` with `konva` when implementation begins. Neither package is currently installed.

Reasons:

- Canvas-first rendering is suitable for a spatial floor plan with many visual shapes.
- Konva Transformer supports selection, resize, and rotation.
- The current `react-konva` package supports the repository React 19 version.
- The scene renderer can remain an isolated client component while the surrounding route and shadcn controls use the existing application architecture.

Do not use React Flow as the primary engine. It is strong for node-edge diagrams, but a warehouse floor plan does not need edge semantics and requires natural rotation and layered geometry. Do not use tldraw as the full editor because its generic whiteboard model would require substantial reshaping for WMS domain behavior.

### 7.2 Feature structure

```text
src/features/warehouse/
  components/WarehouseDesigner/
    WarehouseDesignerWorkspace.tsx
    DesignerToolbar.tsx
    DesignerToolbox.tsx
    WarehouseCanvas.tsx
    DesignerInspector.tsx
    ZoneInspector.tsx
    RackInspector.tsx
    DecorationInspector.tsx
    MobileDesignerDrawer.tsx
  hooks/
    use-warehouse-layout-scene.ts
    use-layout-editor-history.ts
  services/
    warehouse-layout-scene.service.ts
  schemas/
    warehouse-layout-scene.schema.ts
  types/
    warehouse-layout-scene.types.ts
  utils/
    layout-grid.ts
    layout-selection.ts
    layout-scene-mapper.ts
```

The page orchestrator owns React Query, mutation callbacks, route navigation, dirty state, and save/error toasts. The canvas and visual components receive typed scene data plus callbacks and do not call APIs directly.

### 7.3 Client state boundaries

| State                                       | Owner                                         |
| ------------------------------------------- | --------------------------------------------- |
| Persisted scene                             | React Query                                   |
| Local unsaved scene draft                   | feature-local reducer or Zustand editor store |
| Selection, tool, zoom, pan, grid visibility | feature-local reducer or Zustand editor store |
| Undo/redo history                           | feature-local editor state only               |
| Form validation in inspector                | React Hook Form plus Zod                      |

Use a reducer or dedicated editor store for scene commands. Pointer movement must not write through React Query or trigger a server refetch.

## 8. Workspace UX and Layout

### 8.1 Desktop

The designer is a full operational workspace under the warehouse workspace shell. It uses tonal surfaces, borders, 4-8px radii, semantic Fresh Logistics tokens, and no marketing hero treatment.

```text
Warehouse header and tabs
Designer toolbar: select | undo | redo | grid | zoom | fit | save

Toolbox          Canvas                                            Inspector
fixed narrow     pan and zoom surface                               conditional panel
scrollable       grid and visual entities                           320px, resizable
```

- The canvas is the visual focus. It must not be placed inside a decorative card.
- Desktop toolbox and inspector are resizable panels using the existing `ResizablePanelGroup` primitive.
- Icon-only controls have accessible labels and tooltips.
- The save command is icon plus text because it is a consequential operation.
- Zoom controls use fixed dimensions so labels and icons cannot shift layout.

### 8.2 Conditional Properties panel

The inspector is hidden when no object is selected. It opens only after a selectable object is clicked or focused.

| Selection  | Inspector content                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------- |
| None       | Inspector closed. Canvas settings are available from the toolbar.                                 |
| Zone       | Code/name summary, geometry, rotation if enabled, status, visual properties allowed by the model. |
| Rack       | Code/name summary, parent zone, geometry, rotation if enabled, status, rack configuration link.   |
| Slot       | Operational read-only details in the first release.                                               |
| Decoration | Label, type, geometry, rotation, z-index, color token if applicable.                              |

Clicking empty canvas or pressing Escape clears selection and closes the inspector. Selection receives a visible outline and is not conveyed by color alone.

### 8.3 Mobile and tablet

- Default to View and Inspect mode, with pan, pinch zoom, select, and clear selection.
- The inspector becomes a bottom `Drawer`, opened only after selection.
- Geometry editing uses numeric fields and grid-step nudge actions. Small resize/rotation handles are not the primary mobile interaction.
- Tool creation opens a bottom sheet or modal form, then places the new object at a sensible visible grid location.
- The full three-pane desktop composition starts at `lg` or wider. Mobile must never horizontally scroll the document.

## 9. Canvas Behavior

### 9.1 Tools

| Tool            | First release behavior                                                    |
| --------------- | ------------------------------------------------------------------------- |
| Select          | Select, drag, resize, rotate allowed object types                         |
| Pan             | Drag empty canvas to move viewport                                        |
| Zone            | Opens domain create flow, then creates and places the Zone                |
| Rack            | Requires selected Zone or a zone choice, then creates and places the Rack |
| Door/Aisle/Area | Creates a `WarehouseLayoutDecoration` draft                               |

### 9.2 Layering and scale

1. Canvas background and optional grid.
2. Zone boundaries and labels.
3. Racks with identifier and occupancy summary.
4. Decorations such as aisle, door, receiving, and packing areas.
5. Selected outline, resize handles, and rotation handle.

At normal zoom, a Rack shows its code and operational status. Slot tiles render only after zooming in or selecting the Rack. This avoids rendering hundreds of small DOM or canvas details at all scales.

### 9.3 Destructive actions

- Delete removes only a new or existing decoration in the first release.
- Delete never removes Zone, Rack, or Slot business data through the canvas shortcut.
- Business deletion requires a separate future endpoint, explicit confirmation, and domain validation for inventory and dependencies.

## 10. Validation and Accessibility

- Geometry must remain inside canvas bounds and comply with minimum dimensions and grid size.
- Validation requiring tenant, warehouse, or business checks belongs in ASP.NET Core command handlers.
- The frontend uses Zod and React Hook Form for inspector form validation.
- Canvas selection must have keyboard access. Provide a list/outline fallback for navigating selectable entities.
- All toolbar and toolbox buttons have names, tooltips, visible focus, and disabled states where relevant.
- Undo, redo, save, conflict, validation, loading, empty, and error states are explicit.
- Motion is limited to feedback and state transitions. It honors reduced-motion preferences.

## 11. Delivery Phases

### Phase 0 - Contract and UX validation

- Approve this specification and scene contract.
- Define permissions, geometry rules, default canvas size, grid size, and conflict policy.
- Create desktop and mobile interaction prototypes before implementation.

### Phase 1 - Core scene persistence

- Add canvas settings and decoration backend entities, migrations, DTOs, validators, handlers, and scene endpoints.
- Extend Zone/Rack scene DTOs with existing geometry.
- Add unit and integration tests for tenant isolation, permissions, and optimistic version conflict.

### Phase 2 - Desktop designer MVP

- Add `react-konva` and isolated client canvas component.
- Implement select, drag, resize, rotate, pan, zoom, grid, snap, fit, local dirty state, undo/redo, and batch save.
- Implement conditional inspector, toolbox, and accessible toolbar.
- Support existing Zone/Rack placement and non-business decorations.

### Phase 3 - Mobile designer and rack structure

- Add touch-aware View/Inspect/Edit behavior with bottom drawer.
- Define Rack levels/columns, slot generation, and code convention in backend domain workflows.
- Render selected Rack slots at appropriate zoom and link Slot inspector details.

### Phase 4 - Operational visualization

- Add occupancy and capacity overlays from real inventory data.
- Add deep links from put-away recommendation to focused Zone/Rack/Slot.
- Add optional heatmap and pick-route visualization only after the underlying services exist.

## 12. Backend Branch Convention

### 12.1 Observed backend convention

The backend repository uses the `feat/` prefix for feature work. Task-oriented branches have used both `feat/wms-...` and `feat/WMS-...`; newer remote branches predominantly use lowercase descriptive names, for example `feat/wms-02-subscription-billing-completion` and `feat/wms-37-product-api-rule-alignment`.

### 12.2 Branch to create

This designer extends the same WMS-85 through WMS-89 warehouse structure scope as the frontend branch. Create the backend branch from the latest remote development branch with the same exact name:

```text
feat/wms-85-89-warehouse-structure
```

Base it on `origin/dev`, not on a frontend feature branch or the existing WMS-85/WMS-86 backend implementation commit.

The name may exist independently in both repositories. It makes linked frontend and backend pull requests easy to identify. When this work later needs a separately tracked Jira task, use this task-oriented format for a follow-up branch:

```text
feat/wms-<jira-id>-warehouse-layout-designer-api
```

Keep all words lowercase and use hyphens between terms.

## 13. Test and Acceptance Criteria

### Automated tests

- Scene mapper preserves `entityId`, geometry, and decoration type.
- Grid snap and min/max geometry helpers are pure and covered by unit tests.
- Undo/redo restores draft state without mutating React Query data.
- Save sends one batch request, invalidates the scene query on success, and shows inline conflict/error states.
- Role tests allow `warehouses:configure-layout` only to authorized actors.
- Component tests cover no selection, Zone selection, Rack selection, Decoration selection, pending save, validation failure, and conflict.

### Browser QA

- Desktop: 1366x768 and 1280x900 in light and dark mode.
- Tablet: 768x1024.
- Mobile: 390x844 and 360x800 with no document-level horizontal overflow.
- Mouse, keyboard, touch, reduced-motion, and focus-visible behavior.
- Tenant Owner and Warehouse Manager can edit when permission is assigned; Warehouse Staff has view/inspect only.

### Completion criteria

- No business entity is duplicated solely for visual geometry.
- Existing WMS-86 explorer behavior continues to work unchanged.
- All save, conflict, loading, error, empty, and authorization states are implemented.
- `pnpm lint`, `pnpm test`, `pnpm build`, backend test suite, and `git diff --check` pass.

## 14. Risks and Mitigations

| Risk                                         | Mitigation                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| Visual canvas diverges from business records | Use real entity IDs and existing geometry fields as the source of truth. |
| Save conflicts between users                 | Use scene version and return a clear `409 Conflict`.                     |
| Too many slots reduce rendering performance  | Render aggregate racks first and reveal slot detail by zoom/selection.   |
| Mobile transform handles are hard to use     | Use View/Inspect default and numeric grid-step edits in a Drawer.        |
| Delete shortcut removes operational data     | Restrict canvas Delete to decorations in MVP.                            |
| Scope expands into inventory algorithms      | Keep FIFO/FEFO and smart put-away in backend services, not canvas code.  |

## 15. Progress Tracker

Legend: `[ ]` not started, `[~]` in progress, `[x]` completed, `[!]` blocked or requires coordination.

- [x] Inspect existing frontend and backend warehouse layout architecture.
- [x] Confirm that Zone, Rack, and Slot already persist basic geometry.
- [x] Define conditional Properties panel interaction.
- [x] Write this design specification.
- [x] Inspect backend branch naming and record the planned API branch.
- [x] Approve the scene data contract with backend owner.
- [x] Create implementation plan and task breakdown.
- [x] Implement Phase 1 backend scene persistence.
- [x] Implement Phase 2 desktop designer.
- [~] Implement Phase 3 mobile and rack structure workflows.
- [ ] Implement Phase 4 operational overlays.

### 15.1 Implementation work log - 2026-08-11

Backend Phase 1 was completed on `feat/wms-85-89-warehouse-structure` in commit
`1fac719 feat(warehouse): add layout designer scene API`:

- Added versioned scene GET/PUT endpoints, canvas settings, decorations, Zone/Rack geometry,
  validation, optimistic conflict handling, migration, and relational tests.

Frontend Phase 2 was implemented on the matching branch:

- Added `/warehouses/{warehouseId}/layout/designer` as a distinct workspace mode without
  changing the WMS-86 explorer.
- Added `react-konva` and `konva` as an isolated client bundle.
- Added select, drag, resize, rotate, grid, snap, pan, wheel/pinch zoom, fit, undo, redo,
  local dirty state, `beforeunload` protection, and one explicit batch save.
- Added conditional Properties, canvas settings, a keyboard-accessible object outline, Slot
  read-only inspection, Zone/Rack domain creation flows, and decoration create/duplicate/delete.
- Added read-only behavior for unauthorized or inactive warehouses and explicit `409 Conflict`
  reload handling.
- Added responsive behavior below `lg`: compact canvas toolbar, toolbox Drawer, Properties
  Drawer, numeric geometry editing, and grid-step nudge actions. Rack levels/columns and Slot
  generation remain unimplemented because their backend domain contract belongs to the rest of
  Phase 3.

Verification completed:

- `pnpm test`: 54 files and 155 tests passed.
- `pnpm lint`: passed with no warnings.
- `pnpm build`: passed; the designer route is included in the production route manifest.
- `git diff --check`: passed.
- Authenticated Tenant Owner smoke: login `200`, warehouse list `200`, scene GET `200`; scene
  version 2 returned 1 Zone, 1 Rack, 1 Slot, and a `2000 x 1200` canvas.
- Browser screenshot QA remains blocked by the Browser runtime `os error 3`. No desktop/mobile
  screenshot completion is claimed; automated responsive/component tests and authenticated API
  smoke are the current evidence.

### 15.2 Review remediation - 2026-08-11

The backend and frontend review findings were remediated before commit:

- Inactive Zone/Rack geometry no longer blocks unrelated scene saves. The API accepts unchanged
  inactive geometry but still rejects repositioning, while the frontend omits inactive objects
  from the update batch and keeps them inspectable but read-only.
- Canvas constraints now account for snapped dimensions and rotated bounds on both FE and BE.
- Unsaved drafts survive successful Zone/Rack creation and server structure refetches. The editor
  keeps its original base version so an external scene update still produces an intentional
  conflict instead of silently overwriting newer data.
- Warehouse workspace navigation asks for confirmation before discarding a dirty designer draft.
- `/api/auth/me` now returns effective permissions; the designer combines the assigned
  `warehouses:configure-layout` permission with warehouse role/access constraints.
- Database constraint failures are no longer all presented as stale-version conflicts, decoration
  duplication respects the label limit, and reviewed shadcn composition issues were corrected.

Verification after remediation:

- `dotnet test Application.Tests/Application.Tests.csproj`: 36 tests passed.
- `dotnet build API/API.csproj --no-restore` with an isolated output directory: passed with the
  three existing unused-mapper warnings and no errors.
- `pnpm test`: 54 files and 162 tests passed.
- `pnpm lint` and `pnpm build`: passed with no lint warnings or build errors.

### 15.3 Canvas render and Properties remediation - 2026-08-11

- Fixed the blank designer canvas caused by the initial palette placeholder mounting without the
  measured container ref. The canvas container now exists from the first render, is measured
  immediately, and remains observed while resizable panels change its dimensions.
- Added a shared accessible close action to Properties on desktop and mobile. Closing Properties
  preserves the selected object and expands the canvas; selecting the object again reopens the
  panel, while Escape or clicking the canvas background still clears selection.
- Added direct canvas lifecycle coverage so the Konva Stage and scene objects cannot silently stay
  at a `0 x 0` render size after a hard reload.

Verification after canvas remediation:

- `pnpm test`: 55 files and 165 tests passed.
- `pnpm lint`: passed with no warnings.
- `pnpm build`: passed; the designer route remains in the production route manifest.
- Prettier and `git diff --check`: passed.
- Browser screenshot QA remains blocked by the Browser runtime `os error 3`; no visual QA
  completion is claimed.

### 15.4 Visual symbols and canvas interaction - 2026-08-11

- Replaced the functional-area text list with a compact accessible icon toolbox using the
  existing Lucide icon set, labels, tooltips, and permission-disabled states.
- Added scalable canvas symbols for Door, Aisle, Receiving, Packing, Picking, Damaged, Office,
  and Other decorations while retaining concise labels when the object is large enough.
- Expanded Rack visualization to show Slot tiles whenever their available geometry remains
  legible. Vacant, occupied, reserved, inactive, and selected Slots now use distinct semantic
  surfaces, and the canvas includes a compact status legend.
- Added temporary pan behavior: holding Control switches the effective canvas tool to Pan and
  releasing it always returns to Select. This prevents accidental object movement while
  navigating a large floor plan.

Verification after visual interaction update:

- `pnpm test`: 55 files and 167 tests passed.
- `pnpm lint`, `pnpm build`, Prettier, and `git diff --check`: passed.

### 15.5 Viewport stability remediation - 2026-08-11

- Object `dragEnd` events no longer bubble into the Stage pan handler. The Stage also verifies that
  it is the actual drag target before updating viewport coordinates, preventing an object's
  geometry from being mistaken for the canvas position.
- Resizing the canvas panel when Properties opens or closes now preserves the same world-space
  center instead of visually shifting the floor plan toward a corner.
- Added regression coverage for object drag isolation and viewport preservation across container
  resize events.

Verification after viewport remediation:

- `pnpm test`: 55 files and 169 tests passed.
- `pnpm build`, Prettier, and `git diff --check`: passed.

### 15.6 Component color customization - 2026-08-11

- Added optional persisted layout colors for active Zones, Racks, and functional-area decorations.
  The backend validates the `#RRGGBB` wire format, normalizes values to uppercase, and stores the
  values in nullable `nvarchar(7)` columns introduced by migration
  `20260811063853_AddWarehouseLayoutColors`.
- Added an accessible Properties color control with curated swatches, a native custom color
  picker, selected-state feedback, and a reset-to-default action. Read-only and inactive objects
  keep the control disabled.
- Color changes participate in the existing scene history, undo/redo, dirty-state, conflict, and
  batch-save workflows. Server reconciliation preserves unsaved Zone/Rack color edits.
- Zone, Rack, and decoration fills update immediately on the Konva canvas. Labels and symbols
  choose the more readable theme foreground/background color by contrast. Slot fills remain
  semantic and continue to represent vacant, occupied, reserved, inactive, and selected states.
- Older scene responses without `color` remain compatible and map to the existing default visual
  tokens.

Verification after color customization:

- Backend warehouse scene tests: 6 passed; all Application tests: 37 passed.
- Backend API build and EF pending-model check: passed with no pending model changes.
- Authenticated Tenant Owner smoke: login, warehouse list, and scene GET returned `200`; the
  response exposes the optional color fields after the migration was applied locally.
- Frontend `pnpm test`: 55 files and 172 tests passed.
- Frontend `pnpm lint` and `pnpm build`: passed.
- Browser screenshot QA remains blocked by the Browser runtime `os error 3`; no visual QA
  completion is claimed.

### 15.7 Dynamic grid and Rack quick actions - 2026-08-11

- Reinterpreted the configured canvas width and height as the minimum floor-plan bounds. Zone,
  Rack, and functional-area geometry may now use negative coordinates or extend beyond the base
  right/bottom edges without being clamped back into the configured canvas.
- Added rotated effective-bounds calculation with grid-aligned padding on all four sides. The
  canvas background, visible grid segment, deselection surface, and Fit action use these derived
  bounds and automatically shrink to the configured minimum when objects return inside it.
- Drag and transform previews update effective bounds through one animation-frame-throttled
  transient geometry value. Only drag/transform completion writes scene history, and viewport
  coordinates remain independent from dynamic bound changes.
- Backend scene validation now accepts negative and outside-base coordinates while limiting the
  combined rotated extent of the base canvas and every object to `MaxCanvasSize`. Existing size,
  rotation, z-index, authorization, versioning, DTO, endpoint, and persistence contracts remain
  unchanged; no migration was added for dynamic bounds.
- Added Rack name editing in Properties using the existing update endpoint while preserving the
  Rack code. Added safe deactivation from Properties and the `Delete`/`Backspace` keys through the
  existing deactivate endpoint and shared confirmation dialog.
- Deactivation never hard-deletes a Rack. Backend inventory/reservation rejection remains visible
  in the open dialog while preserving selection. Successful deactivation clears selection and
  removes the Rack from the active canvas; inactive Racks remain inspectable as read-only entries
  in the object list.
- View-only users, inactive warehouses, inactive Rack/Zone objects, and users without
  `warehouses:configure-layout` do not receive rename or deactivate controls.

Verification after dynamic-grid and Rack-action update:

- Backend `dotnet test SSWMS-API.slnx --no-restore`: 38 tests passed.
- Backend `dotnet build SSWMS-API.slnx --no-restore`: passed with 0 warnings and 0 errors after
  stopping the running API process that held the output DLLs.
- EF pending-model verification could not run because `dotnet-ef` is not installed in the local
  environment. The dynamic-grid change contains no entity/configuration/snapshot/migration edits.
- Frontend `pnpm test`: 55 files and 180 tests passed.
- Frontend `pnpm lint` and `pnpm build`: passed; the production manifest includes the designer
  route.
- Backend runtime smoke: port `7070` listened successfully and Swagger returned `200` using the
  newly built API binary.
- Browser desktop/mobile/light/dark screenshot QA remains blocked during browser connection by
  runtime `os error 3`; no screenshot QA completion is claimed.

### 15.8 Hierarchical bounded scene outline - 2026-08-11

- Split the toolbox into a fixed creation area and a dedicated scene-outline region so a large
  object collection no longer lengthens the sidebar or makes the whole page feel like one long
  list.
- The “Danh sách sơ đồ” heading and object count remain visible while only the outline items use
  the remaining height and scroll independently. The same structure is reused inside the mobile
  toolbox Drawer.
- Selecting an object from the canvas or another control automatically scrolls its outline item
  to the nearest visible position without moving the page or canvas viewport.
- Replaced the flat outline with a collapsible `Zone -> Rack -> Slot` hierarchy. Multiple branches
  may stay open, while the complete ancestor path of the selected canvas object opens
  automatically and a fixed-header action collapses all manually expanded branches.
- Functional decorations use a separate collapsible group because their persisted scene contract
  has no Zone relationship. Rack/Slot records with missing parents remain discoverable in a
  dedicated “Chưa phân loại” group, and inactive Racks retain their read-only status treatment.
- Child nodes are only mounted while their parent branch is open, reducing visual and DOM length
  for warehouses with many Racks or Slots. Added coverage for hierarchy, selection expansion,
  multi-branch state, collapse-all, inactive/orphan records, and a 120-Rack bounded outline.

Verification after hierarchical outline update:

- Focused toolbox/workspace tests: 20 passed; full `pnpm test`: 56 files and 185 tests passed.
- `pnpm lint`, `pnpm build`, Prettier, and `git diff --check`: passed.
- Browser desktop/mobile screenshot QA remains blocked during connection by runtime `os error 3`;
  no screenshot QA completion is claimed.
