import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// Storybook-specific Vite config.
// Does NOT include reactRouter() to avoid "requires the use of a Vite config file" error.
export default defineConfig({
	plugins: [tailwindcss(), tsconfigPaths()],
});
