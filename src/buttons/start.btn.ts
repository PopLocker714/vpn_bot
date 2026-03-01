import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd } from "@/types";

export const backButtonMenu: InlineKeyboardButton = {
    text: "☰ меню",
    callback_data: JSON.stringify({
        type: "cmd",
        command: "/start",
    } as ICallbackDataCmd),
};

export const connectButton: InlineKeyboardButton = {
    text: "👉 Подключиться & Продлить",
    callback_data: JSON.stringify({
        type: "cmd",
        command: "/subscribe",
    } as ICallbackDataCmd),
};

const mySubscribe: InlineKeyboardButton = {
    text: "🔐 Моя подписка",
    callback_data: JSON.stringify({
        command: "/subscription",
        type: "cmd",
    } as ICallbackDataCmd),
};

const helpButton: InlineKeyboardButton = {
    text: "🆘 Помощь",
    url: "https://t.me/poploker",
};

const referalButton: InlineKeyboardButton = {
    text: "⭐ Реферальная програма",
    callback_data: JSON.stringify({
        command: "/referal",
        type: "cmd",
    } as ICallbackDataCmd),
};

const promocodeButton: InlineKeyboardButton = {
    text: "🎁 Ввести промокод",
    callback_data: JSON.stringify({
        command: "/promocode",
        type: "cmd",
    } as ICallbackDataCmd),
};

export const startButtons: InlineKeyboardButton[][] = [
    [connectButton],
    [mySubscribe, helpButton],
    [referalButton],
];
