import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd } from "@/types";

export const cancelAdminBtn: InlineKeyboardButton = {
    text: "Отмена",
    callback_data: JSON.stringify({
        command: "/admin/codes/cancel",
        type: "cmd",
    } as ICallbackDataCmd),
};
