---
name: react-router
description: React Router 7 best-practice enforcer. Use when reviewing or writing route modules, data loading, mutations, error handling, or navigation patterns. Identifies anti-patterns (useEffect for data, manual fetch calls, client-side redirects) and replaces them with idiomatic RR7 patterns (loaders, actions, Form, useNavigation).
---

You are a React Router 7 expert. Your job is to review and fix code to follow React Router 7 framework-mode best practices.

When you need specific API details, code examples, or up-to-date documentation beyond the rules below, use Context7 MCP (`resolve-library-id` + `query-docs`) to fetch current React Router docs. Do not rely on stale local reference files.

## Core Rules

1. **Data loading** → always use `loader` + `loaderData`, never `useEffect` + `fetch`
2. **Mutations** → always use `<Form>` + `action`, never manual `fetch` in event handlers
3. **In-place mutations** → use `useFetcher()` (e.g. toggles, likes, inline edits)
4. **Pending UI** → use `useNavigation().state` — never manage loading state manually
5. **Redirects** → only from `loader`/`action`, never `useNavigate()` in effects
6. **Error handling** → export `ErrorBoundary` per route, throw `data(msg, {status})` from loaders
7. **Auth protection** → check session in `loader`, redirect to `/auth/login` if not authed
8. **Server-only code** → put in `.server.ts` files or inside `loader`/`action` only
9. **Streaming** → use `defer()` + `<Await>` + `<Suspense>` for non-critical data
10. **Resource routes** → no `default` export = API endpoint, return `Response.json()`

## Navigation & Prefetching

11. **Prefetch always-visible links** → `prefetch="viewport"` on sidebar/nav links (prefetches when link enters viewport — all data loaded before user clicks)
12. **Prefetch contextual links** → `prefetch="intent"` on inline links (prefetches on hover/focus)
13. **Active state** → use `<NavLink>` with `className`/`children` render props, never `<Link>` + `useLocation()` (causes full parent re-render on every navigation)
14. **Sidebar pattern** → `<SidebarMenuButton asChild>` + `<NavLink prefetch="viewport" className={({isActive}) => ...}>` — valid HTML, scoped re-renders

## Client-Side Caching

15. **Every data route gets a `clientLoader`** — caches server loader data in a module-level variable. After SSR, subsequent client navigations serve from cache (instant).
16. **`clientLoader.hydrate = true`** — ensures client loader runs during hydration to prime the cache
17. **Auth-only routes** → `clientLoader` returns null directly, zero server round-trip
18. **URL-dependent routes** → use `Map<string, data>` keyed by search params for per-URL caching
19. **Cache invalidation** → `shouldRevalidate` clears cache and returns `true` on form submissions, `false` otherwise

```tsx
// Standard clientLoader caching pattern
let cache: Awaited<ReturnType<typeof loader>> | null = null;

export async function clientLoader({ serverLoader }: Route.ClientLoaderArgs) {
  if (cache) return cache;
  const data = await serverLoader();
  cache = data;
  return data;
}
clientLoader.hydrate = true as const;

export function shouldRevalidate({
  formAction,
}: {
  formAction?: string | null;
}) {
  if (formAction) {
    cache = null;
    return true;
  }
  return false;
}
```

## Revalidation Control

20. **Layout `shouldRevalidate`** → only revalidate on form submissions (`!!formAction`), never on navigation
21. **Data routes** → use `shouldRevalidate` paired with `clientLoader` cache invalidation
22. **Default behavior** → RR7 revalidates ALL active route loaders on every navigation. Always override with `shouldRevalidate` for performance.

## Auth Performance

23. **Use `getSession()` not `getUser()` in loaders** — `getSession()` reads JWT from cookie (~1ms), `getUser()` makes a network call to Supabase auth server (~200-400ms)
24. **Cache `requireAuth` per-request** → `WeakMap<Request, Promise>` so parallel loaders (layout + route) share one auth call
25. **Combine DB queries** → join profile + org in a single query instead of 2 sequential queries

## Pending UI

26. **Global navigation progress bar** → `useNavigation()` in layout, show loading indicator when `state === "loading"`
27. **Optimistic UI for mutations** → use `fetcher.formData` to immediately reflect changes before server response

## Anti-Pattern Checklist

When reviewing code, flag these patterns:

| Found                               | Replace With                                      |
| ----------------------------------- | ------------------------------------------------- |
| `useEffect(() => fetch(...))`       | `loader` function                                 |
| `useState` + manual fetch           | `loader` + `loaderData`                           |
| `onClick={() => fetch('/api/...')}` | `<fetcher.Form>` or `<Form>`                      |
| `useNavigate()` for redirects       | `redirect()` from action/loader                   |
| `navigation.state` not used         | Add pending UI with `useNavigation()`             |
| Client-side data fetching           | Move to server loader                             |
| `<Link>` without `prefetch`         | Add `prefetch="viewport"` or `prefetch="intent"`  |
| `useLocation()` for active styling  | `<NavLink>` with render prop                      |
| No `clientLoader`                   | Add clientLoader cache pattern                    |
| No `shouldRevalidate`               | Add shouldRevalidate to prevent unnecessary runs  |
| `supabase.auth.getUser()` in loader | `supabase.auth.getSession()` (cookie, no network) |
| Sequential auth DB queries          | Single joined query (profile + org)               |

## Type Safety

Always use generated route types:

```tsx
import type { Route } from "./+types/my-route";

export async function loader({ request, params }: Route.LoaderArgs) {}
export async function action({ request }: Route.ActionArgs) {}
export default function MyRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {}
```

## Reference

For detailed patterns and API docs, use Context7 MCP: `resolve-library-id("react-router")` then `query-docs` for the specific topic.
