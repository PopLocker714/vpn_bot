import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { startButtons } from "@/buttons";
import type { ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";
import type { Api } from "@effect-ak/tg-bot-api";
import { rw } from "@lib/remnawave";

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
    const chatId = 'chat' in update ? update.chat.id : update.from.id
    const username = ('chat' in update ? update.chat.username : update.from.username) || 'user:' + chatId
    const existUser = await rw.user.getByTelegramId(chatId, true)

    if (!existUser) {
        await rw.user.create({ tg_id: chatId, username })
    }

    if (update.type === 'callback_query') {
        const cb = update as ExtractedUpdate<'callback_query'>
        executeMethod('answer_callback_query', { callback_query_id: cb.id, })
        await executeMethod('send_message', {
            ...startMsgParams,
            chat_id: cb.from.id,
            text: renderText(cb.from.first_name),
        })
        return
    }

    const msg = update as ExtractedUpdate<'message'>
    await executeMethod('send_message', {
        ...startMsgParams,
        chat_id: msg.chat.id,
        text: renderText(msg.chat.first_name || msg.chat.username || 'Друг'),
    })
}
