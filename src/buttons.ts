import { type InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd, ICallbackDataSubscribe } from "@/types";

export const buttonsPlan: InlineKeyboardButton[][] = [
    [
        {
            text: "💰 Подписка на месяц (250₽)",
            pay: true,
            callback_data: JSON.stringify({
                type: "subscribe",
                price: 25000,
                days: 30,
            } as ICallbackDataSubscribe),
        },
    ],
    [
        {
            text: "💰💰 Подписка 3 месяца (750₽)",
            callback_data: JSON.stringify({
                type: "subscribe",
                price: 75000,
                days: 90,
            } as ICallbackDataSubscribe),
        },
    ],
    [
        {
            text: "💰💰💰 Подписка на пол года (1500₽)",
            callback_data: JSON.stringify({
                type: "subscribe",
                price: 150000,
                days: 180,
            } as ICallbackDataSubscribe),
        },
    ],
];

export const freeButtonPlan: InlineKeyboardButton = {
    text: "🎁 Пробный период 7 дней",
    callback_data: JSON.stringify({
        type: "subscribe",
        price: 0,
        days: 7,
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
