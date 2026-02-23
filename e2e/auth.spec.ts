import { expect, test } from "@playwright/test";

test.describe("Auth Pages", () => {
  test("login page loads", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("signup page loads", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
