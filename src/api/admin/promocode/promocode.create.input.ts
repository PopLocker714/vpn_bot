import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { userStateService } from "@lib/userState.methods";
import executeMethod from "@utils/executeMethod";
import { mdv2 } from "@utils/telegramMarkdown";
import { cancelAdminBtn } from "@/buttons/promocode.btn";
import env from "@/config/env";
import type { ICTX } from "@/types";
import promocodeMenu from "./promocode.menu";

export default async ({ update }: ICTX<"message" | "callback_query">) => {
    const chat_id = "chat" in update ? update.chat.id : update.from.id;
    if (env.BOT_ADMIN_ID !== chat_id) {
        return;
    }

    if (update.type === "callback_query") {
        const cb = update as ExtractedUpdate<"callback_query">;
        executeMethod("answer_callback_query", { callback_query_id: cb.id });
        return;
    }

    const msg = update as ExtractedUpdate<"message">;

    const state = await userStateService.getState(chat_id);

    if (state.type !== "input_create_code") return;

    // обработка ввода кода
    if (state.payload.code.length === 0) {
        if (msg.text === undefined || msg.text.length <= 2) {
            await executeMethod("send_message", {
                chat_id,
                text: mdv2` Неверный код введите снова (обшьше 2 символов)`,
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [[cancelAdminBtn]],
                },
            });
            return;
        }

        await userStateService.setState(chat_id, "input_create_code", {
            code: msg.text.toUpperCase(),
            expDays: null,
            userCount: null,
        });

        await executeMethod("send_message", {
            chat_id,
            text: mdv2`Промокод ${msg.text.toUpperCase()}
Введите количество дней для даты ичтечения срока промокода`,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [[cancelAdminBtn]],
            },
        });

        return;
    }

    // обрабатывает ввод колличество дней
    if (state.payload.expDays === null) {
        if (msg.text === undefined) return;
        const days = Number(msg.text.trim());

        if (days <= 0 || Number.isNaN(days)) {
            await executeMethod("send_message", {
                chat_id,
                text: mdv2`Неверное колличество дней! введите снова`,
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [[cancelAdminBtn]],
                },
            });
            return;
        }

        await userStateService.setState(chat_id, "input_create_code", {
            ...state.payload,
            expDays: days,
        });

        await executeMethod("send_message", {
            chat_id,
            text: mdv2`
Промокод: ${state.payload.code}
Дней до истечения: ${days}

Введите максимальное количество пользователей для использования промокода`,
            parse_mode: "MarkdownV2",
            reply_markup: {
                inline_keyboard: [[cancelAdminBtn]],
            },
        });

        return;
    }

    // обрабатываем максимальное количество пользователей
    if (state.payload.userCount === null) {
        if (msg.text === undefined) return;
        const userCount = Number(msg.text.trim());

        if (userCount <= 0 || Number.isNaN(userCount)) {
            await executeMethod("send_message", {
                chat_id,
                text: mdv2`Неверное колличество пользователей! введите снова`,
                parse_mode: "MarkdownV2",
                reply_markup: {
                    inline_keyboard: [[cancelAdminBtn]],
                },
            });
            return;
        }

        await executeMethod("send_message", {
            chat_id,
            text: mdv2`
Промокод был успешно создан
Название: ${state.payload.code}
Дней до истечения: ${state.payload.expDays}
Максимальное колличество пользователей: ${userCount}`,
            parse_mode: "MarkdownV2",
        });

        await userStateService.clearState(chat_id);
        await promocodeMenu({ update });
        return;
    }
};
