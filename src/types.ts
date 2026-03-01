import type { AvailableUpdateTypes, ExtractedUpdate } from "@effect-ak/tg-bot";

export interface ICTX<U extends AvailableUpdateTypes> {
    update: ExtractedUpdate<U>;
    data?: ICallbackTypes;
}

export interface ICallbackDataSubscribe {
    type: "subscribe";
    price: number;
    days: number;
}

type IAdminCommands =
    | "/admin"
    | "/admin/codes"
    | "/admin/codes/create"
    | "/admin/codes/update"
    | "/admin/codes/delete"
    | "/admin/codes/cancel";

export interface ICallbackDataCmd {
    type: "cmd";
    command:
        | "/start"
        | "/subscribe"
        | "/subscription"
        | "/help"
        | "/referal"
        | "/promocode"
        | "/cancel"
        | IAdminCommands;
}

export type ICallbackTypes = ICallbackDataCmd | ICallbackDataSubscribe;
