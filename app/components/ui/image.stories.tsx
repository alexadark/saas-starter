import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "./image";

const meta = {
	title: "UI/Image",
	component: Image,
	tags: ["autodocs"],
} satisfies Meta<typeof Image>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		src: "https://placehold.co/800x600/EEE/31343C",
		alt: "Placeholder image",
		width: 800,
		height: 600,
	},
};

export const WithPriority: Story = {
	args: {
		src: "https://placehold.co/1200x630/EEE/31343C",
		alt: "Priority image for LCP optimization",
		width: 1200,
		height: 630,
		priority: true,
	},
};

export const DarkMode: Story = {
	args: {
		src: "https://placehold.co/800x600/EEE/31343C",
		alt: "Placeholder image",
		width: 800,
		height: 600,
	},
	decorators: [
		(Story) => (
			<div className="dark bg-background p-4">
				<Story />
			</div>
		),
	],
};
