import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const $codes = sqliteTable("codes", {
    id: int("id").primaryKey({ autoIncrement: true }),
    code: text({ length: 20 }).notNull().unique(),
    maxUses: int("max_uses").notNull().default(1000),
    usesCount: int("uses_count").notNull().default(0),
    disabled: int("disabled", { mode: "boolean" }).notNull().default(false),
    expireAt: int("expire_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)),
});

export const $codeUses = sqliteTable("code_uses", {
    codeId: int("code_id")
        .notNull()
        .primaryKey()
        .references(() => $codes.id),
    userUuid: text("user_uuid").notNull().primaryKey(),
    usedAt: int("used_at", { mode: "timestamp" })
        .notNull()
        .$defaultFn(() => new Date()),
});

// Один код может иметь много использований
export const codesRelations = relations($codes, ({ many }) => ({
    uses: many($codeUses),
}));

// Каждое использование относится к одному коду
export const codeUsesRelations = relations($codeUses, ({ one }) => ({
    code: one($codes, {
        fields: [$codeUses.codeId],
        references: [$codes.id],
    }),
}));

export type TICodes = typeof $codes.$inferInsert;
export type TSCodes = typeof $codes.$inferSelect;

export type TICodeUses = typeof $codeUses.$inferInsert;
export type TSCodeUses = typeof $codeUses.$inferSelect;
