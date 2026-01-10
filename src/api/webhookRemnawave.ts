import { validateWebhook } from "@utils/cripto";
import type { TRemnawaveWebhookUserEvent, RemnawaveWebhookUserEvents } from '@remnawave/backend-contract';
import executeMethod from "@utils/executeMethod";
import { backButtonMenu, buttonsPlan } from "@/buttons";

export default async (req: Bun.BunRequest<"/webhook/remnawave">) => {
    const signature = req.headers.get("x-remnawave-signature") ?? ""
    const rawBody = await req.text()

    const isValid = validateWebhook(
        rawBody,
        signature,
        process.env.WEBHOOK_SECRET_HEADER!,
    )

    if (!isValid) {
        console.log("Invalid signature")
        return new Response("Invalid signature", { status: 401 })
    }

    const event = JSON.parse(rawBody) as TRemnawaveWebhookUserEvent
    if (event.event === 'user.expires_in_72_hours') {
        if (!event.data.telegramId) return
        await executeMethod('send_message', {
            chat_id: event.data.telegramId,
            text: `🔔 Успейте продлить подписку, осталось 3 дня\\!
_\* При покупке дни сумируются_`,
            reply_markup: {
                inline_keyboard: [...buttonsPlan, [backButtonMenu]]
            }
        })
    }

    if (event.event === 'user.expires_in_24_hours') {
        if (!event.data.telegramId) return
        await executeMethod('send_message', {
            chat_id: event.data.telegramId,
            text: `🔔 До конца подписки остался один день\\!
Успей оплатить следующий месяц

_\* При покупке дни сумируются_`,
            reply_markup: {
                inline_keyboard: [...buttonsPlan, [backButtonMenu]]
            }
        })
    }

    return new Response("ok")
}
