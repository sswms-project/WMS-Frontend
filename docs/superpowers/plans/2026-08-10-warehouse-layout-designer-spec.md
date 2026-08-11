# Warehouse Layout Designer - Design Specification

## 1. Document Control

| Item                   | Value                                                               |
| ---------------------- | ------------------------------------------------------------------- |
| Scope                  | 2D warehouse layout designer for the Warehouse Management workspace |
| Frontend repository    | `SSWMS-Frontend`                                                    |
| Backend repository     | `SSWMS-Backend`                                                     |
| Existing related work  | WMS-85 and WMS-86 warehouse workspace and layout explorer           |
| Planned backend branch | `feat/wms-85-89-warehouse-structure` from current `origin/dev`      |
| Status                 | Proposed. No implementation in this specification.                  |
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
- [ ] Approve the scene data contract with backend owner.
- [ ] Create implementation plan and task breakdown.
- [ ] Implement Phase 1 backend scene persistence.
- [ ] Implement Phase 2 desktop designer.
- [ ] Implement Phase 3 mobile and rack structure workflows.
- [ ] Implement Phase 4 operational overlays.
