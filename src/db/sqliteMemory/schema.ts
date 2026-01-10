import * as usersSchema from "./schemas/users.schema"

export const schema = {
    ...usersSchema,
}

export type TSqiliteMemorySchema = typeof schema
