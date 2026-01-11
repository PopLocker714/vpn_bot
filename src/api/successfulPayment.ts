import { backButtonMenu } from "@/buttons";
import { rw } from "@lib/remnawave";
import type { ICallbackDataSubscribe, ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client";
import sqldb from "@/db/sqlite";
import { $Transactions } from "@/db/sqlite/schemas/transaction.schema";
import getNewExpireAt from "@utils/getNewExpireAt";

interface IParams extends ICTX<'message'> { }

export default async ({ update }: IParams) => {
    if (!update.successful_payment) return

    const payload = JSON.parse(update.successful_payment.invoice_payload) as ICallbackDataSubscribe;
    const user = await rw.user.getByTelegramId(update.chat.id)
    const squds = await rw.squads.getSquads()

    if ('response' in squds && user && !("err" in user)) {
        const squadsUuids = squds.response.internalSquads.map(squad => squad.uuid);

        const newExpireAt = getNewExpireAt(user.expireAt, payload.days)

        const resUpdatedUser = await rw.user.update({
            uuid: user.uuid,
            activeInternalSquads: squadsUuids,
            status: "ACTIVE",
            expireAt: newExpireAt,
            description: `
PAYMENT_PROVIDER: ${update.successful_payment.provider_payment_charge_id}
TELEGRAM_PROVIDE: ${update.successful_payment.telegram_payment_charge_id}
PAYMENT_DATE: ${new Date().toLocaleString()}
PAYLOAD: ${JSON.stringify(payload, null, 2)}
`
        })

        await sqldb.insert($Transactions).values({
            provider_payment_charge_id: update.successful_payment.provider_payment_charge_id,
            telegram_payment_charge_id: update.successful_payment.telegram_payment_charge_id,
            user_id: user.uuid,
            data: update.successful_payment
        }).then(() => console.log("succes saved payment")).catch(e => {
            console.log('error saved payment')
            console.error(e)
        })

        if ('err' in resUpdatedUser || 'statusCode' in resUpdatedUser) {
            if ('message' in resUpdatedUser) {
                await executeMethod('send_message', {
                    chat_id: update.chat.id,
                    text: "Произашла внутренняя ошибка: " + resUpdatedUser.message
                })
            }

            if ('err' in resUpdatedUser) {
                await executeMethod('send_message', {
                    chat_id: update.chat.id,
                    text: "Произашла внутренняя ошибка: " + resUpdatedUser.err
                })
            }

            return
        }

        if ('uuid' in resUpdatedUser) {
            await executeMethod('send_message', {
                chat_id: update.chat.id,
                text: `
🎉 Оплата прошла успешно\\!
Ниже будет ссылка на инструкцию для подключения
Если не получается подключться обратитесь в поддержку
Приятного пользования 😉
                `,
                parse_mode: 'MarkdownV2',
                message_effect_id: MESSAGE_EFFECTS["🎉"],
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "Подключиться", url: `${Bun.env.REMNAWAVE_WEB}/${resUpdatedUser.shortUuid}`
                        }],
                        [backButtonMenu]
                    ],
                },
            })
            return
        }
    } else {

    }
}
