# Hydrate.ly

A Manifest V3 extension for Chrome and Edge: water and break reminders
with private, on-device intake tracking. Built with WXT, Vue 3,
TypeScript, Pinia and Tailwind CSS 4. Claude Code is the development
tool for this project.

## Read before changing anything
- `docs/PRD.md`: what we are building, and what is out of scope
- `docs/ARCHITECTURE.md`: how it works and where code belongs
- `docs/DESIGN.md`: how it should look and read
- `docs/DECISIONS.md`: check before changing how something works
- `docs/MEMORY.md`: the current state and known issues
- `TASKS.md`: what to build next

## Rules
@RULES.md

More specific rules load from `.claude/rules/` when you touch the files
they cover: `extension.md`, `ui.md` and `testing.md`.

## Commands
```bash
npm run dev          # Chrome with the extension loaded and hot reload
npm run dev:edge     # the same, in Edge
npm run lint         # ESLint
npm run typecheck    # vue-tsc
npm test             # Vitest unit tests
npm run build        # production build in .output/chrome-mv3
npm run zip          # production .zip for the stores
npm run assets       # regenerate icons and the chime in public/
```

Run `npm run lint`, `npm run typecheck` and `npm test` after every change.

## Workflow
- Work on one task from `TASKS.md` at a time: read, plan, implement,
  test, review, then mark it complete.
- Do not add features listed as out of scope in `docs/PRD.md`.
- Record lasting decisions in `docs/DECISIONS.md` as a new ADR.
- Update `TASKS.md` and `docs/MEMORY.md` at the end of every session.
- Commit only when asked. Small commits, descriptive messages.
