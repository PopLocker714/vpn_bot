import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { startButtons } from "@/buttons";
import type { ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import type { Api } from "@effect-ak/tg-bot-api";
import { remnawaveService } from "@lib/remnawave";
import { parseUsername } from "@utils/parseUsername";
import { referalService } from "@lib/referal.methods";

const renderText = (userName: string) => `
Привет *${userName}\\!*

💻 Добро пожаловать в *CatFlyVPN\\!*

Мы предоставляем доступ к VPN для обхода блокировок и обеспечения безопасности в интернете\\. Пользуясь нашим VPN, Вы получите доступ к *Instagram*, *YouTube*, *TikTok*, *Facebook*, *Twitter* и другим заблокированным сервисам\\.

🚀 Никаких ограничений скорости — полная свобода в интернете на максимальной скорости\\.
🌍 Доступ ко всем сайтам — никаких блокировок, где бы вы ни находились\\.
⚙️ Быстрое подключение — легко настроить за 1 минуту на *iPhone*, *Android* и *Android TV*, ПК \\(*Windows*, *Linux*, *macOS*\\)\\.
💳 Оплата происходит через *YooMoney*, *СБП* и *Банковские карты*\\.
`;

const startMsgParams: Parameters<Api['send_message']>[0] = {
    chat_id: 0,
    text: 'subs',
    parse_mode: 'MarkdownV2',
    reply_markup: {
        inline_keyboard: startButtons,
    },
}

export default async ({ update }: ICTX<'message' | 'callback_query'>) => {
    const isMessageUpdate = 'chat' in update
    const chat_id = isMessageUpdate ? update.chat.id : update.from.id
    startMsgParams.chat_id = chat_id
    const defaulParams = {
        chat_id,
        parse_mode: 'MarkdownV2' as Parameters<Api['send_message']>[0]['parse_mode'],
    }
    const username = parseUsername((isMessageUpdate ? update.chat.username : update.from.username)
        || (isMessageUpdate ? update.chat.first_name : update.from.first_name) + '_' + chat_id)
    const existUser = await remnawaveService.user.getByTelegramId(chat_id, true)

    if (existUser) {
        if ('err' in existUser) {
            console.error("[erorr] faild get user", existUser.err)
            return
        }
    }

    if (!existUser) {
        const user = await remnawaveService.user.create({ tg_id: chat_id, username })

        if ('err' in user) {
            console.error("[error] create user faild", user.err)
            await executeMethod('send_message', {
                ...startMsgParams,
                text: `Internal error: Faild to create user`
            })
            return
        }

        if (isMessageUpdate) {
            const refCode = update.text?.replace("/start", '').replace("=", "")
            let referal_by: string | null = null
            if (refCode) {
                referal_by = referalService.verifyRefCode(refCode)
            }
            await referalService.createIfNotExists({ user_id: user.uuid, referal_by })
                .then(() => console.log("[info] successful referal created by", referal_by))
        }
    }

    if (update.type === 'callback_query') {
        const cb = update as ExtractedUpdate<'callback_query'>
        executeMethod('answer_callback_query', { callback_query_id: cb.id, })
        await executeMethod('send_message', {
            ...startMsgParams,
            text: renderText(cb.from.first_name),
        })
        return
    }

    const msg = update as ExtractedUpdate<'message'>

    await executeMethod('send_message', {
        ...startMsgParams,
        text: renderText(msg.chat.first_name || msg.chat.username || 'Друг'),
    })

    const refCode = msg.text?.replace("/start", '').replace("=", "")

    if (refCode) {
        const referal_by = referalService.verifyRefCode(refCode)
        if (referal_by !== null) {
            const refer = await remnawaveService.user.getByUuid(referal_by, true)
            const currentUser = existUser || await remnawaveService.user.getByTelegramId(chat_id, true)

            if ('err' in refer) {
                console.log("[log] no code", refer.err)

                await executeMethod('send_message', {
                    ...defaulParams,
                    text: `Пользователя с таким кодом не существует`,
                })
                return
            }

            if (!currentUser || 'err' in currentUser) {
                await executeMethod('send_message', {
                    ...defaulParams,
                    text: `Пользователя с таким кодом не существует`,
                })
                return
            }

            const refMe = await referalService.get(currentUser.uuid)
            const refBy = await referalService.get(refer.uuid)

            if (refMe === undefined) {
                return
            }

            if (refBy === undefined) {
                return
            }

            if (refMe.user_id === refBy.referal_by) {
                await executeMethod('send_message', {
                    ...defaulParams,
                    text: `Реферальный код не может быть активирован\\!`,
                })
                return
            }

            await referalService.setBy(currentUser.uuid, refer.uuid)
                .then(() => console.log("[info] referalService.setBy success"))

            await executeMethod('send_message', {
                ...defaulParams,
                text: `Реферальный код активирован\\!
После оплаты подписки вы получите бонус \\+7 дней\\!`,
            })
        } else {
            console.log("[log] code verefycation faild", refCode)
            await executeMethod('send_message', {
                ...defaulParams,
                text: `Этот реферальный код не работает — попробуйте другой и получите бонус 🎁

Не нашли такой код\\. Введите действующий и заберите свой бонус 🎉`,
            })
        }
    }
}
