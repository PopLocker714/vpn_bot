import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd, ICallbackDataSubscribe } from "@/types";

export const buttonsPlan: InlineKeyboardButton[][] = [
    [
        {
            text: "Подписка на 30д (250₽)",
            pay: true,
            callback_data: JSON.stringify({
                type: "subscribe",
                price: 25000,
                days: 30,
            } as ICallbackDataSubscribe),
        },
    ],
];

export const freeButtonPlan: InlineKeyboardButton = {
    text: "🎁 Пробный период 3 дня 🎁",
    callback_data: JSON.stringify({
        type: "subscribe",
        price: 0,
        days: 3,
    } as ICallbackDataSubscribe),
};

export const backButtonMenu: InlineKeyboardButton = {
    text: "☰ меню",
    callback_data: JSON.stringify({
        type: "cmd",
        command: "/start",
    } as ICallbackDataCmd),
};

export const connectButton: InlineKeyboardButton = {
    text: "👉 Подключиться/Продлить",
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

export const startButtons: InlineKeyboardButton[][] = [
    [connectButton],
    [mySubscribe, helpButton],
    [referalButton],
];

export const subscriptionButtons = [[freeButtonPlan], ...buttonsPlan];
