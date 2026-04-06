import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
	test("homepage loads successfully", async ({ page }) => {
		const response = await page.goto("/");
		expect(response?.status()).toBe(200);
	});

	test("homepage has no errors in console", async ({ page }) => {
		const errors: string[] = [];
		page.on("pageerror", (err) => errors.push(err.message));
		await page.goto("/");
		expect(errors).toHaveLength(0);
	});
});
