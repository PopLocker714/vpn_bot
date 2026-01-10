import { GetUserByTelegramIdCommand } from "@remnawave/backend-contract"
import getRemnawaveInstance from "@utils/getRemnawaveInstance"
import { setUserCache, getUserCache } from "@utils/cache/user.cache"

export default async (tg_id: number, getCache: boolean = false) => {
    const url = GetUserByTelegramIdCommand.url(tg_id.toString())
    const method = GetUserByTelegramIdCommand.endpointDetails.REQUEST_METHOD
    const reqestUser = async () => await getRemnawaveInstance<GetUserByTelegramIdCommand.Response>(url, { method })

    let res = getCache ? await getUserCache({ tg_id })
        : await reqestUser()

    if (!res) res = await reqestUser()

    if ('response' in res) {
        const user = res.response.at(0)
        if (user) await setUserCache(user).then(data => { console.log("cache user", data) })
        return user
    } else {
        return res
    }
}
