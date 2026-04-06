import { describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "~/lib/supabase/server";

vi.mock("~/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("~/lib/server/csrf", () => ({
  validateCsrf: vi.fn(),
  generateCsrfToken: vi.fn().mockReturnValue("test-token"),
  setCsrfCookie: vi.fn(),
}));

vi.mock("~/lib/server/rate-limit", () => ({
  createRateLimiter: () => () => ({
    allowed: true,
    remaining: 9,
    resetAt: new Date(),
    max: 10,
  }),
  getRateLimitHeaders: () => ({}),
}));

const mockCreateSupabase = createSupabaseServerClient as ReturnType<
  typeof vi.fn
>;

const buildFormRequest = (fields: Record<string, string>) => {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return new Request("http://localhost/auth/login", {
    method: "POST",
    body: formData,
    headers: {
      Cookie: "__csrf=test-token",
    },
  });
};

describe("auth/login action", () => {
  it("redirects to /dashboard on successful login", async () => {
    mockCreateSupabase.mockReturnValue({
      supabase: {
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        },
      },
      headers: new Headers(),
    });

    const { action } = await import("../login");
    const request = buildFormRequest({
      email: "test@example.com",
      password: "validpassword123",
      _csrf: "test-token",
    });

    const response = await action({
      request,
      params: {},
      context: {},
    } as never);

    expect((response as Response).status).toBe(302);
    expect((response as Response).headers.get("Location")).toBe("/dashboard");
  });

  it("returns error message on failed login", async () => {
    mockCreateSupabase.mockReturnValue({
      supabase: {
        auth: {
          signInWithPassword: vi
            .fn()
            .mockResolvedValue({ error: { message: "Invalid credentials" } }),
        },
      },
      headers: new Headers(),
    });

    const { action } = await import("../login");
    const request = buildFormRequest({
      email: "test@example.com",
      password: "wrongpassword",
      _csrf: "test-token",
    });

    const response = await action({
      request,
      params: {},
      context: {},
    } as never);

    // React Router data() returns a DataWithResponseInit object
    const result = response as {
      data: { error: string };
      init: { status: number };
    };
    expect(result.data.error).toBe("Invalid credentials");
    expect(result.init.status).toBe(400);
  });
});

describe("auth/login loader", () => {
  it("returns a CSRF token", async () => {
    const { loader } = await import("../login");
    const request = new Request("http://localhost/auth/login");

    const response = await loader({
      request,
      params: {},
      context: {},
    } as never);

    const result = response as { data: { csrfToken: string } };
    expect(result.data.csrfToken).toBe("test-token");
  });
});
