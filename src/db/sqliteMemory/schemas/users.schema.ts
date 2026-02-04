import { CreateUserCommand } from "@remnawave/backend-contract"
import { sql } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const $Users_c = sqliteTable("users", {
    id: int().primaryKey().notNull(),
    data: text({ mode: "json" }).notNull().$type<CreateUserCommand.Response['response']>(),
    tg_id: int(),
    uuid: text({ mode: "text", length: 36 }),
    exp: int({ mode: 'timestamp' }).notNull()
        .$defaultFn(() =>
            sql`(strftime('%s','now') + 3600)`)
})

export type TIUser = typeof $Users_c.$inferInsert
export type TSUser = typeof $Users_c.$inferSelect
