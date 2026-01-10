import * as transactionSchema from "./schemas/transaction.schema"

export const schema = {
    ...transactionSchema,
}

export type TSqiliteSchema = typeof schema
