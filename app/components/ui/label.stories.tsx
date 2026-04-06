import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";

const meta = {
	title: "UI/Label",
	component: Label,
	tags: ["autodocs"],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: "Email address",
		htmlFor: "email",
	},
};

export const WithInput: Story = {
	render: () => (
		<div className="grid w-full max-w-sm items-center gap-1.5">
			<Label htmlFor="email-input">Email</Label>
			<input
				type="email"
				id="email-input"
				placeholder="Enter your email"
				className="border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
			/>
		</div>
	),
};

export const DarkMode: Story = {
	args: {
		children: "Email address",
		htmlFor: "email",
	},
	decorators: [
		(Story) => (
			<div className="dark bg-background p-4">
				<Story />
			</div>
		),
	],
};
