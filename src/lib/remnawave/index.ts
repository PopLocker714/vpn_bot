import { addDays } from "./addDays";
import createUser from "./createUser";
import getSquads from "./getSquads";
import getUserByTelegramId from "./getUserByTelegramId";
import getUserByUuid from "./getUserByUuid";
import getUsers from "./getUsers";
import updateUser from "./updateUser";

export const remnawaveService = {
    user: {
        getByTelegramId: getUserByTelegramId,
        getByUuid: getUserByUuid,
        create: createUser,
        update: updateUser,
        addDays,
        getAll: getUsers
    },
    squads: {
        getSquads
    }
}
