import { describe, expect, it, vi } from "vitest";

vi.mock("drizzle-orm", () => ({
	eq: (col: unknown, val: unknown) => ({ op: "eq", col, val }),
}));

describe("features", () => {
	const createMockDb = () => {
		const mockChain = {
			from: vi.fn().mockReturnThis(),
			where: vi.fn().mockReturnThis(),
			limit: vi.fn().mockResolvedValue([]),
		};

		return {
			select: vi.fn().mockReturnValue(mockChain),
			_chain: mockChain,
		};
	};

	describe("isEnabled()", () => {
		it("returns true for an enabled flag", async () => {
			const { isEnabled } = await import("../features");
			const db = createMockDb();
			db._chain.limit.mockResolvedValue([{ key: "dark-mode", enabled: true, metadata: {} }]);

			const result = await isEnabled(db as never, "dark-mode");
			expect(result).toBe(true);
		});

		it("returns false for a disabled flag", async () => {
			const { isEnabled } = await import("../features");
			const db = createMockDb();
			db._chain.limit.mockResolvedValue([{ key: "dark-mode", enabled: false, metadata: {} }]);

			const result = await isEnabled(db as never, "dark-mode");
			expect(result).toBe(false);
		});

		it("returns false for a missing flag", async () => {
			const { isEnabled } = await import("../features");
			const db = createMockDb();
			db._chain.limit.mockResolvedValue([]);

			const result = await isEnabled(db as never, "nonexistent");
			expect(result).toBe(false);
		});

		it("respects org-level override when orgId provided", async () => {
			const { isEnabled } = await import("../features");
			const db = createMockDb();
			db._chain.limit.mockResolvedValue([
				{
					key: "beta-feature",
					enabled: false,
					metadata: { orgs: { "org-42": true } },
				},
			]);

			// Global is false, but org-42 override is true
			const result = await isEnabled(db as never, "beta-feature", {
				orgId: "org-42",
			});
			expect(result).toBe(true);
		});

		it("falls back to global when org has no override", async () => {
			const { isEnabled } = await import("../features");
			const db = createMockDb();
			db._chain.limit.mockResolvedValue([
				{
					key: "beta-feature",
					enabled: true,
					metadata: { orgs: { "org-42": false } },
				},
			]);

			// org-99 has no override, should fall back to global (true)
			const result = await isEnabled(db as never, "beta-feature", {
				orgId: "org-99",
			});
			expect(result).toBe(true);
		});
	});

	describe("getEnabledFlags()", () => {
		it("returns a Set of enabled flag keys", async () => {
			const { getEnabledFlags } = await import("../features");
			const db = createMockDb();
			// For getEnabledFlags, select().from() returns all rows directly
			db._chain.from.mockResolvedValue([
				{ key: "flag-a", enabled: true, metadata: {} },
				{ key: "flag-b", enabled: false, metadata: {} },
				{ key: "flag-c", enabled: true, metadata: {} },
			]);

			const result = await getEnabledFlags(db as never);
			expect(result).toBeInstanceOf(Set);
			expect(result.has("flag-a")).toBe(true);
			expect(result.has("flag-b")).toBe(false);
			expect(result.has("flag-c")).toBe(true);
		});

		it("respects org override in getEnabledFlags", async () => {
			const { getEnabledFlags } = await import("../features");
			const db = createMockDb();
			db._chain.from.mockResolvedValue([
				{
					key: "flag-a",
					enabled: true,
					metadata: { orgs: { "org-1": false } },
				},
				{
					key: "flag-b",
					enabled: false,
					metadata: { orgs: { "org-1": true } },
				},
			]);

			const result = await getEnabledFlags(db as never, { orgId: "org-1" });
			// flag-a is globally true but org-1 override is false
			expect(result.has("flag-a")).toBe(false);
			// flag-b is globally false but org-1 override is true
			expect(result.has("flag-b")).toBe(true);
		});
	});
});
