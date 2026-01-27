// import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

// export const $codes = sqliteTable("codes", {
//     code: text({ mode: "text", length: 20 }).notNull().unique(),
//     maxUses: int("max_uses").notNull().default(10),
//     expireAt: int("expire_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date(Date.now() + 1000 * 60 * 60 * 24 * 30))
// })

// export type TICodes = typeof $codes.$inferInsert
// export type TSCodes = typeof $codes.$inferSelect
