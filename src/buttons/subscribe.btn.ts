import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataSubscribe } from "@/types";

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

export const subscriptionButtons = [[freeButtonPlan], ...buttonsPlan];
