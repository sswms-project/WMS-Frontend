# WMS-52 Tenant Subscription Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port tenant-facing subscription, billing history, invoice download, and public dynamic pricing into the WMS-52 branch based on `dev`.

**Architecture:** Keep server state in the subscription feature's React Query hooks and use the existing Axios client. App Router pages remain thin; the existing sidebar configuration and proxy permission map provide navigation and TenantOwner protection without replacing the current private shell.

**Tech Stack:** Next.js App Router, React, TypeScript, TanStack Query, Axios, Tailwind CSS v4, shadcn/ui, pnpm.

## Global Constraints

- Use `feat/wms-52-tenant-subscription-billing` based on `dev`; do not stage existing `.gitignore`, `AGENTS.md`, `CLAUDE.md`, or `.claude/` changes.
- Reuse shadcn/ui primitives and Tailwind semantic tokens; route `page.tsx` files remain thin.
- Run GitNexus impact before modifying existing symbols and `gitnexus_detect_changes` before committing.
- No automated frontend test runner is configured; verify with `pnpm lint`, `pnpm build`, and HTTP route checks.

---

### Task 1: Add Subscription Contracts And Protected Routing

**Files:**

- Create: `src/features/subscription/types/subscription.types.ts`, `src/features/subscription/services/subscription.service.ts`, `src/features/subscription/hooks/use-subscription.ts`, `src/app/(private)/subscription/page.tsx`
- Modify: `src/routes/app-routes.ts`, `src/routes/api-endpoints.ts`, `src/lib/query-keys.ts`, `src/config/route-permissions.ts`, `src/components/layout/nav-config.ts`, `src/proxy.ts`

- [ ] Add typed API contracts and React Query hooks for subscription, plans, payments, and invoice blobs.
- [ ] Add `/subscription` to route constants and restrict it to `TenantOwner` in the existing permission map.
- [ ] Add the TenantOwner sidebar item through `NAV_CONFIG`; do not modify the private layout shell.
- [ ] Add `/pricing` to public proxy paths.
- [ ] Run `pnpm lint` after the routing contract is integrated.

### Task 2: Add Tenant Subscription Page

**Files:**

- Create: `src/features/subscription/components/SubscriptionPage/*`, `src/features/subscription/pages/SubscriptionPage.tsx`, `src/features/subscription/pages/index.ts`, `src/features/subscription/utils/format-subscription.ts`

- [ ] Port the page orchestrator and UI-only components for current plan, plan changes, renew/cancel confirmation, payment history, empty/error/loading states, and PDF download.
- [ ] Keep action state, query state, and Sonner errors in the page/hooks; UI components receive callbacks through props.
- [ ] Run `pnpm lint` and `pnpm build`.

### Task 3: Add Public Dynamic Pricing

**Files:**

- Create: `src/features/home/*`, `src/app/(public)/pricing/page.tsx`
- Modify: `src/routes/app-routes.ts`, `src/proxy.ts`

- [ ] Port public home composition and use `GET /public/subscription-plans` through the subscription query hook.
- [ ] Provide loading, retryable error, and empty states and preserve the public `/pricing` route.
- [ ] Run `pnpm lint` and `pnpm build`.

### Task 4: Verify And Prepare Selective Commit

**Files:**

- Modify: only WMS-52 files from Tasks 1-3

- [ ] Confirm `src/app/(private)/subscription/page.tsx` exists and `http://localhost:3000/subscription` resolves when authenticated as TenantOwner.
- [ ] Run `pnpm lint`, `pnpm build`, and GitNexus `detect_changes`.
- [ ] Stage only WMS-52 source and documentation files; leave pre-existing dirty files unstaged.
