import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd } from "@/types";

export const cancelBtn: InlineKeyboardButton = {
    text: "Отмена",
    callback_data: JSON.stringify({
        command: "/cancel",
        type: "cmd",
    } as ICallbackDataCmd),
};
