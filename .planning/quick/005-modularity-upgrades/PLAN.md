---
type: quick
task_number: "005"
task_slug: modularity-upgrades
created: 2026-02-23T00:00:00Z
files_modified:
  - app/components/ui/textarea.tsx
  - app/components/ui/dialog.tsx
  - app/components/ui/input.tsx
  - app/components/ui/button.tsx
  - app/components/ui/card.tsx
  - app/components/ui/label.tsx
  - app/components/ui/separator.tsx
  - app/components/ui/image.tsx
  - .claude/references/react-router.md
  - CLAUDE.md
autonomous: true
---

# Quick Task 005: Modularity & Convention Upgrades

> Add Textarea + Dialog UI primitives, update RR7 reference with useFetcher.submit anti-pattern, convert all components to const arrow functions, and document the convention in CLAUDE.md.

## Context

- Source spec: `specs/todo/modularity-upgrades.md`
- Existing input pattern: `app/components/ui/input.tsx`
- Existing button (uses radix-ui Slot): `app/components/ui/button.tsx`
- Label uses radix-ui: `import { Label as LabelPrimitive } from "radix-ui"` → `LabelPrimitive.Root`
- RR7 reference: `.claude/references/react-router.md`
- Project CLAUDE.md Conventions section: `CLAUDE.md`

## Tasks

<task type="auto">
  <name>Create textarea.tsx UI primitive</name>
  <files>app/components/ui/textarea.tsx</files>
  <action>
    Create `app/components/ui/textarea.tsx` as a new file.
    Use `const` arrow function style.
    Import `cn` from `~/lib/utils` and `React` type from `react`.
    Pattern mirrors input.tsx but for textarea element with `data-slot="textarea"`.
    Full className from the spec:
    - Base: "placeholder:text-muted-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    - Focus: "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
    - Invalid: "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
    Export: `export { Textarea };`
  </action>
  <verify>
    File exists at `app/components/ui/textarea.tsx`.
    Contains `const Textarea = ` arrow function.
    Contains `data-slot="textarea"`.
    Exports `{ Textarea }`.
  </verify>
  <done>textarea.tsx created and exports Textarea const arrow function</done>
</task>

<task type="auto">
  <name>Create dialog.tsx UI primitive</name>
  <files>app/components/ui/dialog.tsx</files>
  <action>
    Create `app/components/ui/dialog.tsx` as a new file.
    Use the consolidated `radix-ui` package (same as button.tsx and label.tsx use it).
    Import: `import { Dialog } from "radix-ui";`
    The radix-ui consolidated package exposes sub-components via namespaced properties.
    Provide these exports using `const` arrow functions that wrap the radix primitives:
    - DialogPortal = re-export of Dialog.Portal
    - DialogOverlay = styled const arrow function wrapping Dialog.Overlay with classes:
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
    - DialogContent = styled const arrow function wrapping Dialog.Content inside DialogPortal + DialogOverlay:
      "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg"
      DialogContent should also render a close button using Dialog.Close with an X icon (use a simple × character or an X SVG).
    - DialogHeader = const arrow function for a div with classes: "flex flex-col gap-2 text-center sm:text-left"
    - DialogFooter = const arrow function for a div with classes: "flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-2"
    - DialogTitle = styled const arrow function wrapping Dialog.Title with classes: "text-lg font-semibold leading-none tracking-tight"
    - DialogDescription = styled const arrow function wrapping Dialog.Description with classes: "text-muted-foreground text-sm"
    Root exports: Dialog.Root → Dialog, Dialog.Trigger → DialogTrigger, Dialog.Close → DialogClose
    Use cn from ~/lib/utils.
    Export all: Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger
  </action>
  <verify>
    File exists at `app/components/ui/dialog.tsx`.
    Imports from `radix-ui`.
    All required exports present.
    Uses `const` arrow functions.
  </verify>
  <done>dialog.tsx created with all exports as const arrow functions</done>
</task>

<task type="auto">
  <name>Add useFetcher.submit anti-pattern to RR7 reference</name>
  <files>.claude/references/react-router.md</files>
  <action>
    In `.claude/references/react-router.md`, add the following:
    1. After the existing "Use useFetcher for In-Place Mutations" section, add a new subsection showing `fetcher.submit()` for programmatic POST:
    ```
    ### fetcher.submit() for Programmatic POST

    When you need to trigger a mutation programmatically (without a form submit event):

    ```tsx
    import { useFetcher } from "react-router";

    function DeleteButton({ itemId }: { itemId: string }) {
      const fetcher = useFetcher();

      const handleDelete = () => {
        fetcher.submit(
          { id: itemId },
          { method: "post", action: "/api/items/delete" }
        );
      };

      return (
        <button onClick={handleDelete} disabled={fetcher.state !== "idle"}>
          {fetcher.state !== "idle" ? "Deleting..." : "Delete"}
        </button>
      );
    }
    ```

    2. In the "Quick Reference" anti-pattern table, add a new row:
    `| document.createElement("form") + requestSubmit() | fetcher.submit() |`

  </action>
  <verify>
    File contains "fetcher.submit(" example.
    File contains `document.createElement("form")` in the anti-pattern table.
  </verify>
  <done>RR7 reference updated with fetcher.submit anti-pattern</done>
</task>

<task type="auto">
  <name>Convert all UI components to const arrow functions</name>
  <files>
    app/components/ui/input.tsx,
    app/components/ui/button.tsx,
    app/components/ui/card.tsx,
    app/components/ui/label.tsx,
    app/components/ui/separator.tsx,
    app/components/ui/image.tsx
  </files>
  <action>
    Convert all `function X(...)` declarations to `const X = (...) => { ... }` in:
    - input.tsx: `function Input` → `const Input = (`
    - button.tsx: `function Button` → `const Button = (`
    - card.tsx: 7 functions → Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter
    - label.tsx: `function Label` → `const Label = (`
    - separator.tsx: `function Separator` → `const Separator = (`
    - image.tsx: `export function Image` → `export const Image = (`
    Preserve all logic, types, and exports exactly. Only change the function declaration syntax.
  </action>
  <verify>
    None of the files contain `function Input`, `function Button`, `function Card`, `function Label`, `function Separator`, `export function Image`.
    All files now use `const X = (` syntax.
    Run `npm run typecheck` — must pass with no new errors.
  </verify>
  <done>All 6 component files converted to const arrow functions, typecheck passes</done>
</task>

<task type="auto">
  <name>Add const arrow function convention to CLAUDE.md</name>
  <files>CLAUDE.md</files>
  <action>
    In `CLAUDE.md`, find the `## Conventions` section.
    Add a new bullet:
    `- React components use \`const\` arrow functions (not \`function\` declarations)`
  </action>
  <verify>
    CLAUDE.md Conventions section contains the const arrow function rule.
  </verify>
  <done>CLAUDE.md updated with const arrow function convention</done>
</task>

## Success Criteria

- `app/components/ui/textarea.tsx` exists and exports `Textarea` as a const arrow function
- `app/components/ui/dialog.tsx` exists and exports all Dialog primitives
- `.claude/references/react-router.md` has `fetcher.submit()` example and anti-pattern table entry
- All 6 existing UI components use `const` arrow function syntax
- `CLAUDE.md` Conventions section documents the const convention
- `npm run typecheck` passes with no new errors
