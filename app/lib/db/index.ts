import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "~/lib/env.server";
import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let _db: DrizzleDb | null = null;

export const getDb = (): DrizzleDb => {
  if (!_db) {
    const client = postgres(env.DATABASE_URL, { max: 1, prepare: false });
    _db = drizzle(client, { schema });
  }
  return _db;
};

export const db = new Proxy({} as DrizzleDb, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});
