import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { userStateService } from "@lib/userState.methods";
import executeMethod from "@utils/executeMethod";
import { mdv2 } from "@utils/telegramMarkdown";
import { adminCodeCancelCreateBtn } from "@/buttons/admin.btn";
import env from "@/config/env";
import type { ICTX } from "@/types";

export default async ({ update }: ICTX<"message" | "callback_query">) => {
    const chat_id = "chat" in update ? update.chat.id : update.from.id;
    if (env.BOT_ADMIN_ID !== chat_id) {
        return;
    }

    if (update.type === "callback_query") {
        const cb = update as ExtractedUpdate<"callback_query">;
        executeMethod("answer_callback_query", { callback_query_id: cb.id });
    }

    await userStateService.setState(chat_id, "input_create_code", {
        code: "",
        expDays: null,
        userCount: null,
    });

    await executeMethod("send_message", {
        chat_id,
        text: mdv2`Введите название промокода`,
        parse_mode: "MarkdownV2",
        reply_markup: {
            inline_keyboard: [[adminCodeCancelCreateBtn]],
        },
    });
};
