import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const featureFlags = pgTable("feature_flags", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appConfig = pgTable(
  "app_config",
  {
    id: serial("id").primaryKey(),
    scope: text("scope").notNull(),
    key: text("key").notNull(),
    value: jsonb("value").$type<unknown>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    scopeKeyUnique: unique("app_config_scope_key_unique").on(
      table.scope,
      table.key,
    ),
  }),
);
