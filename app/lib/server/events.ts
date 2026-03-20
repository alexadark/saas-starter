/**
 * Typed in-process event bus with module augmentation support.
 *
 * @example
 * ```ts
 * // events.d.ts — declare your app events
 * declare module "~/lib/server/events" {
 *   interface AppEvents {
 *     "user.created": { userId: string; email: string };
 *     "order.placed": { orderId: string; total: number };
 *   }
 * }
 *
 * // usage
 * import { on, emit } from "~/lib/server/events";
 *
 * const unsub = on("user.created", ({ userId }) => {
 *   console.log("New user:", userId);
 * });
 *
 * emit("user.created", { userId: "123", email: "a@example.com" });
 *
 * unsub(); // unregister
 * ```
 */

// biome-ignore lint/suspicious/noEmptyInterface: intentionally empty for module augmentation
export interface AppEvents {}

export type EventHandler<T> = (payload: T) => void;

type AnyEventHandler = EventHandler<unknown>;

const handlers = new Map<string, Set<AnyEventHandler>>();

/**
 * Register a handler for the given event key.
 * Returns an unsubscribe function.
 */
export const on = <K extends string & keyof AppEvents>(
  event: K,
  handler: EventHandler<AppEvents[K]>,
): (() => void) => {
  if (!handlers.has(event)) {
    handlers.set(event, new Set());
  }

  const set = handlers.get(event) as Set<AnyEventHandler>;
  set.add(handler as AnyEventHandler);

  return () => {
    set.delete(handler as AnyEventHandler);
    if (set.size === 0) {
      handlers.delete(event);
    }
  };
};

/**
 * Fire-and-forget event emission.
 * Each handler runs inside its own try/catch via queueMicrotask.
 */
export const emit = <K extends string & keyof AppEvents>(
  event: K,
  payload: AppEvents[K],
): void => {
  const set = handlers.get(event);
  if (!set) return;

  for (const handler of set) {
    const captured = handler;
    queueMicrotask(() => {
      try {
        captured(payload as unknown);
      } catch (err) {
        console.error(`[events] Handler error for "${event}":`, err);
      }
    });
  }
};

/**
 * Remove all handlers for a specific event, or all events if no key is given.
 */
export const removeAllListeners = (event?: string & keyof AppEvents): void => {
  if (event !== undefined) {
    handlers.delete(event);
  } else {
    handlers.clear();
  }
};
