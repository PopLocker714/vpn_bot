import * as userStateSchema from "./schemas/userState.schema";
import * as usersSchema from "./schemas/users.schema";

export const schema = {
    ...usersSchema,
    ...userStateSchema,
};

export type TSqiliteMemorySchema = typeof schema;
