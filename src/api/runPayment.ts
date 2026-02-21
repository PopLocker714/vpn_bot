import { backButtonMenu } from "@/buttons";
import type { ICallbackDataSubscribe, ICTX } from "@/types";
import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client";
import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import getNewExpireAt from "@utils/getNewExpireAt";
import { mdv2 } from "@utils/telegramMarkdown";

interface IParams extends ICTX<"callback_query"> {
    data: ICallbackDataSubscribe;
}

export default async ({ update, data }: IParams) => {
    if (!data) {
        console.log("callback_query runPayment no data");
        return;
    }
    if (!update.message) {
        console.log("callback_query runPayment no chat id");
        return;
    }

    executeMethod("answer_callback_query", { callback_query_id: update.id });
    if (data.price === 0) {
        const user = await remnawaveService.user.getByTelegramId(
            update.from.id,
        );
        if (!user) return;
        if ("err" in user) return;

        if (user.tag === "FREE_USED") {
            await executeMethod("send_message", {
                chat_id: update.from.id,
                text: mdv2`Вы уже воспользовались пробным периодом`,
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [[backButtonMenu]],
                },
            });
            return;
        }

        const squds = await remnawaveService.squads.getSquads();
        if (!("response" in squds)) return;
        const squadsUuids = squds.response.internalSquads.map(
            (squad) => squad.uuid,
        );

        const newExpireAt = getNewExpireAt(user.expireAt, data.days);

        const resUpdatedUser = await remnawaveService.user.update({
            uuid: user.uuid,
            activeInternalSquads: squadsUuids,
            status: "ACTIVE",
            expireAt: newExpireAt,
            tag: "FREE_USED",
            description: `
PAYMENT_PROVIDER: ${"free"}
TELEGRAM_PROVIDE: ${"free"}
PAYMENT_DATE: ${new Date().toLocaleString()}
PAYLOAD: ${JSON.stringify(data, null, 2)}
`,
        });

        if ("uuid" in resUpdatedUser) {
            await executeMethod("send_message", {
                chat_id: update.from.id,
                text: mdv2`
🎉 Пробный период акитвирован на ${data.days} дней!
Ниже будет ссылка на инструкцию для подключения
Если не получается подключться обратитесь в поддержку
Приятного пользования 😉
                `,
                parse_mode: "MarkdownV2",
                message_effect_id: MESSAGE_EFFECTS["🎉"],
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Подключиться",
                                url: `${Bun.env.REMNAWAVE_WEB}/${resUpdatedUser.shortUuid}`,
                            },
                        ],
                        [backButtonMenu],
                    ],
                },
            });
        }
        return;
    }

    await executeMethod("send_invoice", {
        chat_id: update.message.chat.id,
        currency: "RUB",
        description: `Подписка на ${data.days} дней`,
        payload: JSON.stringify({ ...data, type: "payment" }),
        prices: [
            {
                label: `Подписка на месяц (${data.days} дней)`,
                amount: data.price,
            },
        ],
        title: "Ежемесячная подписка",
        provider_token: Bun.env.YKASSA_PROVIDER_TOKEN!,
        start_parameter: "test",
    });
};
