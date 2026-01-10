import type { SuccessfulPayment } from '@effect-ak/tg-bot-api'
import { sql } from "drizzle-orm"
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const $Transactions = sqliteTable("transactions", {
    provider_payment_charge_id: text().primaryKey().notNull(),
    telegram_payment_charge_id: text().notNull(),
    user_id: text({ mode: "text", length: 36 }).notNull(),
    data: text({ mode: "json" }).notNull().$type<SuccessfulPayment>(),
    create_at: int({ mode: "timestamp" }).notNull().default(sql`(unixepoch())`)
})

export type TITransactions = typeof $Transactions.$inferInsert
export type TSTransactions = typeof $Transactions.$inferSelect
