import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
	title: "UI/Separator",
	component: Separator,
	tags: ["autodocs"],
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: () => (
		<div className="w-full max-w-sm">
			<div className="space-y-1">
				<h4 className="text-sm font-medium leading-none">Section Above</h4>
				<p className="text-sm text-muted-foreground">Content above the separator.</p>
			</div>
			<Separator className="my-4" />
			<div className="space-y-1">
				<h4 className="text-sm font-medium leading-none">Section Below</h4>
				<p className="text-sm text-muted-foreground">Content below the separator.</p>
			</div>
		</div>
	),
};

export const Vertical: Story = {
	render: () => (
		<div className="flex h-5 items-center gap-4 text-sm">
			<span>Item 1</span>
			<Separator orientation="vertical" />
			<span>Item 2</span>
			<Separator orientation="vertical" />
			<span>Item 3</span>
		</div>
	),
};

export const DarkMode: Story = {
	render: () => (
		<div className="w-full max-w-sm">
			<div className="space-y-1">
				<h4 className="text-sm font-medium leading-none">Section Above</h4>
				<p className="text-sm text-muted-foreground">Content above the separator.</p>
			</div>
			<Separator className="my-4" />
			<div className="space-y-1">
				<h4 className="text-sm font-medium leading-none">Section Below</h4>
				<p className="text-sm text-muted-foreground">Content below the separator.</p>
			</div>
		</div>
	),
	decorators: [
		(Story) => (
			<div className="dark bg-background p-4">
				<Story />
			</div>
		),
	],
};
