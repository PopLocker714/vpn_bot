import * as referalSchema from "./schemas/referal.schema";
import * as transactionSchema from "./schemas/transaction.schema";

export const schema = {
    ...transactionSchema,
    ...referalSchema,
};

export type TSqiliteSchema = typeof schema;
