# Git Workflow

This document defines the Git workflow for SSWMS Frontend. Follow it when creating branches, committing work, merging changes, or pushing to the remote repository.

## Branching Rules

- Do not develop new features directly on `dev`.
- Create a new branch for every feature, bug fix, UI screen, refactor, documentation change, or experiment.
- Start new branches from the latest `dev`.
- Before creating a branch, run:

```bash
git fetch origin dev
git switch -c <type>/<scope> origin/dev
```

## Branch Naming

Use short, descriptive branch names with a work type and ticket/task code.

```text
<type>/wms-<number>-<short-description>
```

Examples:

```text
feat/wms-12-register-screen
fix/wms-18-login-validation
ui/wms-21-inventory-table
docs/wms-25-git-workflow
refactor/wms-31-auth-api-hooks
chore/wms-40-update-dependencies
```

Allowed branch types:

- `feat`: New user-facing feature or product behavior.
- `fix`: Bug fix.
- `ui`: Visual/interface-only implementation or redesign.
- `docs`: Documentation-only change.
- `refactor`: Code structure change without intended behavior change.
- `test`: Test-only change.
- `chore`: Maintenance, dependency, config, or tooling change.

## Commit Rules

- Commit only files related to the current task.
- Do not include unrelated local changes in the same commit.
- Check the working tree before committing:

```bash
git status --short --branch
```

- Use clear commit messages in this format:

```text
<type>(wms-<number>): <short summary>
```

Examples:

```text
feat(wms-12): add register screen
fix(wms-18): validate tenant code on login
ui(wms-21): build inventory table layout
docs(wms-25): add git workflow
refactor(wms-31): split auth API hooks
chore(wms-40): update lint config
```

If no ticket/task number exists, use a concise scope instead:

```text
docs(project): add frontend design guidelines
chore(repo): update agent instructions
```

## Before Pushing

Before pushing a branch, verify:

- The current branch is correct.
- The remote is correct.
- Only intended files are committed.
- The app passes the relevant local checks for the change.

Recommended commands:

```bash
git status --short --branch
git remote -v
```

For code changes, run the relevant checks when dependencies are installed:

```bash
pnpm run lint
pnpm run build
```

For documentation-only changes, tests are not required, but the changed files should still be reviewed.

## Pull Request And Merge Rules

- Push feature branches to `origin`.
- Open a pull request from the feature branch into `dev`.
- PRs target `dev`. Only the leader promotes `dev` to `main`; agents never perform that promotion.
- Use a pull request title in this format:

```text
<type>(wms-<number>): <short summary>
```

Example:

```text
feat(wms-12): add register screen
```

- Before merge, confirm the branch is up to date with `dev`.
- Prefer squash merge for feature branches when the team wants a clean history.
- Delete merged branches only when cleanup is requested.

## Safety Rules

- Never use destructive Git commands unless explicitly requested:

```bash
git reset --hard
git checkout -- <file>
git clean -fd
git push --force
```

- Do not rewrite shared history unless the team explicitly approves it.
- Do not revert or overwrite changes you did not make.
- If the working tree contains unrelated changes, leave them alone and commit only the current task files.
- If a conflict happens, resolve it deliberately and verify the affected files before committing.

## AI Agent Rules

When an AI agent works in this repository:

- Read this file before creating branches, commits, merges, or pushes.
- For authorized work without a ticket, use a descriptive scope; do not invent a ticket or ask only for branch naming.
- Use the branch format `feat/wms-xx-short-description` for new features unless the user specifies another type.
- Use commit messages like `feat(wms-xx): short summary`.
- Run `git status --short --branch` before and after Git operations.
- Never force push or run destructive Git commands without explicit user approval.
