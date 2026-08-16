# Homepage Feature

Role-based operations dashboards for the SSWMS system, each on its own route.

## Routes

| Role              | Route                |
| ----------------- | -------------------- |
| Tenant Owner      | `/dashboard/tenant`  |
| Warehouse Manager | `/dashboard/manager` |
| Warehouse Staff   | `/dashboard/staff`   |
| System Admin      | `/admin/roles`       |

`/dashboard` itself renders `DashboardRedirect`, which reads the logged-in user's role and replaces the URL with the route above. Each role route is wrapped in `RoleGuard`, which redirects a user to their own dashboard if they land on a route that doesn't match their role. `RoleGuard` is a UI convenience only — the real enforcement is server-side in `src/proxy.ts`, which decodes the role from the `access_token` cookie and checks it against `src/config/route-permissions.ts` before the page is served (mismatches are redirected to `/unauthorized`).

## Structure

```
src/features/homepage/
  ├── pages/
  │   ├── DashboardRedirect.tsx           # /dashboard entry: redirects by role
  │   ├── TenantOwnerDashboardPage.tsx    # RoleGuard + TenantOwnerDashboard
  │   ├── WarehouseManagerDashboardPage.tsx
  │   ├── WarehouseStaffDashboardPage.tsx
  │   └── index.ts
  ├── components/
  │   ├── TenantOwnerDashboardPage/
  │   │   ├── TenantOwnerDashboard.tsx    # Multi-warehouse view + warehouse filter
  │   │   ├── WarehouseCapacitySection.tsx # Capacity cards + warehouse filter section
  │   │   ├── WarehouseFilter.tsx         # Tenant-only warehouse selector
  │   │   └── WarehouseRevenueDonutChart.tsx
  │   ├── WarehouseManagerDashboardPage/
  │   │   ├── WarehouseManagerDashboard.tsx # Single-warehouse operational view
  │   │   └── RevenueTargetDonutChart.tsx
  │   ├── WarehouseStaffDashboardPage/
  │   │   ├── WarehouseStaffDashboard.tsx # Task-only view, no business figures
  │   │   └── StaffTaskTable.tsx
  │   ├── RoleGuard.tsx                   # Client-side blocks/redirects mismatched roles
  │   ├── DashboardHeader.tsx             # Shared title/description/actions header
  │   ├── MetricCard.tsx
  │   ├── MetricCardGrid.tsx              # Shared staggered KPI card grid
  │   ├── LogisticsFluxChart.tsx
  │   ├── RevenueDonutChart.tsx           # Shared donut base for revenue charts
  │   ├── RecentOperationsTable.tsx
  │   ├── AlertCard.tsx
  │   ├── LowStockTable.tsx
  │   ├── QuickActionsBar.tsx
  │   ├── WarehouseStatsCard.tsx
  │   ├── DateRangeFilter.tsx
  │   └── FadeIn.tsx                      # Shared entrance-animation wrapper (framer-motion)
  ├── types/index.ts
  ├── utils/
  │   ├── sample-data.ts
  │   └── role-routes.ts                  # role -> dashboard route mapping
  └── README.md
```

The shared `NotificationBell` (bell icon with unread badge, shown for all roles) lives in `src/components/NotificationBell.tsx` since it's mounted in the app-level private layout header, not a homepage-specific screen.

## Role Differences

### Tenant Owner (`/dashboard/tenant`)

Company-wide view: Total Products, Total Inventory, Pending Orders, Daily Revenue. Includes a warehouse filter (`WarehouseFilter`) to scope the "Warehouse Capacity" section to a single facility or all of them. Shows the AI Logistics Flux chart, recent operations, low-stock table, and per-warehouse capacity cards.

### Warehouse Manager (`/dashboard/manager`)

Same layout shape as Tenant Owner but scoped to a single warehouse — no cross-warehouse aggregation, no filter. Shows a revenue-vs-target bubble chart for its own warehouse instead of the Tenant's per-warehouse breakdown.

### Warehouse Staff (`/dashboard/staff`)

Deliberately excludes company/business statistics (no revenue, no inventory value, no multi-warehouse data). Shows only task-focused metrics (Tasks Assigned Today, Tasks Completed, Pending Tasks, My Accuracy), a "Next Task" alert, quick actions (Start Next Task, Scan Item, Report Issue, My Schedule), and `StaffTaskTable` listing their own assigned tasks.

## Data Types (`types/index.ts`)

- `DashboardMetric` — label/value/change for KPI cards
- `WarehouseStats` — capacity, orders, staff count per warehouse
- `QuickAction` — quick-action button (label, icon, href)
- `StaffTask` — a staff member's assigned task (type, sku, location, status)
- `AppNotification` — bell dropdown notification (title, description, read state)

## Sample Data (`utils/sample-data.ts`)

All dashboards currently render hardcoded sample data — metrics, chart data, recent operations, low-stock items, staff tasks, and notifications. Replace with React Query hooks when the backend endpoints exist; keep the same shapes so components don't need to change.

## Animation

- `FadeIn` (framer-motion) staggers each dashboard's sections into view on mount — used by `TenantOwnerDashboard`, `WarehouseManagerDashboard`, and `WarehouseStaffDashboard`.
- `PageTransition` (`src/components/PageTransition.tsx`) fades between routes inside the private layout, so switching between dashboard/warehouses/inventory/orders/delivery feels smooth.
- `MetricCard` and `WarehouseStatsCard` get a subtle ring highlight on hover; table rows use `transition-colors` on hover.
- `NotificationBell`'s unread badge has a ping pulse to draw attention.
- `tw-animate-css` is imported in `src/app/index.css`, which activates the `animate-in`/`data-[state=...]` open/close transitions already wired into the shadcn/ui primitives (dropdown, select, dialog, popover, etc.) across the whole app.
