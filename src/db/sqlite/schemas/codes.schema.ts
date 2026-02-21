import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const $codes = sqliteTable("codes", {
    id: int("id").primaryKey({ autoIncrement: true }),
    code: text({ length: 20 }).notNull().unique(),
    maxUses: int("max_uses").notNull().default(1000),
    usesCount: int("uses_count").notNull().default(0),
    activeUsersUuid: text({ mode: "json" })
        .notNull()
        .$type<string[]>()
        .$defaultFn(() => []),
    disabled: int("disabled", { mode: "boolean" }).notNull().default(false),
    expireAt: int("expire_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
});

export type TICodes = typeof $codes.$inferInsert;
export type TSCodes = typeof $codes.$inferSelect;
