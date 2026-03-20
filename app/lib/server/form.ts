import type { z } from "zod/v4";

/**
 * Converts a FormData instance to a plain Record<string, unknown>.
 *
 * - Multiple values for the same key become an array.
 * - Values that look like JSON (start with `{`, `[`, `"`, or are `true`/`false`/`null`/numeric)
 *   are parsed via JSON.parse. If parsing fails, the raw string is kept.
 */
export const formDataToObject = (
  formData: FormData,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const key of formData.keys()) {
    const values = formData.getAll(key);
    const parsed = values.map(tryParseJson);
    result[key] = parsed.length === 1 ? parsed[0] : parsed;
  }

  return result;
};

const JSON_LIKE = /^(\{|\[|"|true$|false$|null$|-?\d)/;

const tryParseJson = (value: FormDataEntryValue): unknown => {
  if (typeof value !== "string") return value;
  if (!JSON_LIKE.test(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

type ParseSuccess<T> = { success: true; data: T };
type ParseFailure = { success: false; errors: Record<string, string[]> };
type ParseResult<T> = ParseSuccess<T> | ParseFailure;

/**
 * Reads FormData from a Request, converts it to an object, and validates it
 * against the provided Zod schema.
 *
 * Returns `{ success: true, data }` on success or
 * `{ success: false, errors }` with field-level error arrays on failure.
 */
export const parseFormData = async <T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<ParseResult<T>> => {
  const formData = await request.formData();
  const raw = formDataToObject(formData);

  const result = schema.safeParse(raw);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string[]> = {};
  for (const issue of result.error.issues) {
    const field = issue.path.join(".") || "_form";
    if (!errors[field]) {
      errors[field] = [];
    }
    errors[field].push(issue.message);
  }

  return { success: false, errors };
};
