---
phase: quick
plan: "005"
subsystem: ui-components
tags:
  - ui-primitives
  - refactor
  - conventions
  - documentation
dependency_graph:
  requires: []
  provides:
    - app/components/ui/textarea.tsx
    - app/components/ui/dialog.tsx
  affects:
    - app/components/ui/input.tsx
    - app/components/ui/button.tsx
    - app/components/ui/card.tsx
    - app/components/ui/label.tsx
    - app/components/ui/separator.tsx
    - app/components/ui/image.tsx
    - .claude/references/react-router.md
    - CLAUDE.md
tech_stack:
  added: []
  patterns:
    - "const arrow function components (replacing function declarations)"
    - "radix-ui consolidated package for Dialog primitives"
key_files:
  created:
    - app/components/ui/textarea.tsx
    - app/components/ui/dialog.tsx
  modified:
    - app/components/ui/input.tsx
    - app/components/ui/button.tsx
    - app/components/ui/card.tsx
    - app/components/ui/label.tsx
    - app/components/ui/separator.tsx
    - app/components/ui/image.tsx
    - .claude/references/react-router.md
    - CLAUDE.md
decisions:
  - "Used Dialog.Portal wrapping in DialogContent to follow Radix best practice"
  - "Close button uses inline SVG X icon per spec instructions"
  - "fetcher.submit() added as a distinct section (not inside existing useFetcher section) for clarity"
metrics:
  duration: "~3 minutes"
  completed: "2026-02-23"
  tasks_completed: 5
  tasks_total: 5
---

# Quick Task 005: Modularity & Convention Upgrades Summary

**One-liner:** Added Textarea + Dialog UI primitives using radix-ui consolidated package, documented fetcher.submit() pattern in RR7 reference, and converted all 6 existing UI components from function declarations to const arrow functions.

## Tasks Completed

| #   | Task                                                | Commit  | Status |
| --- | --------------------------------------------------- | ------- | ------ |
| 1   | Create textarea.tsx UI primitive                    | 17b510d | Done   |
| 2   | Create dialog.tsx UI primitive                      | 7272124 | Done   |
| 3   | Add useFetcher.submit anti-pattern to RR7 reference | 2151f7a | Done   |
| 4   | Convert all UI components to const arrow functions  | 5a38885 | Done   |
| 5   | Add const arrow function convention to CLAUDE.md    | dd3643b | Done   |

## What Was Built

### New Files

**`app/components/ui/textarea.tsx`**

- Mirrors the `input.tsx` pattern for `<textarea>` elements
- Uses `data-slot="textarea"` for consistency with the design system
- Full className suite: base styles, focus-visible ring, aria-invalid states
- Exported as `const Textarea = ...` arrow function

**`app/components/ui/dialog.tsx`**

- Uses `import { Dialog } from "radix-ui"` (consolidated package pattern)
- Exports: `Dialog`, `DialogTrigger`, `DialogClose`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`
- `DialogContent` wraps children inside `Dialog.Portal` + `DialogOverlay` and includes an X close button with SVG icon
- All exports are `const` arrow functions

### Modified Files

**`app/components/ui/input.tsx`** — `function Input` -> `const Input`
**`app/components/ui/button.tsx`** — `function Button` -> `const Button`
**`app/components/ui/card.tsx`** — All 7 functions converted to `const` arrow functions
**`app/components/ui/label.tsx`** — `function Label` -> `const Label`
**`app/components/ui/separator.tsx`** — `function Separator` -> `const Separator`
**`app/components/ui/image.tsx`** — `export function Image` -> `export const Image`

**`.claude/references/react-router.md`**

- Added `### fetcher.submit() for Programmatic POST` subsection with `DeleteButton` example
- Added `document.createElement("form") + requestSubmit()` anti-pattern row to Quick Reference table

**`CLAUDE.md`**

- Added to Conventions section: `React components use \`const\` arrow functions (not \`function\` declarations)`

## Success Criteria Verification

- [x] `app/components/ui/textarea.tsx` exists and exports `Textarea` as const arrow function
- [x] `app/components/ui/dialog.tsx` exists and exports all Dialog primitives
- [x] `.claude/references/react-router.md` has `fetcher.submit()` example and anti-pattern table entry
- [x] All 6 existing UI components use `const` arrow function syntax
- [x] `CLAUDE.md` Conventions section documents the const convention
- [x] `npm run typecheck` passes with no new errors

## Deviations from Plan

None -- plan executed exactly as written.

## Self-Check

### Files Exist

- [x] `app/components/ui/textarea.tsx` -- FOUND
- [x] `app/components/ui/dialog.tsx` -- FOUND
- [x] `app/components/ui/input.tsx` -- FOUND (modified)
- [x] `app/components/ui/button.tsx` -- FOUND (modified)
- [x] `app/components/ui/card.tsx` -- FOUND (modified)
- [x] `app/components/ui/label.tsx` -- FOUND (modified)
- [x] `app/components/ui/separator.tsx` -- FOUND (modified)
- [x] `app/components/ui/image.tsx` -- FOUND (modified)
- [x] `.claude/references/react-router.md` -- FOUND (modified)
- [x] `CLAUDE.md` -- FOUND (modified)

### Commits Exist

- [x] 17b510d -- feat(quick-005): create Textarea UI primitive
- [x] 7272124 -- feat(quick-005): create Dialog UI primitive
- [x] 2151f7a -- docs(quick-005): add fetcher.submit anti-pattern to RR7 reference
- [x] 5a38885 -- refactor(quick-005): convert UI components to const arrow functions
- [x] dd3643b -- docs(quick-005): add const arrow function convention to CLAUDE.md

## Self-Check: PASSED
