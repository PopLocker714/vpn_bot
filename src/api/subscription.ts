import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { backButtonMenu, buttonsPlan, subscriptionButtons } from "@/buttons";
import type { ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import type { Api } from "@effect-ak/tg-bot-api";
import { remnawaveService } from "@lib/remnawave";
import getExpDate from "@utils/getExpDate";

interface IParams extends ICTX<'callback_query' | 'message'> { }

export default async ({ update, data }: IParams) => {
    const chat_id = 'chat' in update ? update.chat.id : update.from.id
    const user = await remnawaveService.user.getByTelegramId(chat_id)
    if (!user || 'err' in user) return
    const isHaveSubscription = user.status === 'ACTIVE'

    const sendMessageConfig: Parameters<Api['send_message']>[0] = {
        chat_id,
        text: isHaveSubscription ? `
Ваша подписка активна и закончиться через ${getExpDate(new Date(user.expireAt))}` : `У вас нет активнной подписки`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: [[{
                text: "Инструция для подключения",
                url: `${Bun.env.REMNAWAVE_WEB}/${user.shortUuid}`
            }], [backButtonMenu]]
        },
    }

    if (update.type === 'callback_query') {
        const cb = update as ExtractedUpdate<'callback_query'>
        await executeMethod('send_message', sendMessageConfig)
        await executeMethod('answer_callback_query', { callback_query_id: cb.id, })
        return
    }

    await executeMethod('send_message', sendMessageConfig)
}
