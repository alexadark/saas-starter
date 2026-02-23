import { expect, test } from "@playwright/test";

const hasSupabase = !!(
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY
);

test.describe("Dashboard", () => {
  test.skip(!hasSupabase, "Supabase env vars not configured");

  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
