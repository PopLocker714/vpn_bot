import type { InlineKeyboardButton } from "@effect-ak/tg-bot-api";
import type { ICallbackDataCmd } from "@/types";

export const adminMenuBtn: InlineKeyboardButton = {
    text: "Menu",
    callback_data: JSON.stringify({
        command: "/admin",
        type: "cmd",
    } as ICallbackDataCmd),
};

export const adminCodesBtn: InlineKeyboardButton = {
    text: "Codes",
    callback_data: JSON.stringify({
        command: "/admin/codes",
        type: "cmd",
    } as ICallbackDataCmd),
};

const adminCodeCreateBtn: InlineKeyboardButton = {
    text: "Create",
    callback_data: JSON.stringify({
        command: "/admin/codes/create",
        type: "cmd",
    } as ICallbackDataCmd),
};

const adminCodeUpdateBtn: InlineKeyboardButton = {
    text: "Update",
    callback_data: JSON.stringify({
        command: "/admin/codes/update",
        type: "cmd",
    } as ICallbackDataCmd),
};

const adminCodeDeleteBtn: InlineKeyboardButton = {
    text: "Delete",
    callback_data: JSON.stringify({
        command: "/admin/codes/delete",
        type: "cmd",
    } as ICallbackDataCmd),
};

export const adminCodeCancelCreateBtn: InlineKeyboardButton = {
    text: "Отмена",
    callback_data: JSON.stringify({
        command: "/admin/codes/cancel",
        type: "cmd",
    } as ICallbackDataCmd),
};

export const adminCodeBtns = [
    adminCodeCreateBtn,
    adminCodeUpdateBtn,
    adminCodeDeleteBtn,
];
