<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Before coding, read `.rules` for baseline React rules and `docs/CODING_GUIDELINES.md` for project-specific structure, reuse, shadcn/ui, and clean code rules.

Before implementing UI, read `docs/DESIGN_SYSTEM.md` and follow its visual system.

Before styling UI, read `src/app/index.css` and use Tailwind design tokens instead of hard-coded color values.

Before implementing or refactoring code, read `docs/CODING_GUIDELINES.md` and follow its structure, reuse, clean code, and abstraction rules.

When building UI, use existing shadcn/ui primitives from `src/components/ui` first. Do not invent custom primitives or div-only controls when an accessible component already exists.

If a required shadcn/ui primitive is missing from `src/components/ui`, install it with the shadcn CLI before implementing a custom replacement.

When using Stitch HTML from `docs/stitch-designs/`, treat it as a visual reference and implement the screen as a functional Next.js feature with API integration, state handling, validation, navigation, and working interactions.

When implementing Stitch designs, always reuse existing components from `src/components/ui` before creating new UI primitives.

Before creating branches, commits, merges, or pushes, read `docs/GIT_WORKFLOW.md` and follow the repository Git workflow.

When merging feature branches or PRs, prefer squash merge to keep `main` history clean unless the team explicitly requests preserving individual commits.

Before using frontend design skills or implementing screens from Stitch, read `docs/AI_WORKFLOW.md` and follow its skill selection rules.

## Frontend Agent Skills

Use the applicable skill before implementing or reviewing frontend work:

- `shadcn`: check existing components and official shadcn documentation before adding or composing UI primitives.
- `vercel-react-best-practices`: apply when writing, refactoring, or reviewing React and Next.js code.
- `vercel-composition-patterns`: apply when designing reusable component APIs or refactoring components with proliferating boolean props.
- `web-design-guidelines`: apply before completing UI work to review UX, accessibility, and responsive behavior.

These skills supplement, but never replace, `.rules`, `docs/CODING_GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, the feature-first architecture, Tailwind design tokens, and the `pnpm` package-manager rule.

<!-- END:nextjs-agent-rules -->
