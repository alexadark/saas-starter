import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../db/schema";
import { featureFlags } from "../db/schema";

type DB = PostgresJsDatabase<typeof schema>;

interface FlagOptions {
	orgId?: string;
}

export const isEnabled = async (
	db: DB,
	flagKey: string,
	options?: FlagOptions,
): Promise<boolean> => {
	const [flag] = await db.select().from(featureFlags).where(eq(featureFlags.key, flagKey)).limit(1);

	if (!flag) return false;

	if (options?.orgId) {
		const orgs = (flag.metadata as { orgs?: Record<string, boolean> }).orgs;
		if (orgs && options.orgId in orgs) {
			return orgs[options.orgId];
		}
	}

	return flag.enabled;
};

export const getEnabledFlags = async (db: DB, options?: FlagOptions): Promise<Set<string>> => {
	const flags = await db.select().from(featureFlags);
	const enabled = new Set<string>();

	for (const flag of flags) {
		if (options?.orgId) {
			const orgs = (flag.metadata as { orgs?: Record<string, boolean> }).orgs;
			if (orgs && options.orgId in orgs) {
				if (orgs[options.orgId]) {
					enabled.add(flag.key);
				}
				continue;
			}
		}

		if (flag.enabled) {
			enabled.add(flag.key);
		}
	}

	return enabled;
};
