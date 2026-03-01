import type { Api } from "@effect-ak/tg-bot-api";
import { referalService } from "@lib/referal.methods";
import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import { parseUsername } from "@utils/parseUsername";
import { mdv2 } from "@utils/telegramMarkdown";
import { t } from "@utils/translateHelper";
import { startButtons } from "@/buttons/buttons";
import type { ICTX } from "@/types";

export const startMsgParams: Parameters<Api["send_message"]>[0] = {
    chat_id: 0,
    text: mdv2``,
    parse_mode: "MarkdownV2",
    reply_markup: {
        inline_keyboard: startButtons,
    },
};

export default async ({ update }: ICTX<"message">) => {
    const chat_id = update.chat.id;
    startMsgParams.chat_id = chat_id;
    const defaulParams = {
        chat_id,
        parse_mode: "MarkdownV2" as Parameters<
            Api["send_message"]
        >[0]["parse_mode"],
    };

    const username = parseUsername(
        update.chat.username || `${update.chat.first_name}_${chat_id}`,
    );

    const existUser = await remnawaveService.user.getByTelegramId(
        chat_id,
        true,
    );

    if (existUser) {
        if ("err" in existUser) {
            console.error("[erorr] faild get user", existUser.err);
            await executeMethod("send_message", {
                chat_id,
                parse_mode: "MarkdownV2",
                text: mdv2`Произошла ошибка при проверке пользователя: ${existUser.err}`,
            });
            return;
        }
    }

    if (!existUser) {
        const user = await remnawaveService.user.create({
            tg_id: chat_id,
            username,
        });

        if ("err" in user) {
            console.error("[error] create user faild", user.err);
            await executeMethod("send_message", {
                ...startMsgParams,
                text: mdv2`Произошла ошибка при создании пользователя: ${user.err}`,
            });
            return;
        }

        const refCode = update.text?.replace("/start", "").replace("=", "");
        let referal_by: string | null = null;
        if (refCode) {
            referal_by = referalService.verifyRefCode(refCode);
        }
        await referalService
            .createIfNotExists({ user_id: user.uuid, referal_by })
            .then(() =>
                console.log("[info] successful referal created by", referal_by),
            );
    }

    await executeMethod("send_message", {
        ...startMsgParams,
        text: t(update.from?.language_code, "start_welcome", username),
    });

    const refCode = update.text?.replace("/start", "").replace("=", "");

    if (refCode) {
        const referal_by = referalService.verifyRefCode(refCode);
        if (referal_by !== null) {
            const refer = await remnawaveService.user.getByUuid(
                referal_by,
                true,
            );
            const currentUser =
                existUser ||
                (await remnawaveService.user.getByTelegramId(chat_id, true));

            if ("err" in refer) {
                console.log("[log] no code", refer.err);

                await executeMethod("send_message", {
                    ...defaulParams,
                    text: mdv2`Пользователя с таким кодом не существует`,
                });
                return;
            }

            if (!currentUser || "err" in currentUser) {
                await executeMethod("send_message", {
                    ...defaulParams,
                    text: mdv2`Пользователя с таким кодом не существует`,
                });
                return;
            }

            const refMe = await referalService.get(currentUser.uuid);
            const refBy = await referalService.get(refer.uuid);

            if (refMe === undefined) {
                return;
            }

            if (refBy === undefined) {
                return;
            }

            if (refMe.user_id === refBy.referal_by) {
                await executeMethod("send_message", {
                    ...defaulParams,
                    text: mdv2`Реферальный код не может быть активирован!`,
                });
                return;
            }

            await referalService
                .setBy(currentUser.uuid, refer.uuid)
                .then(() => console.log("[info] referalService.setBy success"));

            await executeMethod("send_message", {
                ...defaulParams,
                text: mdv2`Реферальный код активирован!
После оплаты подписки вы получите бонус +7 дней!`,
            });
        } else {
            console.log("[log] code verefycation faild", refCode);
            await executeMethod("send_message", {
                ...defaulParams,
                text: mdv2`Этот реферальный код не работает — попробуйте другой и получите бонус 🎁

Не нашли такой код. Введите действующий и заберите свой бонус 🎉`,
            });
        }
    }
};
