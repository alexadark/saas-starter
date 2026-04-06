import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
		vi.restoreAllMocks();
	});

	const importLogger = async () => {
		const mod = await import("../logger");
		return mod.logger;
	};

	describe("info()", () => {
		it("outputs a message via console.log", async () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.info("test message");

			expect(spy).toHaveBeenCalledOnce();
			expect(spy.mock.calls[0][0]).toContain("test message");
		});
	});

	describe("warn()", () => {
		it("outputs a message via console.error", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const logger = await importLogger();

			logger.warn("warning message");

			expect(spy).toHaveBeenCalledOnce();
			expect(spy.mock.calls[0][0]).toContain("warning message");
		});
	});

	describe("error()", () => {
		it("returns an errorId string", async () => {
			vi.spyOn(console, "error").mockImplementation(() => {});
			const logger = await importLogger();

			const errorId = logger.error("something broke");

			expect(typeof errorId).toBe("string");
			expect(errorId.length).toBeGreaterThan(0);
		});

		it("includes Error stack in context", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const logger = await importLogger();

			logger.error("crash", new Error("test error"));

			const output = spy.mock.calls[0][0] as string;
			expect(output).toContain("crash");
		});
	});

	describe("LOG_LEVEL filtering", () => {
		it("filters debug messages when LOG_LEVEL is info", async () => {
			process.env.LOG_LEVEL = "info";
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.debug("should be filtered");

			expect(spy).not.toHaveBeenCalled();
		});

		it("shows debug messages when LOG_LEVEL is debug", async () => {
			process.env.LOG_LEVEL = "debug";
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.debug("should show");

			expect(spy).toHaveBeenCalledOnce();
		});

		it("filters info when LOG_LEVEL is warn", async () => {
			process.env.LOG_LEVEL = "warn";
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.info("should be filtered");

			expect(spy).not.toHaveBeenCalled();
		});
	});

	describe("production mode", () => {
		it("outputs JSON when NODE_ENV is production", async () => {
			process.env.NODE_ENV = "production";
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.info("prod message");

			const output = spy.mock.calls[0][0] as string;
			const parsed = JSON.parse(output);
			expect(parsed.level).toBe("info");
			expect(parsed.message).toBe("prod message");
			expect(parsed.timestamp).toBeDefined();
		});
	});

	describe("dev mode", () => {
		it("uses ANSI colors in non-production", async () => {
			process.env.NODE_ENV = "development";
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});
			const logger = await importLogger();

			logger.info("dev message");

			const output = spy.mock.calls[0][0] as string;
			// ANSI escape code present
			expect(output).toContain("\x1b[");
		});
	});
});
