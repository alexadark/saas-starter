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

// Event bus
export {
  type AppEvents,
  type EventHandler,
  on,
  emit,
  removeAllListeners,
} from "./events";

// Logger
export { logger } from "./logger";

// Rate limiter
export {
  type RateLimitResult,
  createRateLimiter,
  getRateLimitHeaders,
} from "./rate-limit";

// JSONB config
export { getConfig, getConfigCascade, setConfig, deleteConfig } from "./config";

// Feature flags
export { isEnabled, getEnabledFlags } from "./features";

// Form validation
export { formDataToObject, parseFormData } from "./form";
