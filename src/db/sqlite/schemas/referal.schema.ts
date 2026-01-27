// import { sqliteTable, text } from "drizzle-orm/sqlite-core"

// export const $referal = sqliteTable("referal", {
//     user_id: text({ mode: "text", length: 36 }).notNull().primaryKey(),
//     referal_by: text({ mode: "text", length: 36 }),
//     referals: text({ mode: "json" }).notNull().$type<string[]>(),
// })

// export type TIReferal = typeof $referal.$inferInsert
// export type TSRefaral = typeof $referal.$inferSelect
