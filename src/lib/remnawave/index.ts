import { addDays } from "./addDays";
import createUser from "./createUser";
import deleteUser from "./deleteUser";
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
		delete: deleteUser,
		addDays,
		getAll: getUsers,
	},
	squads: {
		getSquads,
	},
};
