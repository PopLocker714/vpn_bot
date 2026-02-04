import { backButtonMenu } from "@/buttons";
import { remnawaveService } from "@lib/remnawave";
import type { ICallbackDataSubscribe, ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client";
import sqldb from "@/db/sqlite";
import { $Transactions } from "@/db/sqlite/schemas/transaction.schema";
import getNewExpireAt from "@utils/getNewExpireAt";
import { referalService } from "@lib/referal.methods";

interface IParams extends ICTX<'message'> { }

export default async ({ update }: IParams) => {
    if (!update.successful_payment) return

    const payload = JSON.parse(update.successful_payment.invoice_payload) as ICallbackDataSubscribe;
    const user = await remnawaveService.user.getByTelegramId(update.chat.id)
    const squds = await remnawaveService.squads.getSquads()

    if ('response' in squds && user && !("err" in user)) {
        let giftReferDays = 0

        const refer = await referalService.get(user.uuid)
        if (refer) {
            if (refer.referal_by) {
                const isInsert = await referalService.addRef(refer.referal_by, user.uuid)
                if (isInsert) {
                    giftReferDays += 7
                    await remnawaveService.user.addDays(refer.referal_by, 15)
                    const referal_by = await remnawaveService.user.getByUuid(refer.referal_by, true)

                    if ('telegramId' in referal_by) {
                        if (referal_by.telegramId) {
                            await executeMethod('send_message', {
                                chat_id: referal_by.telegramId,
                                text: "Привет вот бонус за друга 15 дней"
                            })
                        }
                    }
                }
            }
        }

        const squadsUuids = squds.response.internalSquads.map(squad => squad.uuid);
        const newExpireAt = getNewExpireAt(user.expireAt, payload.days + giftReferDays)

        const resUpdatedUser = await remnawaveService.user.update({
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
            console.error('[eroor] faild saved transaction', e)
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
            const refer_by_res = refer?.referal_by ? await remnawaveService.user.getByUuid(refer?.referal_by) : undefined
            if (refer_by_res && "id" in refer_by_res && giftReferDays > 0) {
                await executeMethod('send_message', {
                    chat_id: update.chat.id,
                    text: `Мы добавили бонусные ${giftReferDays} дни за то что вас пригласил \`${refer_by_res.username}\``,
                    parse_mode: 'MarkdownV2',
                    message_effect_id: MESSAGE_EFFECTS["🎉"],
                })
            }

            await executeMethod('send_message', {
                chat_id: update.chat.id,
                text: `
🎉 Оплата прошла успешно\\!
Ниже будет ссылка на инструкцию для подключения
Если не получается подключться обратитесь в поддержку
Приятного пользования 😉`,
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
    }
}
