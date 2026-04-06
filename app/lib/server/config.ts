import { and, eq, inArray } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { z } from "zod";
import type * as schema from "../db/schema";
import { appConfig } from "../db/schema";

type DB = PostgresJsDatabase<typeof schema>;

export const getConfig = async <T>(
  db: DB,
  scope: string,
  key: string,
  zodSchema: z.ZodType<T>,
): Promise<T | null> => {
  const [row] = await db
    .select()
    .from(appConfig)
    .where(and(eq(appConfig.scope, scope), eq(appConfig.key, key)))
    .limit(1);

  if (!row) return null;

  const result = zodSchema.safeParse(row.value);
  return result.success ? result.data : null;
};

export const getConfigCascade = async <T>(
  db: DB,
  key: string,
  zodSchema: z.ZodType<T>,
  scopes: string[],
): Promise<T | null> => {
  const rows = await db
    .select()
    .from(appConfig)
    .where(and(eq(appConfig.key, key), inArray(appConfig.scope, scopes)));

  for (const scope of scopes) {
    const row = rows.find((r) => r.scope === scope);
    if (row) {
      const result = zodSchema.safeParse(row.value);
      if (result.success) return result.data;
    }
  }
  return null;
};

export const setConfig = async (
  db: DB,
  scope: string,
  key: string,
  value: unknown,
): Promise<void> => {
  await db
    .insert(appConfig)
    .values({ scope, key, value })
    .onConflictDoUpdate({
      target: [appConfig.scope, appConfig.key],
      set: { value, updatedAt: new Date() },
    });
};

export const deleteConfig = async (
  db: DB,
  scope: string,
  key: string,
): Promise<void> => {
  await db
    .delete(appConfig)
    .where(and(eq(appConfig.scope, scope), eq(appConfig.key, key)));
};
