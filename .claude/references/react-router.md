# React Router 7 Framework Guide

> Complete reference for building with React Router 7 in Framework Mode. This is the primary documentation for ShipKit SaaS Worker RR7 template.

## Overview

React Router 7 Framework Mode provides:

- **Server-side rendering (SSR)** with Vite for fast builds
- **Type-safe routing** with auto-generated route types
- **Loaders and Actions** for data fetching and mutations
- **Progressive enhancement** - forms work without JavaScript
- **Web Standards** - uses native Request, Response, FormData APIs

---

## Project Structure

```
app/
├── root.tsx                    # Root layout with providers
├── routes.ts                   # Route configuration
├── routes/
│   ├── _index.tsx              # Landing page (/)
│   ├── _protected.tsx          # Layout for authenticated routes
│   ├── _admin.tsx              # Layout for admin routes
│   ├── auth.login.tsx          # /auth/login
│   ├── transcripts._index.tsx  # /transcripts
│   ├── transcripts.$jobId.tsx  # /transcripts/:jobId
│   ├── api.webhooks.stripe.tsx # API resource route
│   └── $.tsx                   # 404 catch-all
├── lib/
│   ├── db.server.ts            # Drizzle database client
│   ├── auth.server.ts          # Authentication utilities
│   ├── env.server.ts           # Environment validation
│   ├── supabase.server.ts      # Supabase client
│   └── schema/                 # Drizzle schema definitions
├── components/
│   └── ui/                     # shadcn/ui components
└── hooks/                      # Custom React hooks
```

### Routing Conventions

| File                       | URL                    | Description                  |
| -------------------------- | ---------------------- | ---------------------------- |
| `_index.tsx`               | `/`                    | Index route                  |
| `about.tsx`                | `/about`               | Static segment               |
| `products.$id.tsx`         | `/products/:id`        | Dynamic segment              |
| `_protected.tsx`           | (none)                 | Pathless layout (auth check) |
| `_protected.dashboard.tsx` | `/dashboard`           | Child of pathless layout     |
| `api.webhooks.stripe.tsx`  | `/api/webhooks/stripe` | Resource route (no UI)       |
| `sitemap[.]xml.tsx`        | `/sitemap.xml`         | Escaped dot                  |
| `$.tsx`                    | `*`                    | 404 catch-all                |

---

## Route Module Anatomy

Every route can export these:

```tsx
import type { Route } from "./+types/my-route";

// === SERVER-SIDE ===

// Data loading (GET requests)
export async function loader({ request, params, context }: Route.LoaderArgs) {
  return { data: "..." };
}

// Data mutations (POST, PUT, DELETE)
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  return redirect("/success");
}

// Middleware (runs before loader/action)
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

// HTTP headers
export function headers({ loaderHeaders }: Route.HeadersArgs) {
  return { "Cache-Control": "max-age=300" };
}

// === CLIENT-SIDE ===

// SEO meta tags
export const meta: Route.MetaFunction = ({ data }) => [
  { title: data?.title ?? "My App" },
];

// Error handling
export function ErrorBoundary() {
  const error = useRouteError();
  return <div>Error: {error.message}</div>;
}

// UI Component
export default function MyRoute({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return <div>{loaderData.data}</div>;
}
```

---

## Data Loading

### DO: Use Loaders

```tsx
import type { Route } from "./+types/campaigns";
import { db } from "~/lib/db.server";

export async function loader({ request }: Route.LoaderArgs) {
  const campaigns = await db.query.campaigns.findMany();
  return { campaigns };
}

export default function Campaigns({ loaderData }: Route.ComponentProps) {
  return <CampaignList campaigns={loaderData.campaigns} />;
}
```

### DON'T: Use useEffect for data

```tsx
// BAD - Never do this
export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  useEffect(() => {
    fetch("/api/campaigns")
      .then((r) => r.json())
      .then(setCampaigns);
  }, []);
}
```

**Why loaders?**

- Run on server, reduce client bundle
- Data available immediately (no loading spinners)
- Better SEO - server-rendered content
- Automatic error handling with ErrorBoundary
- Type-safe with generated Route types

---

## Data Mutations

### Use Actions with Forms

```tsx
import type { Route } from "./+types/campaigns.new";
import { redirect, Form, data } from "react-router";
import { db } from "~/lib/db.server";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;

  if (!name || name.length < 3) {
    return data(
      { error: "Name must be at least 3 characters" },
      { status: 400 },
    );
  }

  await db.insert(campaigns).values({ name });
  return redirect("/campaigns");
}

export default function NewCampaign({ actionData }: Route.ComponentProps) {
  return (
    <Form method="post">
      {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
      <input name="name" required />
      <button type="submit">Create</button>
    </Form>
  );
}
```

### Use useFetcher for In-Place Mutations

```tsx
import { useFetcher } from "react-router";

function FavoriteButton({ itemId }: { itemId: string }) {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post" action={`/api/items/${itemId}/favorite`}>
      <button type="submit">
        {fetcher.state === "submitting" ? "..." : "★"}
      </button>
    </fetcher.Form>
  );
}
```

---

## Pending UI States

```tsx
import { useNavigation, Form } from "react-router";

function CampaignForm() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <Form method="post">
      <fieldset disabled={isSubmitting}>
        <input name="name" />
        <button type="submit">{isSubmitting ? "Creating..." : "Create"}</button>
      </fieldset>
    </Form>
  );
}
```

---

## Optimistic UI

```tsx
function Task({ task }) {
  const fetcher = useFetcher();

  // Optimistically update based on pending form data
  let isComplete = task.status === "complete";
  if (fetcher.formData) {
    isComplete = fetcher.formData.get("status") === "complete";
  }

  return (
    <fetcher.Form method="post">
      <span className={isComplete ? "text-green-500" : ""}>{task.name}</span>
      <button name="status" value={isComplete ? "pending" : "complete"}>
        {isComplete ? "Mark Pending" : "Mark Complete"}
      </button>
    </fetcher.Form>
  );
}
```

---

## Error Handling

### Per-Route ErrorBoundary

```tsx
import { isRouteErrorResponse, useRouteError, Link } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-4">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  return <h1>Error: {error instanceof Error ? error.message : "Unknown"}</h1>;
}
```

### Throwing Responses

```tsx
import { data } from "react-router";

export async function loader({ params }: Route.LoaderArgs) {
  const item = await db.query.items.findFirst({
    where: eq(items.id, params.id),
  });

  if (!item) {
    throw data("Item not found", { status: 404 });
  }

  return { item };
}
```

---

## Streaming with Defer

Stream non-critical data to improve Time to First Byte:

```tsx
import { defer, Await } from "react-router";
import { Suspense } from "react";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request); // Critical - await

  return defer({
    user,
    stats: fetchStats(user.id), // Non-critical - stream
    activity: fetchActivity(user.id), // Non-critical - stream
  });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Welcome, {loaderData.user.name}!</h1>

      <Suspense fallback={<StatsLoading />}>
        <Await resolve={loaderData.stats}>
          {(stats) => <StatsCard data={stats} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

---

## Middleware & Authentication

### Authentication Middleware

```tsx
// app/middleware/auth.ts
import { redirect } from "react-router";
import { getSession } from "~/sessions.server";

export const authMiddleware = async ({ request, context }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");

  if (!userId) {
    throw redirect("/auth/login");
  }

  context.set("user", await getUserById(userId));
};
```

### Using in Routes

```tsx
import type { Route } from "./+types/dashboard";
import { authMiddleware } from "~/middleware/auth";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const user = context.get("user");
  return { user };
}
```

---

## Resource Routes (API Endpoints)

Routes without a default export become API-only:

```tsx
// app/routes/api.search.tsx
import type { Route } from "./+types/api.search";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const results = await searchProducts(query);

  return Response.json(results, {
    headers: { "Cache-Control": "public, max-age=60" },
  });
}

// No default export = resource route
```

---

## Session Management

```tsx
// app/sessions.server.ts
import { createCookieSessionStorage } from "react-router";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
      secrets: [process.env.SESSION_SECRET!],
      secure: process.env.NODE_ENV === "production",
    },
  });
```

---

## Server vs Client Code

Files ending in `.server.ts` are excluded from client bundles:

```
lib/
├── db.server.ts           # Server-only
├── auth.server.ts         # Server-only
├── utils.ts               # Shared (both)
```

---

## Environment Variables

```tsx
// app/lib/env.server.ts
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
});

export function init() {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error("Invalid environment variables");
  }
}
```

---

## Quick Reference

| Anti-Pattern                  | Use Instead                     |
| ----------------------------- | ------------------------------- |
| `useEffect` for data fetching | `loader` function               |
| `useState` + `fetch`          | `loader` + `loaderData`         |
| Manual form handling          | `<Form>` + `action`             |
| API routes for internal data  | Loaders and actions             |
| Client-side redirects         | `redirect()` from loader/action |
| Custom loading states         | `useNavigation().state`         |
| Manual error states           | `ErrorBoundary`                 |

---

## Image Optimization

React Router 7 does not include a built-in image component like Next.js. Here are the recommended approaches:

### Option 1: Native HTML with Loading Strategies

```tsx
// Basic lazy loading (browser-native)
<img
  src="/images/hero.jpg"
  alt="Hero image"
  loading="lazy"
  decoding="async"
  width={800}
  height={600}
/>

// Responsive images with srcset
<img
  src="/images/hero-800.jpg"
  srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w, /images/hero-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Hero image"
  loading="lazy"
/>

// Picture element for format switching
<picture>
  <source srcSet="/images/hero.avif" type="image/avif" />
  <source srcSet="/images/hero.webp" type="image/webp" />
  <img src="/images/hero.jpg" alt="Hero image" loading="lazy" />
</picture>
```

### Option 2: Unpic (Recommended for CDN Images)

[Unpic](https://unpic.pics/) provides a framework-agnostic image component with automatic optimization:

```bash
npm install @unpic/react
```

```tsx
import { Image } from "@unpic/react";

// Works with Cloudinary, Imgix, Bunny CDN, Vercel, etc.
<Image
  src="https://cdn.example.com/hero.jpg"
  alt="Hero image"
  width={800}
  height={600}
  priority={false} // Set true for above-the-fold images
/>;
```

**Supported CDNs:** Cloudinary, Imgix, Bunny CDN, Cloudflare Images, Vercel, Supabase Storage, and more.

### Option 3: Vite Image Optimization

Use Vite plugins for build-time optimization:

```bash
npm install vite-imagetools
```

```typescript
// vite.config.ts
import { imagetools } from "vite-imagetools";

export default defineConfig({
  plugins: [imagetools()],
});
```

```tsx
// Import optimized images
import heroAvif from "./hero.jpg?format=avif&w=800";
import heroWebp from "./hero.jpg?format=webp&w=800";
import heroFallback from "./hero.jpg?w=800";

<picture>
  <source srcSet={heroAvif} type="image/avif" />
  <source srcSet={heroWebp} type="image/webp" />
  <img src={heroFallback} alt="Hero" loading="lazy" />
</picture>;
```

### Option 4: Supabase Storage Transformations

If using Supabase Storage, leverage built-in transformations:

```tsx
// Original URL
const originalUrl =
  "https://xxx.supabase.co/storage/v1/object/public/images/photo.jpg";

// With transformations
const optimizedUrl = `${originalUrl}?width=800&height=600&resize=cover&format=webp`;

<img src={optimizedUrl} alt="Photo" loading="lazy" />;
```

### Best Practices

| Scenario              | Recommendation                                  |
| --------------------- | ----------------------------------------------- |
| Above-the-fold images | No `loading="lazy"`, add `fetchpriority="high"` |
| Below-the-fold images | Use `loading="lazy"` and `decoding="async"`     |
| Hero/banner images    | Use `<picture>` with AVIF/WebP fallbacks        |
| User-uploaded content | Use Supabase transformations or CDN             |
| Static assets         | Use vite-imagetools for build-time optimization |

### Migration from next/image

```tsx
// Next.js
import Image from "next/image";
<Image src="/hero.jpg" alt="Hero" width={800} height={600} priority />

// React Router 7 - Native approach
<img
  src="/hero.jpg"
  alt="Hero"
  width={800}
  height={600}
  fetchpriority="high"
  decoding="async"
/>

// React Router 7 - Unpic (for CDN images)
import { Image } from "@unpic/react";
<Image src="https://cdn.example.com/hero.jpg" alt="Hero" width={800} height={600} priority />
```

---

## Related Documentation

- [Next.js to RR7 Migration Guide](./NEXTJS_TO_RR7_MIGRATION.md) - Step-by-step migration process
- [Official React Router Docs](https://reactrouter.com/en/main)
- [Unpic Documentation](https://unpic.pics/img/react/) - Multi-CDN image component
