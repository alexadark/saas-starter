# Quick Tasks: Modularity & Convention Upgrades

Source: ai-interviewer-gsd code review (2026-02-23)

## 1. Add `<Textarea>` UI primitive

Create `app/components/ui/textarea.tsx` following the same pattern as `input.tsx`.
Every starter project should have this from day 1.

```tsx
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}
export { Textarea };
```

## 2. Add `<Dialog>` UI primitive

Create `app/components/ui/dialog.tsx` — shadcn-style wrapper around Radix Dialog.
Provides: Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose, DialogOverlay, DialogPortal, DialogTrigger.

Requires `radix-ui` package (already in deps).

## 3. Add `useFetcher` anti-pattern rule to RR7 reference

In `.claude/references/react-router.md`, add:

- `fetcher.submit()` example for programmatic POST
- Anti-pattern: `document.createElement("form")` + `requestSubmit()`
- Add to anti-pattern table: `document.createElement("form")` → `fetcher.submit()`

## 4. Use `const` arrow functions for components

Update all existing components from `function MyComponent()` to `const MyComponent = () => {}`.
This is the preferred personal style (documented in `~/.claude/CLAUDE.md`).

## 5. Add `const` convention to CLAUDE.md

Add to the Conventions section:

```
- React components use `const` arrow functions (not `function` declarations)
```
