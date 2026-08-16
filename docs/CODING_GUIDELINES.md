# Coding Guidelines

This document defines how SSWMS Frontend code should be structured, split, reused, and kept maintainable.

## Core Principles

- Prefer simple, readable code over clever abstractions.
- Build real product behavior, not static UI that only looks correct.
- Reuse existing code before creating new files, components, hooks, or helpers.
- Keep related behavior close to its feature, and promote code to shared folders only when it is truly reused.
- Do not duplicate business logic, validation rules, API calls, UI primitives, or formatting helpers.
- Create abstractions only when they remove meaningful duplication or make behavior easier to understand.

## Feature Structure

Feature code should live under `src/features/<feature>/`.

Use these folders when a feature grows:

```text
src/features/<feature>/
  components/  # Feature-specific UI composition
  hooks/       # Feature-specific React hooks and React Query hooks
  services/    # API wrappers and service functions
  schemas/     # Zod schemas
  types/       # Feature-specific TypeScript types
  utils/       # Pure feature-only helper functions
```

Shared app-level code belongs outside feature folders:

```text
src/components/ui/  # Shared UI primitives
src/components/     # Shared app components composed from primitives
src/hooks/          # Shared hooks used by multiple features
src/lib/            # Shared clients, utilities, and infrastructure
src/types/          # Shared API and domain types
src/stores/         # Shared Zustand stores
```

Do not create a shared folder just because code might be reused later. Start inside the feature, then promote after a second real use case appears.

## Components

- Keep components focused on one responsibility.
- Split large components when they contain multiple independent sections, repeated UI blocks, or complex conditional states.
- Prefer small named components over long inline JSX blocks.
- Put screen-specific components in `src/features/<feature>/components/`.
- Put reusable visual primitives in `src/components/ui/` only when they are generic enough for multiple features.
- Do not duplicate existing primitives such as buttons, inputs, cards, dialogs, tables, badges, dropdowns, tooltips, or form fields.
- Components should receive data and callbacks through props. They should not fetch data unless they are the feature container responsible for that behavior.
- Visual-only components should not contain API calls, mutation logic, or business rules.

Good split:

```text
RegisterPage
  RegisterForm
  RegisterSuccessState
  RegisterField
```

Avoid:

```text
One 500-line component that handles layout, API calls, validation, field rendering, and every success/error state inline.
```

## UI Primitive Rules

- Use existing shadcn/ui primitives from `src/components/ui` before creating custom UI.
- If a required shadcn/ui primitive is missing from `src/components/ui`, add it with the shadcn CLI before hand-coding a replacement:

```bash
pnpm dlx shadcn@latest add <component-name>
```

- Do not recreate Button, Input, Textarea, Checkbox, Select, Combobox, Card, Alert, Dialog, Sheet, Drawer, Popover, Tooltip, Tabs, Badge, Table, DataTable, Pagination, Calendar, or Form primitives with raw HTML.
- Do not create custom component primitives just because a screen design looks slightly different. Extend the existing primitive with props, variants, composition, or feature-level wrappers first.
- Avoid div-only interactions. Use semantic HTML or accessible shadcn/ui components.
- Use `<button>` for actions, `Link` or `<a>` for navigation, real form controls for inputs, and table elements or `DataTable` for tabular data.
- Use `div` for layout and grouping only. Do not use `div` as a fake button, fake input, fake select, fake tab, fake checkbox, fake link, or clickable table row.
- If an existing shadcn/ui primitive cannot support the required behavior, document the gap in the feature code and keep the new component narrowly scoped.

## Hooks

- Use hooks to reuse stateful behavior, browser behavior, or feature workflows.
- React Query hooks should wrap server reads and mutations.
- Client-only UI state can use local React state or Zustand when shared across distant components.
- Do not store server data in Zustand. Use TanStack React Query.
- Name hooks with `use...`, for example `useVerifyEmailQuery` or `useRegisterMutation`.
- Keep hooks independent from visual layout. A hook should return data, state, and actions, not JSX.

Create a hook when:

- The same stateful logic is needed in more than one component.
- A component becomes hard to read because of non-visual logic.
- A workflow combines API state, derived state, and actions.

Do not create a hook when:

- Logic is only a simple local variable.
- The hook would hide behavior without reducing complexity.

## Services And API

- Keep API calls in service functions or feature API files, not inside JSX event handlers.
- Use the shared Axios client from `src/lib/axios.ts`.
- Return unwrapped response data from API helpers.
- Let React Query handle loading, error, success, retry, and cache state.
- Use typed request and response DTOs.
- Reuse existing query keys and API hooks before creating new ones.
- Keep endpoint paths and payload names aligned with backend contracts.

API write flow:

```text
Zod schema -> form values -> typed DTO -> service function -> React Query mutation -> UI state
```

API read flow:

```text
typed query params -> service function -> React Query query -> loading/error/empty/success UI
```

## Utilities And Helpers

- Put pure reusable helpers in `src/lib/` when they are shared across features.
- Put feature-only helpers in `src/features/<feature>/utils/`.
- Keep helpers pure when possible: same input should return the same output.
- Avoid helpers that depend on component state, DOM, or API clients unless that is their explicit purpose.
- Name helpers by behavior, not by implementation detail.

Good examples:

```text
formatCurrency
formatDateTime
buildWarehouseQueryParams
getApiErrorMessage
normalizeEmail
```

Avoid:

```text
handleData
processStuff
commonFunction
utils
```

## Forms And Validation

- Use React Hook Form for form state.
- Use Zod schemas as the source of truth for validation.
- Infer form types from Zod with `z.infer`.
- Keep validation messages near the fields that caused them.
- Do not duplicate the same validation rules in multiple places.
- Extract repeated field composition when a form has multiple fields with the same label, input, and error pattern.
- Disable submit actions while a mutation is pending to prevent duplicate submissions.

## Tailwind And Design Tokens

- Before styling UI, read `src/app/index.css` to understand the available CSS variables and Tailwind theme tokens.
- Use Tailwind CSS utility classes for layout, spacing, typography, color, border, radius, focus, and responsive behavior.
- Prefer semantic Tailwind token classes such as `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-primary-foreground`, `text-muted-foreground`, `ring-ring`, and `text-destructive` when those tokens exist.
- Do not hard-code hex, RGB, HSL, OKLCH, or named color values inside component class names when the color belongs to the design system.
- If a design-system color is needed but no Tailwind token exists yet, add a semantic token in `src/app/index.css` first, then use that token from the component.
- Do not scatter one-off arbitrary color classes such as `bg-[#2e5a2a]`, `text-[#18232f]`, or `border-[#b5d8ab]` across feature code.
- Raw color values are allowed only for truly one-off visuals, and the reason must be obvious from the context.

Avoid:

```tsx
className = 'bg-[#2e5a2a] text-[#18232f] border-[#b5d8ab]'
```

Prefer:

```tsx
className = 'bg-primary text-primary-foreground border-border'
```

## Reuse Rules

Before creating new code, check in this order:

1. Existing feature component, hook, schema, service, or type.
2. Existing shared component in `src/components/ui`.
3. Existing shared utility in `src/lib`.
4. Existing app-level hook in `src/hooks`.
5. Existing API type in `src/types`.

Reuse does not mean forcing unrelated code together. If two pieces of code look similar but have different business meaning, keep them separate until a real shared abstraction is obvious.

## Clean Code Rules

- Use descriptive names. Avoid abbreviations.
- Keep functions small enough that their purpose is obvious.
- Use early returns for loading, error, empty, and invalid states.
- Prefer derived values during render over unnecessary `useEffect`.
- Do not swallow errors silently.
- Log unexpected errors and show useful user-facing messages.
- Avoid deeply nested conditionals. Extract named helpers or state components.
- Avoid magic strings and numbers. Use constants when values have business meaning.
- Avoid dead buttons, fake filters, placeholder-only forms, and UI controls without handlers.
- Keep comments rare. Explain why something exists, not what the code already says.

## Abstraction Guidelines

Create an abstraction when:

- The same logic is duplicated in at least two real places.
- It reduces component size or improves readability.
- It protects a backend contract, formatting rule, validation rule, or shared UI behavior.
- It matches an existing project pattern.

Do not create an abstraction when:

- It is only used once and does not clarify the code.
- It hides simple logic behind a vague name.
- It forces unrelated features to share the same implementation.
- It makes future changes harder to reason about.

## Review Checklist

Before finishing a feature, verify:

- Existing components, hooks, services, schemas, and utils were reused where appropriate.
- Existing shadcn/ui primitives from `src/components/ui` were used before creating custom UI.
- No div-only controls or fake interactive elements were introduced.
- No duplicated API calls, form validation, or UI primitives were introduced.
- Styling uses Tailwind tokens from `src/app/index.css` instead of hard-coded design-system colors.
- Loading, error, empty, success, and disabled states are handled.
- Components are split by responsibility.
- Business logic is not buried inside visual-only components.
- Types come from source of truth when possible.
- Backend payload names and response shapes match the backend contract.
- The code is understandable without excessive comments.
