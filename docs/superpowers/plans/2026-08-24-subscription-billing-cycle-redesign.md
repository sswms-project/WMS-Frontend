# WMS-52: Subscription Billing Cycle Redesign

## Objective

Redesign the public pricing catalog and Tenant Owner subscription workspace so monthly and yearly billing are explicit, plan cards remain compact, and every action matches the backend billing contract.

## Scope

- Frontend branch: `ui/wms-52-subscription-billing-cycle-redesign`.
- Backend remains on `dev`; no backend branch is required because the current API already returns `monthlyPrice`, `yearlyPrice`, `yearlyDiscountPercent` and accepts `billingCycle` in the upgrade command.
- Keep existing routes, permissions, endpoints, React Query keys, payment filters, invoice download/print, renew and cancel flows.

## Findings

1. Both `/pricing` and `/subscription` always display the monthly price even though the API supports both cycles.
2. `UpgradeSubscriptionRequestDto` only sends `newPlanId`; it is missing the required backend `billingCycle` field.
3. The tenant plan cards render every feature, so card height and page length grow with plan configuration.
4. Large prices use display typography that can dominate or overflow a compact plan card.
5. The current-plan card repeats information across a tall header, metric cards, progress block and footer.
6. Frontend downgrade eligibility is stale. Backend schedules a lower-value plan or cycle for the next renewal instead of rejecting it.
7. Subscription tests still construct the removed legacy plan DTO and currently fail on `dev`.

## Design Direction

Use the Fresh Logistics product design system with `shadcn`, `vercel-react-best-practices` and `web-design-guidelines`:

- Dense B2B composition, tonal borders, semantic tokens and 4-8 px radii.
- A shared monthly/yearly segmented control using `ToggleGroup`, with an accessible label and no empty selection state.
- Compact, equal-height plan cards. Show only the first three benefits and open the complete feature list in an accessible `Dialog`.
- Keep plan names and prices readable for long admin-entered values through stable grid tracks, truncation where appropriate and conservative typography.
- Avoid nested cards, decorative gradients, oversized marketing typography and new dependencies.

## Tenant Subscription Workspace

- Replace the tall current-plan card with a compact health band:
  - plan name and one status badge;
  - price, billing cycle and end date in a single responsive metadata row;
  - a thin remaining-time progress row;
  - renew and cancel actions aligned at the end on desktop and full-width on mobile;
  - expired, cancelled and pending-plan information shown only when relevant.
- Place the billing-cycle toggle in the plan catalog heading.
- Price every candidate plan using the selected cycle:
  - monthly: monthly charge and `/tháng`;
  - yearly: yearly charge and `/năm`, plus monthly equivalent and the API discount percentage when applicable.
- Include the selected cycle in the upgrade payload and confirmation copy.
- Treat the exact current plan plus current cycle as selected. Allow same-plan cycle changes.
- Describe lower-value changes as taking effect at the next renewal, matching backend behavior.
- Keep the payment history layout and behavior unchanged except for spacing needed to align with the compact page composition.

## Public Pricing

- Add the same billing-cycle toggle above the catalog.
- Use a four-column grid when space permits, two columns on tablet and one column on mobile.
- Keep cards equal-height and compact, with three preview features and a full-benefits dialog.
- Preserve the register CTA and existing loading, error and empty states.

## Contract Changes

- Add the `BillingCycle` frontend union: `Monthly | Yearly`.
- Add `billingCycle` to `UpgradeSubscriptionRequestDto`.
- Add `pendingPlanName`, `pendingBillingCycle` and `cancelledAt` to the current subscription response type.
- Derive selected prices and action states from the API response; do not invent discounts or usage values.
- No endpoint, database or backend DTO changes.

## Tests And Validation

- Update stale plan fixtures to the dynamic feature DTO.
- Unit-test monthly/yearly price selection, monthly equivalent, exact-current selection, cycle switching and scheduled lower-value changes.
- Verify the upgrade mutation receives both `newPlanId` and `billingCycle`.
- Test compact feature previews and the full-benefits dialog.
- Test the shared cycle toggle keyboard behavior and its refusal to enter an empty state.
- Run focused subscription tests, full `pnpm test`, `pnpm lint`, `pnpm build`, Prettier check and `git diff --check`.
- Browser QA at `/pricing` and `/subscription` at desktop 1280 px and mobile 390 px in light and dark mode. Confirm no horizontal overflow, overlapping text or unnecessary long card stacks.

## Progress Log

- 2026-08-24: Read FE/BE rules, frontend design guidance and backend subscription contracts.
- 2026-08-24: Confirmed the backend already supports dual billing cycles; no backend branch or API addition is required.
- 2026-08-24: Created frontend branch `ui/wms-52-subscription-billing-cycle-redesign`.
- 2026-08-24: Recorded three pre-existing failing subscription tests caused by legacy plan fixtures on `dev`.
- 2026-08-24: Implemented the shared billing-cycle toggle, compact feature previews, full-benefits dialog, compact tenant health band and cycle-aware upgrade payload.
- 2026-08-24: Updated stale subscription fixtures and added cycle, feature-dialog and upgrade-payload regression coverage. Full test result: 69 files and 220 tests passed.
- 2026-08-24: Production build passed. ESLint passed with zero errors and one existing React Hook Form compiler warning in the admin subscription-plan form.
- 2026-08-24: Browser QA passed for `/pricing` at 1280 px and 390 px with no horizontal overflow, including yearly prices and very long currency values. Authenticated `/subscription` visual QA remains a manual check because the fresh browser session redirects to login.
- 2026-08-25: Redesigned the app sidebar with a wider desktop rail, larger navigation targets, clearer role-aware sections and exact active-route matching.
- 2026-08-25: Added the Tenant Owner `Quản lý dịch vụ` section and moved payment history, invoice download and print into `/subscription/payments` so `/subscription` remains focused and compact.
- 2026-08-25: Verified 69 test files and 224 tests, production build, changed-file Prettier check and `git diff --check`. ESLint remains at zero errors with the existing React Hook Form compiler warning in the admin plan form.
- 2026-08-25: Browser route discovery reached the isolated login page, so authenticated desktop/mobile visual QA remains pending; no credentials were entered during this run.
