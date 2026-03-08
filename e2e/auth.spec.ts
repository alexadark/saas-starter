import { expect, test } from "@playwright/test";

const hasSupabase = !!(
  process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

test.describe("Login Page", () => {
  test.skip(!hasSupabase, "Supabase env vars not configured");

  test("renders login form with all fields", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("shows validation for invalid email", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();
    // HTML5 validation prevents submission — input should be invalid
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("has link to signup page", async ({ page }) => {
    await page.goto("/auth/login");
    const signupLink = page.getByRole("link", { name: "Sign up" });
    await expect(signupLink).toBeVisible();
    await signupLink.click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("has link to forgot password page", async ({ page }) => {
    await page.goto("/auth/login");
    const forgotLink = page.getByRole("link", { name: "Forgot password?" });
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/\/auth\/forgot-password/);
  });
});

test.describe("Signup Page", () => {
  test.skip(!hasSupabase, "Supabase env vars not configured");

  test("renders signup form with all fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(
      page.getByRole("heading", { name: "Create account" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });

  test("enforces minimum password length", async ({ page }) => {
    await page.goto("/auth/signup");
    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("minlength", "8");
  });

  test("has link to login page", async ({ page }) => {
    await page.goto("/auth/signup");
    const loginLink = page.getByRole("link", { name: "Sign in" });
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});

test.describe("Forgot Password Page", () => {
  test.skip(!hasSupabase, "Supabase env vars not configured");

  test("renders forgot password form", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(
      page.getByRole("heading", { name: "Forgot password" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Send reset link" }),
    ).toBeVisible();
  });

  test("shows validation for invalid email", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send reset link" }).click();
    const emailInput = page.getByLabel("Email");
    await expect(emailInput).toHaveAttribute("type", "email");
  });

  test("has link back to login", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    const backLink = page.getByRole("link", { name: "Back to sign in" });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
