import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { formDataToObject, parseFormData } from "../form";

const createFormRequest = (data: Record<string, string | string[]>): Request => {
	const formData = new FormData();
	for (const [key, value] of Object.entries(data)) {
		if (Array.isArray(value)) {
			for (const v of value) {
				formData.append(key, v);
			}
		} else {
			formData.append(key, value);
		}
	}

	return new Request("http://localhost/api/form", {
		method: "POST",
		body: formData,
	});
};

describe("form", () => {
	describe("formDataToObject()", () => {
		it("converts form data to a plain object", () => {
			const formData = new FormData();
			formData.append("name", "John");
			formData.append("email", "john@example.com");

			const result = formDataToObject(formData);
			expect(result).toEqual({ name: "John", email: "john@example.com" });
		});

		it("handles multiple values for the same key as array", () => {
			const formData = new FormData();
			formData.append("tags", "a");
			formData.append("tags", "b");
			formData.append("tags", "c");

			const result = formDataToObject(formData);
			expect(result.tags).toEqual(["a", "b", "c"]);
		});

		it("parses JSON-like strings", () => {
			const formData = new FormData();
			formData.append("count", "42");
			formData.append("active", "true");
			formData.append("data", '{"key":"value"}');

			const result = formDataToObject(formData);
			expect(result.count).toBe(42);
			expect(result.active).toBe(true);
			expect(result.data).toEqual({ key: "value" });
		});

		it("keeps non-JSON strings as-is", () => {
			const formData = new FormData();
			formData.append("name", "hello world");
			formData.append("description", "not json at all");

			const result = formDataToObject(formData);
			expect(result.name).toBe("hello world");
			expect(result.description).toBe("not json at all");
		});
	});

	describe("parseFormData()", () => {
		it("returns success with parsed data for valid input", async () => {
			const schema = z.object({
				name: z.string(),
				email: z.string().email(),
			});

			const request = createFormRequest({
				name: "John",
				email: "john@example.com",
			});

			const result = await parseFormData(request, schema);

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					name: "John",
					email: "john@example.com",
				});
			}
		});

		it("returns field-level errors for invalid input", async () => {
			const schema = z.object({
				name: z.string().min(2),
				email: z.string().email(),
			});

			const request = createFormRequest({
				name: "J",
				email: "not-an-email",
			});

			const result = await parseFormData(request, schema);

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.name).toBeDefined();
				expect(result.errors.email).toBeDefined();
				expect(Array.isArray(result.errors.name)).toBe(true);
				expect(Array.isArray(result.errors.email)).toBe(true);
			}
		});

		it("handles missing required fields", async () => {
			const schema = z.object({
				name: z.string(),
				required_field: z.string(),
			});

			const request = createFormRequest({ name: "John" });
			const result = await parseFormData(request, schema);

			expect(result.success).toBe(false);
		});
	});
});
