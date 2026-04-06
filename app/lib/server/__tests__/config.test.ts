import { describe, expect, it, vi } from "vitest";
import { z } from "zod/v4";

// Mock Drizzle's operators - they need to return identifiable objects
vi.mock("drizzle-orm", () => ({
  eq: (col: unknown, val: unknown) => ({ op: "eq", col, val }),
  and: (...args: unknown[]) => ({ op: "and", args }),
  inArray: (col: unknown, vals: unknown) => ({ op: "inArray", col, vals }),
}));

describe("config", () => {
  const createMockDb = () => {
    const mockChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      set: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue([]),
    };

    return {
      select: vi.fn().mockReturnValue(mockChain),
      insert: vi.fn().mockReturnValue(mockChain),
      update: vi.fn().mockReturnValue(mockChain),
      delete: vi.fn().mockReturnValue(mockChain),
      _chain: mockChain,
    };
  };

  describe("getConfig()", () => {
    it("returns typed value when found and valid", async () => {
      const { getConfig } = await import("../config");
      const db = createMockDb();
      db._chain.limit.mockResolvedValue([
        { scope: "global", key: "theme", value: "dark" },
      ]);

      const result = await getConfig(
        db as never,
        "global",
        "theme",
        z.string(),
      );

      expect(result).toBe("dark");
    });

    it("returns null when not found", async () => {
      const { getConfig } = await import("../config");
      const db = createMockDb();
      db._chain.limit.mockResolvedValue([]);

      const result = await getConfig(
        db as never,
        "global",
        "missing",
        z.string(),
      );

      expect(result).toBeNull();
    });

    it("returns null when value fails Zod validation", async () => {
      const { getConfig } = await import("../config");
      const db = createMockDb();
      db._chain.limit.mockResolvedValue([
        { scope: "global", key: "count", value: "not-a-number" },
      ]);

      const result = await getConfig(
        db as never,
        "global",
        "count",
        z.number(),
      );

      expect(result).toBeNull();
    });
  });

  describe("getConfigCascade()", () => {
    it("resolves in order, returning first match", async () => {
      const { getConfigCascade } = await import("../config");
      const db = createMockDb();
      // Single query returns all matching rows; cascade picks first scope match
      db._chain.where.mockResolvedValue([
        { scope: "org:1", key: "theme", value: "blue" },
      ]);

      const result = await getConfigCascade(db as never, "theme", z.string(), [
        "user:123",
        "org:1",
        "global",
      ]);

      expect(result).toBe("blue");
      expect(db.select).toHaveBeenCalledTimes(1);
    });

    it("returns null when no scope has the config", async () => {
      const { getConfigCascade } = await import("../config");
      const db = createMockDb();
      db._chain.where.mockResolvedValue([]);

      const result = await getConfigCascade(
        db as never,
        "missing",
        z.string(),
        ["user:1", "global"],
      );

      expect(result).toBeNull();
    });
  });

  describe("setConfig()", () => {
    it("uses upsert (single query)", async () => {
      const { setConfig } = await import("../config");
      const db = createMockDb();

      await setConfig(db as never, "global", "theme", "dark");

      expect(db.insert).toHaveBeenCalled();
      expect(db._chain.onConflictDoUpdate).toHaveBeenCalled();
    });
  });

  describe("deleteConfig()", () => {
    it("calls delete on the db", async () => {
      const { deleteConfig } = await import("../config");
      const db = createMockDb();

      await deleteConfig(db as never, "global", "theme");

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
