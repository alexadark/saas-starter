/**
 * Server utilities barrel export.
 *
 * Import everything from `~/lib/server` instead of individual files.
 *
 * @example
 * ```ts
 * import { logger, emit, on, createRateLimiter, parseFormData, isEnabled, getConfig } from "~/lib/server";
 * ```
 */

// JSONB config
export { deleteConfig, getConfig, getConfigCascade, setConfig } from "./config";
// Event bus
export {
  type AppEvents,
  type EventHandler,
  emit,
  on,
  removeAllListeners,
} from "./events";
// Feature flags
export { getEnabledFlags, isEnabled } from "./features";
// Form validation
export { formDataToObject, parseFormData } from "./form";
// Logger
export { logger } from "./logger";
// CSRF protection
export { generateCsrfToken, setCsrfCookie, validateCsrf } from "./csrf";
// Rate limiter
export {
  createRateLimiter,
  getRateLimitHeaders,
  type RateLimitResult,
} from "./rate-limit";
