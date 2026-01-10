import { type InlineKeyboardButton } from '@effect-ak/tg-bot-api';
import type { ICallbackDataCmd, ICallbackDataSubscribe } from '@/types';

export const buttonsPlan: InlineKeyboardButton[][] = [
    [
        {
            text: '💰 Подписка на месяц (250₽)',
            callback_data: JSON.stringify({
                type: 'subscribe',
                price: 25000,
                days: 30
            } as ICallbackDataSubscribe),
        },
    ],
    [
        {
            text: '💰💰 Подписка 3 месяца (750₽)',
            callback_data: JSON.stringify({
                type: 'subscribe',
                price: 75000,
                days: 90
            } as ICallbackDataSubscribe),
        },
    ],
    [
        {
            text: '💰💰💰 Подписка на год (1500₽)',
            callback_data: JSON.stringify({
                type: 'subscribe',
                price: 75000,
                days: 90,
            } as ICallbackDataSubscribe),
        },
    ],
];

export const freeButtonPlan: InlineKeyboardButton = {
    text: '🤩 Пробный период 7 дней',
    callback_data: JSON.stringify({
        type: 'subscribe',
        price: 0,
        days: 3,
    } as ICallbackDataSubscribe),
};

export const backButtonMenu: InlineKeyboardButton = {
    text: '🔙 меню',
    callback_data: JSON.stringify({
        type: "cmd",
        command: '/start'
    } as ICallbackDataCmd),
};

export const connectButton: InlineKeyboardButton = {
    text: '👉 Подключиться к VPN',
    callback_data: JSON.stringify({
        type: "cmd",
        command: '/subscribe'
    } as ICallbackDataCmd),
};

const extendSubscriptionButton: InlineKeyboardButton = {
    text: '🔂 Продлить подписку',
    callback_data: JSON.stringify({
        type: "cmd",
        command: '/subscribe'
    } as ICallbackDataCmd),
};

const keysButton: InlineKeyboardButton = {
    text: '🔑 Моя подписка',
    callback_data: JSON.stringify({
    } as ICallbackDataCmd),
};

const helpButton: InlineKeyboardButton = {
    text: '🆘 Помощь',
    callback_data: JSON.stringify({

    } as ICallbackDataCmd),
};

export const startButtons: InlineKeyboardButton[][] = [
    [connectButton],
    [extendSubscriptionButton],
    [keysButton, helpButton],
];

export const subscriptionButtons = [
    [freeButtonPlan],
    ...buttonsPlan
]
