import * as codesSchema from "./schemas/codes.schema";
import * as referalSchema from "./schemas/referal.schema";
import * as transactionSchema from "./schemas/transaction.schema";

export const schema = {
    ...transactionSchema,
    ...referalSchema,
    ...codesSchema,
};

export type TSqiliteSchema = typeof schema;
