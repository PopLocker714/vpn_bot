import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { buttonsPlan, subscriptionButtons } from "@/buttons";
import type { ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import type { Api } from "@effect-ak/tg-bot-api";
import { remnawaveService } from "@lib/remnawave";
import { mdv2 } from "@utils/telegramMarkdown";

interface IParams extends ICTX<'callback_query' | 'message'> { }

export default async ({ update, data }: IParams) => {
    const chat_id = 'chat' in update ? update.chat.id : update.from.id
    const user = await remnawaveService.user.getByTelegramId(chat_id, true)
    if (!user || 'err' in user) return
    const isFreeAvalabel = !(user.tag === 'FREE_USED')

    const sendMessageConfig: Parameters<Api['send_message']>[0] = {
        chat_id,
        text: mdv2`
1️⃣ Выбери необходимый тариф ниже👇
2️⃣ Внеси платеж
3️⃣ И получи ссылку с простой инструкцией😉

⏰ Если подписка активна, оплаченное время добавится к текущей подписке.
Посмотреть оставшееся время подписки можно во вкладке 🔐 Моя подписка

${isFreeAvalabel ? "🎁 Всем новым пользователям бесплатный пробный период!" : ""}
`,
        parse_mode: 'MarkdownV2',
        reply_markup: {
            inline_keyboard: isFreeAvalabel ? subscriptionButtons : buttonsPlan
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
