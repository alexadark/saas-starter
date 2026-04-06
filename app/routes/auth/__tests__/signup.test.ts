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
		remaining: 4,
		resetAt: new Date(),
		max: 5,
	}),
	getRateLimitHeaders: () => ({}),
}));

const mockCreateSupabase = createSupabaseServerClient as ReturnType<typeof vi.fn>;

const buildFormRequest = (fields: Record<string, string>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}
	return new Request("http://localhost/auth/signup", {
		method: "POST",
		body: formData,
		headers: {
			Cookie: "__csrf=test-token",
		},
	});
};

describe("auth/signup action", () => {
	it("returns 400 with fieldErrors when password is too short", async () => {
		const { action } = await import("../signup");
		const request = buildFormRequest({
			email: "test@example.com",
			password: "short",
			_csrf: "test-token",
		});

		const response = await action({
			request,
			params: {},
			context: {},
		} as never);

		const result = response as {
			data: { fieldErrors: Record<string, string[]> };
			init: { status: number };
		};
		expect(result.init.status).toBe(400);
		expect(result.data.fieldErrors).toBeDefined();
		expect(result.data.fieldErrors.password).toBeDefined();
		expect(result.data.fieldErrors.password[0]).toContain("at least 8");
	});

	it("returns 400 with fieldErrors when email is invalid", async () => {
		const { action } = await import("../signup");
		const request = buildFormRequest({
			email: "not-an-email",
			password: "validpassword123",
			_csrf: "test-token",
		});

		const response = await action({
			request,
			params: {},
			context: {},
		} as never);

		const result = response as {
			data: { fieldErrors: Record<string, string[]> };
			init: { status: number };
		};
		expect(result.init.status).toBe(400);
		expect(result.data.fieldErrors).toBeDefined();
		expect(result.data.fieldErrors.email).toBeDefined();
	});

	it("redirects to /auth/verify-email on successful signup", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					signUp: vi.fn().mockResolvedValue({ error: null }),
				},
			},
			headers: new Headers(),
		});

		const { action } = await import("../signup");
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
		expect((response as Response).headers.get("Location")).toBe("/auth/verify-email");
	});

	it("returns error message when Supabase signup fails", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					signUp: vi.fn().mockResolvedValue({ error: { message: "User already exists" } }),
				},
			},
			headers: new Headers(),
		});

		const { action } = await import("../signup");
		const request = buildFormRequest({
			email: "existing@example.com",
			password: "validpassword123",
			_csrf: "test-token",
		});

		const response = await action({
			request,
			params: {},
			context: {},
		} as never);

		const result = response as {
			data: { error: string };
			init: { status: number };
		};
		expect(result.init.status).toBe(400);
		expect(result.data.error).toBe("User already exists");
	});
});
