import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { userStateService } from "@lib/userState.methods";
import executeMethod from "@utils/executeMethod";
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
        await userStateService.clearState(chat_id);
        await promocodeMenu({ update });
    }
};
