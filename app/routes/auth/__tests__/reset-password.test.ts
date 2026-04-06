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

const mockCreateSupabase = createSupabaseServerClient as ReturnType<typeof vi.fn>;

const buildFormRequest = (fields: Record<string, string>) => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(fields)) {
		formData.set(key, value);
	}
	return new Request("http://localhost/auth/reset-password", {
		method: "POST",
		body: formData,
		headers: {
			Cookie: "__csrf=test-token",
		},
	});
};

describe("auth/reset-password loader", () => {
	it("redirects to /auth/forgot-password when no user is authenticated", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
				},
			},
			headers: new Headers(),
		});

		const { loader } = await import("../reset-password");
		const request = new Request("http://localhost/auth/reset-password");
		const response = await loader({
			request,
			params: {},
			context: {},
		} as never);

		expect((response as Response).status).toBe(302);
		expect((response as Response).headers.get("Location")).toBe("/auth/forgot-password");
	});

	it("returns CSRF token when user is authenticated", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-123" } } }),
				},
			},
			headers: new Headers(),
		});

		const { loader } = await import("../reset-password");
		const request = new Request("http://localhost/auth/reset-password");
		const response = await loader({
			request,
			params: {},
			context: {},
		} as never);

		const result = response as { data: { csrfToken: string } };
		expect(result.data.csrfToken).toBe("test-token");
	});
});

describe("auth/reset-password action", () => {
	it("redirects to /dashboard on successful password update", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					updateUser: vi.fn().mockResolvedValue({ error: null }),
				},
			},
			headers: new Headers(),
		});

		const { action } = await import("../reset-password");
		const request = buildFormRequest({
			password: "newstrongpassword123",
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

	it("returns error when Supabase updateUser fails", async () => {
		mockCreateSupabase.mockReturnValue({
			supabase: {
				auth: {
					updateUser: vi.fn().mockResolvedValue({
						error: { message: "Password too weak" },
					}),
				},
			},
			headers: new Headers(),
		});

		const { action } = await import("../reset-password");
		const request = buildFormRequest({
			password: "newpassword123",
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
		expect(result.data.error).toBe("Password too weak");
	});
});
