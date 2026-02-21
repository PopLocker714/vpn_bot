import { GetUserByUuidCommand } from "@remnawave/backend-contract";
import getRemnawaveInstance from "@utils/getRemnawaveInstance";
import { setUserCache, getUserCache } from "@utils/cache/user.cache";

export default async (uuid: string, getCache: boolean = false) => {
    const url = GetUserByUuidCommand.url(uuid.toString());
    const method = GetUserByUuidCommand.endpointDetails.REQUEST_METHOD;
    const reqestUser = async () =>
        await getRemnawaveInstance<GetUserByUuidCommand.Response>(url, {
            method,
        });

    let res = getCache ? await getUserCache({ uuid }) : await reqestUser();

    if (!res) res = await reqestUser();

    if ("response" in res) {
        const user = res.response;
        if (user)
            await setUserCache(user).then((data) => {
                console.info("[info] user cached", data);
            });
        return user;
    } else {
        return res;
    }
};
