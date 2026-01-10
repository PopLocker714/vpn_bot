import createUser from "./createUser";
import getSquads from "./getSquads";
import getUserByTelegramId from "./getUserByTelegramId";
import updateUser from "./updateUser";

export const rw = {
    user: {
        getByTelegramId: getUserByTelegramId,
        create: createUser,
        update: updateUser
    },
    squads: {
        getSquads
    }
}
