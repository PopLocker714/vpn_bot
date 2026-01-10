import { backButtonMenu } from "@/buttons"
import type { ICallbackDataSubscribe, ICTX } from "@/types"
import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client"
import { rw } from "@lib/remnawave"
import executeMethod from "@utils/executeMethod"

interface IParams extends ICTX<'callback_query'> {
    data: ICallbackDataSubscribe
}

export default async ({ update, data }: IParams) => {
    if (!data) {
        console.log('callback_query runPayment no data')
        return
    }
    if (!update.message) {
        console.log('callback_query runPayment no chat id')
        return
    }

    executeMethod('answer_callback_query', { callback_query_id: update.id })
    if (data.price === 0) {
        const user = await rw.user.getByTelegramId(update.from.id)
        if (!user) return
        if ('err' in user) return

        if (user.tag === 'FREE_USED') {
            await executeMethod('send_message', {
                chat_id: update.from.id,
                text: "Вы уже воспользовались пробным периодом",
                reply_markup: {
                    inline_keyboard: [
                        [backButtonMenu]
                    ],
                },
            })
            return
        }

        const squds = await rw.squads.getSquads()
        if (!('response' in squds)) return
        const squadsUuids = squds.response.internalSquads.map(squad => squad.uuid);
        const extraMs = 1000 * 60 * 60 * 24 * data.days;

        const newExpireAt =
            user.expireAt && user.expireAt > new Date()
                ? new Date(user.expireAt.getTime() + extraMs)
                : new Date(Date.now() + extraMs);

        const resUpdatedUser = await rw.user.update({
            uuid: user.uuid,
            activeInternalSquads: squadsUuids,
            status: "ACTIVE",
            expireAt: newExpireAt,
            tag: "FREE_USED",
            description: `
PAYMENT_PROVIDER: ${'free'}
TELEGRAM_PROVIDE: ${'free'}
PAYMENT_DATE: ${new Date().toLocaleString()}
PAYLOAD: ${JSON.stringify(data, null, 2)}
`
        })


        if ('uuid' in resUpdatedUser) {
            await executeMethod('send_message', {
                chat_id: update.from.id,
                text: `
Пробный период акитвирован на ${data.days} дней\\!
Ниже будет ссылка на инструкцию как подключиться к VPN
Если не получается обратитесь в поддержку
Приятного пользования\\!
                `,
                parse_mode: 'MarkdownV2',
                message_effect_id: MESSAGE_EFFECTS["🎉"],
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Подключиться", url: resUpdatedUser.subscriptionUrl }],
                        [backButtonMenu]
                    ],
                },
            })
        }
        return
    }

    await executeMethod('send_invoice', {
        chat_id: update.message.chat.id,
        currency: "RUB",
        description: `Подписка на ${data.days} дней`,
        payload: JSON.stringify({ ...data, type: 'payment' }),
        prices: [
            { label: `Подписка на месяц (${data.days} дней)`, amount: data.price },
        ],
        title: 'Ежемесячная подписка',
        provider_token: Bun.env.YKASSA_PROVIDER_TOKEN!,
        start_parameter: 'test',
    })
}
