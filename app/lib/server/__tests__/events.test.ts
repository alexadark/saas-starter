import { afterEach, describe, expect, it, vi } from "vitest";
import { emit, on, removeAllListeners } from "../events";

// Augment AppEvents for testing
declare module "../events" {
	interface AppEvents {
		"test.event": { value: string };
		"test.other": { count: number };
	}
}

describe("events", () => {
	afterEach(() => {
		removeAllListeners();
	});

	describe("on()", () => {
		it("registers a handler and returns unsubscribe function", () => {
			const handler = vi.fn();
			const unsub = on("test.event", handler);
			expect(typeof unsub).toBe("function");
		});
	});

	describe("emit()", () => {
		it("fires registered handlers via microtask", async () => {
			const handler = vi.fn();
			on("test.event", handler);

			emit("test.event", { value: "hello" });

			// Handler runs async via queueMicrotask
			expect(handler).not.toHaveBeenCalled();
			await new Promise((r) => setTimeout(r, 10));
			expect(handler).toHaveBeenCalledWith({ value: "hello" });
		});

		it("fires multiple handlers for the same event", async () => {
			const handler1 = vi.fn();
			const handler2 = vi.fn();
			on("test.event", handler1);
			on("test.event", handler2);

			emit("test.event", { value: "multi" });

			await new Promise((r) => setTimeout(r, 10));
			expect(handler1).toHaveBeenCalledOnce();
			expect(handler2).toHaveBeenCalledOnce();
		});

		it("is safe to emit with no handlers registered", () => {
			expect(() => emit("test.event", { value: "noop" })).not.toThrow();
		});

		it("does not call handlers for different events", async () => {
			const handler = vi.fn();
			on("test.other", handler);

			emit("test.event", { value: "wrong" });

			await new Promise((r) => setTimeout(r, 10));
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe("unsubscribe", () => {
		it("removes the handler so it no longer fires", async () => {
			const handler = vi.fn();
			const unsub = on("test.event", handler);
			unsub();

			emit("test.event", { value: "after-unsub" });

			await new Promise((r) => setTimeout(r, 10));
			expect(handler).not.toHaveBeenCalled();
		});
	});

	describe("removeAllListeners()", () => {
		it("clears all handlers when called without arguments", async () => {
			const h1 = vi.fn();
			const h2 = vi.fn();
			on("test.event", h1);
			on("test.other", h2);

			removeAllListeners();

			emit("test.event", { value: "cleared" });
			emit("test.other", { count: 1 });

			await new Promise((r) => setTimeout(r, 10));
			expect(h1).not.toHaveBeenCalled();
			expect(h2).not.toHaveBeenCalled();
		});

		it("clears handlers for a specific event only", async () => {
			const h1 = vi.fn();
			const h2 = vi.fn();
			on("test.event", h1);
			on("test.other", h2);

			removeAllListeners("test.event");

			emit("test.event", { value: "cleared" });
			emit("test.other", { count: 1 });

			await new Promise((r) => setTimeout(r, 10));
			expect(h1).not.toHaveBeenCalled();
			expect(h2).toHaveBeenCalledOnce();
		});
	});

	describe("error handling", () => {
		it("failing handler does not prevent other handlers from running", async () => {
			const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
			const failingHandler = vi.fn(() => {
				throw new Error("boom");
			});
			const successHandler = vi.fn();

			on("test.event", failingHandler);
			on("test.event", successHandler);

			emit("test.event", { value: "test" });

			await new Promise((r) => setTimeout(r, 10));
			expect(failingHandler).toHaveBeenCalled();
			expect(successHandler).toHaveBeenCalled();
			expect(consoleSpy).toHaveBeenCalled();

			consoleSpy.mockRestore();
		});
	});
});
