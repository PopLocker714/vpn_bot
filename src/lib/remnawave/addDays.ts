import { remnawaveService } from ".";
import getNewExpireAt from "@utils/getNewExpireAt";

export const addDays = async (user_id: string, days: number) => {
    const user = await remnawaveService.user.getByUuid(user_id, true);
    const squds = await remnawaveService.squads.getSquads();

    let squadsUuids: string[] = [];
    if ("response" in squds) {
        squadsUuids = squds.response.internalSquads.map((squad) => squad.uuid);
    }

    if ("id" in user) {
        const newExpireAt = getNewExpireAt(user.expireAt, days);

        const updatedUser = await remnawaveService.user.update({
            status: "ACTIVE",
            expireAt: newExpireAt,
            uuid: user.uuid,
            activeInternalSquads: squadsUuids,
        });

        console.log("(addDays) updated user ", updatedUser);
    }
};
