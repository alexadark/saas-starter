---
description: "Generate a component with Storybook story and test file"
argument: "ComponentName in category/name format (e.g. dashboard/stats-card)"
---

Generate three files for a new React component. The argument is in `category/name` format.

Parse the argument:
- If format is `category/name` → category is the folder, name is the component
- If format is just `name` → ask which category folder to use

**Naming conventions:**
- File names: kebab-case (e.g. `stats-card.tsx`)
- Component name: PascalCase (e.g. `StatsCard`)
- Story title: `Category/ComponentName` (e.g. `Dashboard/StatsCard`)

## File 1: Component

Create `app/components/{category}/{name}.tsx`:

Requirements:
- Named export (e.g. `export function StatsCard()`)
- TypeScript interface for props (e.g. `interface StatsCardProps {}`)
- Accessible markup (semantic HTML, ARIA attributes where needed)
- Tailwind CSS for styling, using project design tokens
- Import from `~/components/ui/*` for shadcn components

## File 2: Storybook Story

Create `app/components/{category}/{name}.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { ComponentName } from "./{name}";

const meta = {
	title: "{Category}/{ComponentName}",
	component: ComponentName,
	decorators: [
		(Story) => (
			<MemoryRouter>
				<Story />
			</MemoryRouter>
		),
	],
	parameters: {
		layout: "centered", // or "fullscreen" for page-level components
	},
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkMode: Story = {
	decorators: [
		(Story) => (
			<div className="dark bg-background text-foreground p-8">
				<Story />
			</div>
		),
	],
};
```

Requirements:
- Always include `MemoryRouter` decorator (project uses React Router links)
- Always include `Default` and `DarkMode` stories
- Add `args` with realistic example data when component has props
- Use `layout: "fullscreen"` for page-level or section-level components
- Use `layout: "centered"` for smaller UI components

## File 3: Test

Create `app/components/{category}/{name}.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ComponentName } from "./{name}";

function renderComponent(props = {}) {
	return render(
		<MemoryRouter>
			<ComponentName {...props} />
		</MemoryRouter>
	);
}

describe("{ComponentName}", () => {
	it("renders without crashing", () => {
		renderComponent();
	});

	it("is accessible", () => {
		const { container } = renderComponent();
		// Check semantic HTML, heading hierarchy, alt text, etc.
	});
});
```

Requirements:
- Use `describe`, `expect`, `it` from "vitest"
- Always wrap in `MemoryRouter`
- Use a `renderComponent()` helper for consistent setup
- If the component calls APIs, add MSW handlers:
  ```tsx
  import { http, HttpResponse } from "msw";
  import { server } from "~/../../test/mocks/server";

  beforeEach(() => {
    server.use(
      http.get("/api/endpoint", () => {
        return HttpResponse.json({ data: "mock" });
      }),
    );
  });
  ```
- Test real user behavior, not implementation details

## After generating all three files:

1. Run `npm run test -- --run` to verify the test passes
2. Run `npm run typecheck` to verify no type errors

**IMPORTANT:** Do NOT generate placeholder or skeleton components. Ask the user what the component should do if the purpose is unclear.
