import * as transactionSchema from "./schemas/transaction.schema"
import * as referalSchema from "./schemas/referal.schema"

export const schema = {
    ...transactionSchema,
    ...referalSchema
}

export type TSqiliteSchema = typeof schema
