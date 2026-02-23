import { and, eq } from "drizzle-orm";
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
	for (const scope of scopes) {
		const value = await getConfig(db, scope, key, zodSchema);
		if (value !== null) return value;
	}
	return null;
};

export const setConfig = async (
	db: DB,
	scope: string,
	key: string,
	value: unknown,
): Promise<void> => {
	const [existing] = await db
		.select({ id: appConfig.id })
		.from(appConfig)
		.where(and(eq(appConfig.scope, scope), eq(appConfig.key, key)))
		.limit(1);

	if (existing) {
		await db
			.update(appConfig)
			.set({ value, updatedAt: new Date() })
			.where(and(eq(appConfig.scope, scope), eq(appConfig.key, key)));
	} else {
		await db.insert(appConfig).values({ scope, key, value });
	}
};

export const deleteConfig = async (db: DB, scope: string, key: string): Promise<void> => {
	await db.delete(appConfig).where(and(eq(appConfig.scope, scope), eq(appConfig.key, key)));
};
