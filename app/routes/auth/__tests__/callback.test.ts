import { describe, expect, it, vi } from "vitest";
import { createSupabaseServerClient } from "~/lib/supabase/server";

vi.mock("~/lib/supabase/server", () => ({
	createSupabaseServerClient: vi.fn(),
}));

const mockCreateSupabase = createSupabaseServerClient as ReturnType<typeof vi.fn>;

const setupMock = (exchangeResult: { error: Error | null }) => {
	const mockExchangeCode = vi.fn().mockResolvedValue(exchangeResult);
	mockCreateSupabase.mockReturnValue({
		supabase: {
			auth: {
				exchangeCodeForSession: mockExchangeCode,
			},
		},
		headers: new Headers(),
	});
	return mockExchangeCode;
};

describe("auth/callback loader", () => {
	it("redirects to /auth/login when no code param is present", async () => {
		setupMock({ error: null });

		const { loader } = await import("../callback");
		const request = new Request("http://localhost/auth/callback");
		const response = await loader({
			request,
			params: {},
			context: {},
		} as never);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/auth/login");
	});

	it("redirects to /auth/login?error=invalid_callback when exchange fails", async () => {
		setupMock({ error: new Error("exchange failed") });

		const { loader } = await import("../callback");
		const request = new Request("http://localhost/auth/callback?code=bad-code");
		const response = await loader({
			request,
			params: {},
			context: {},
		} as never);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/auth/login?error=invalid_callback");
	});

	it("redirects to /dashboard on successful code exchange", async () => {
		setupMock({ error: null });

		const { loader } = await import("../callback");
		const request = new Request("http://localhost/auth/callback?code=valid-code");
		const response = await loader({
			request,
			params: {},
			context: {},
		} as never);

		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/dashboard");
	});
});
