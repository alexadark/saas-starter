import { afterEach, describe, expect, it, vi } from "vitest";
import { createRateLimiter, getRateLimitHeaders } from "../rate-limit";

const makeRequest = (ip = "192.168.1.1"): Request =>
	new Request("http://localhost/api/test", {
		headers: { "x-forwarded-for": ip },
	});

describe("rate-limit", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("createRateLimiter()", () => {
		it("allows requests under the limit", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
			const result = limiter(makeRequest());

			expect(result.allowed).toBe(true);
			expect(result.remaining).toBe(4);
			expect(result.max).toBe(5);
		});

		it("blocks requests at the limit", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
			const req = makeRequest();

			limiter(req);
			limiter(req);
			limiter(req);
			const result = limiter(req);

			expect(result.allowed).toBe(false);
			expect(result.remaining).toBe(0);
		});

		it("tracks different IPs separately", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 2 });

			limiter(makeRequest("10.0.0.1"));
			limiter(makeRequest("10.0.0.1"));
			const blocked = limiter(makeRequest("10.0.0.1"));

			const other = limiter(makeRequest("10.0.0.2"));

			expect(blocked.allowed).toBe(false);
			expect(other.allowed).toBe(true);
		});

		it("resets after window expires", () => {
			vi.useFakeTimers();
			const limiter = createRateLimiter({ windowMs: 1_000, max: 1 });
			const req = makeRequest();

			limiter(req);
			const blocked = limiter(req);
			expect(blocked.allowed).toBe(false);

			vi.advanceTimersByTime(1_001);

			const afterReset = limiter(req);
			expect(afterReset.allowed).toBe(true);

			vi.useRealTimers();
		});

		it("returns resetAt as a Date", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 5 });
			const result = limiter(makeRequest());

			expect(result.resetAt).toBeInstanceOf(Date);
		});

		it("extracts IP from x-real-ip when x-forwarded-for is absent", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
			const req = new Request("http://localhost/api", {
				headers: { "x-real-ip": "172.16.0.1" },
			});

			limiter(req);
			const result = limiter(req);
			expect(result.allowed).toBe(false);

			// Different IP via x-forwarded-for should be allowed
			const otherReq = makeRequest("172.16.0.2");
			expect(limiter(otherReq).allowed).toBe(true);
		});

		it("prefers x-real-ip over x-forwarded-for", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
			const req = new Request("http://localhost/api", {
				headers: {
					"x-real-ip": "10.0.0.1",
					"x-forwarded-for": "192.168.1.1, 172.16.0.5",
				},
			});

			limiter(req);
			const result = limiter(req);
			// Should be blocked under 10.0.0.1 (from x-real-ip), not 172.16.0.5 (last of x-forwarded-for)
			expect(result.allowed).toBe(false);

			// A request identified only by x-forwarded-for last value should be a different bucket
			const otherReq = new Request("http://localhost/api", {
				headers: { "x-forwarded-for": "192.168.1.1, 172.16.0.5" },
			});
			expect(limiter(otherReq).allowed).toBe(true);
		});

		it("uses last value of x-forwarded-for (not first)", () => {
			const limiter = createRateLimiter({ windowMs: 60_000, max: 1 });
			const req = new Request("http://localhost/api", {
				headers: { "x-forwarded-for": "spoofed.ip, real.proxy.ip" },
			});

			limiter(req);
			const blocked = limiter(req);
			expect(blocked.allowed).toBe(false);

			// Request from the spoofed IP (first value) should be a different bucket
			const spoofReq = new Request("http://localhost/api", {
				headers: { "x-forwarded-for": "real.proxy.ip, spoofed.ip" },
			});
			expect(limiter(spoofReq).allowed).toBe(true);
		});
	});

	describe("getRateLimitHeaders()", () => {
		it("returns standard rate limit headers", () => {
			const result = {
				allowed: true,
				remaining: 4,
				resetAt: new Date(Date.now() + 60_000),
				max: 5,
			};

			const headers = getRateLimitHeaders(result);

			expect(headers["X-RateLimit-Limit"]).toBe("5");
			expect(headers["X-RateLimit-Remaining"]).toBe("4");
			expect(headers["X-RateLimit-Reset"]).toBeDefined();
		});

		it("includes Retry-After only when blocked", () => {
			const allowedResult = {
				allowed: true,
				remaining: 1,
				resetAt: new Date(Date.now() + 30_000),
				max: 5,
			};
			expect(getRateLimitHeaders(allowedResult)["Retry-After"]).toBeUndefined();

			const blockedResult = {
				allowed: false,
				remaining: 0,
				resetAt: new Date(Date.now() + 30_000),
				max: 5,
			};
			expect(getRateLimitHeaders(blockedResult)["Retry-After"]).toBeDefined();
		});
	});
});
