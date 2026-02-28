import type { Api } from "@effect-ak/tg-bot-api";
import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import { parseUsername } from "@utils/parseUsername";
import { mdv2 } from "@utils/telegramMarkdown";
import { t } from "@utils/translateHelper";
import { startButtons } from "@/buttons";
import type { ICTX } from "@/types";

export const startMsgParams: Parameters<Api["send_message"]>[0] = {
    chat_id: 0,
    text: mdv2``,
    parse_mode: "MarkdownV2",
    reply_markup: {
        inline_keyboard: startButtons,
    },
};

export default async ({ update }: ICTX<"callback_query">) => {
    const chat_id = update.from.id;
    startMsgParams.chat_id = chat_id;

    const username = parseUsername(
        update.from.username || `${update.from.first_name}_${chat_id}`,
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
    }

    executeMethod("answer_callback_query", { callback_query_id: update.id });

    await executeMethod("send_message", {
        ...startMsgParams,
        text: t(
            update.from.language_code,
            "start_welcome",
            update.from.first_name,
        ),
    });

    return;
};
