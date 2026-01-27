import { CreateUserCommand } from "@remnawave/backend-contract"
import getRemnawaveInstance from "@utils/getRemnawaveInstance"
import { setUserCache } from "@utils/cache/user.cache"

export default async ({ tg_id, username }: { tg_id: number, username: string }) => {
    const url = CreateUserCommand.url
    const method = CreateUserCommand.endpointDetails.REQUEST_METHOD
    console.log(username)

    const res = await getRemnawaveInstance<CreateUserCommand.Response>(url, {
        method,
        body: JSON.stringify({
            username,
            status: "DISABLED",
            trafficLimitStrategy: "MONTH",
            trafficLimitBytes: 1000 * 1024 * 1024 * 1024,
            telegramId: tg_id,
            expireAt: new Date(),
        } as CreateUserCommand.Request)
    })

    if ('response' in res) {
        const user = res.response
        await setUserCache(user).then(data => { console.log("cache user", data) })
        return user
    } else {
        console.log('register ERROR', res)
        return res
    }
}
