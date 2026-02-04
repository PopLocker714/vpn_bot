import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const $Referal = sqliteTable("referal", {
    user_id: text({ mode: "text", length: 36 }).notNull().primaryKey(),
    referal_by: text({ mode: "text", length: 36 }),
    referals: text({ mode: "json" }).notNull().$type<string[]>().$defaultFn(() => []),
})

export type TIReferal = typeof $Referal.$inferInsert
export type TSRefaral = typeof $Referal.$inferSelect
