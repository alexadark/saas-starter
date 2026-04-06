import { randomBytes } from "node:crypto";

const CSRF_COOKIE = "__csrf";
const CSRF_FIELD = "_csrf";

/**
 * Generate a random 32-byte hex CSRF token.
 */
export const generateCsrfToken = (): string => {
  return randomBytes(32).toString("hex");
};

/**
 * Append an HttpOnly, SameSite=Strict, Secure CSRF cookie to the response headers.
 */
export const setCsrfCookie = (headers: Headers, token: string): void => {
  headers.append(
    "Set-Cookie",
    `${CSRF_COOKIE}=${token}; HttpOnly; SameSite=Strict; Secure; Path=/`,
  );
};

/**
 * Validate the CSRF token from the cookie against the form field value.
 * Throws a 403 Response on mismatch or missing token.
 */
export const validateCsrf = (request: Request, formData: FormData): void => {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [key, ...rest] = c.trim().split("=");
      return [key, rest.join("=")];
    }),
  );

  const cookieToken = cookies[CSRF_COOKIE];
  const formToken = formData.get(CSRF_FIELD);

  if (!cookieToken || !formToken || cookieToken !== formToken) {
    throw new Response("Forbidden", { status: 403 });
  }
};
