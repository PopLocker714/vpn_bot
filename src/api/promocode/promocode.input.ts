import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { userStateService } from "@lib/userState.methods";
import executeMethod from "@utils/executeMethod";
import { mdv2 } from "@utils/telegramMarkdown";
import { cancelBtn } from "@/buttons/shared.btn";
import type { ICTX } from "@/types";

export default async ({ update }: ICTX<"message" | "callback_query">) => {
    const chat_id = "chat" in update ? update.chat.id : update.from.id;

    if (update.type === "callback_query") {
        const cb = update as ExtractedUpdate<"callback_query">;
        executeMethod("answer_callback_query", { callback_query_id: cb.id });
    }

    await userStateService.setState(chat_id, "input_promocode", null);

    await executeMethod("send_message", {
        chat_id,
        text: mdv2`Ниже введите промокод и получите скидку`,
        parse_mode: "MarkdownV2",
        reply_markup: {
            inline_keyboard: [[cancelBtn]],
        },
    });
};
