import { validateWebhookHcmc } from "@utils/cripto";
import type {
    TRemnawaveWebhookUserEvent,
    RemnawaveWebhookUserEvents,
} from "@remnawave/backend-contract";
import executeMethod from "@utils/executeMethod";
import { backButtonMenu, buttonsPlan } from "@/buttons";
import { mdv2 } from "@utils/telegramMarkdown";

export default async (req: Bun.BunRequest<"/webhook/remnawave">) => {
    const secret = Bun.env.WEBHOOK_SECRET_HEADER;
    const clone = req.clone();
    const isValid = await validateWebhookHcmc(clone, secret);

    const rawBody = await req.text();

    if (!isValid) {
        console.log("Invalid signature");
        return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(rawBody) as TRemnawaveWebhookUserEvent;
    if (event.event === "user.expires_in_72_hours") {
        if (!event.data.telegramId)
            return new Response("Internal error", { status: 500 });

        await executeMethod("send_message", {
            chat_id: event.data.telegramId,
            text: mdv2`🔔 Успейте продлить подписку, осталось 3 дня!
_* При покупке дни сумируются_`,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [...buttonsPlan, [backButtonMenu]],
            },
        });
    }

    if (event.event === "user.expires_in_24_hours") {
        if (!event.data.telegramId)
            return new Response("Internal error", { status: 500 });
        await executeMethod("send_message", {
            chat_id: event.data.telegramId,
            text: mdv2`🔔 До конца подписки остался один день!
Успей оплатить следующий месяц

_* При покупке дни сумируются_`,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [...buttonsPlan, [backButtonMenu]],
            },
        });
    }

    return new Response("ok");
};
