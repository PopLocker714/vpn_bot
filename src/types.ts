import type { AvailableUpdateTypes, ExtractedUpdate } from "@effect-ak/tg-bot"

export interface ICTX<U extends AvailableUpdateTypes> {
    update: ExtractedUpdate<U>
    data?: ICallbackTypes
}

export interface ICallbackDataSubscribe {
    type: 'subscribe'
    price: number
    days: number
}

export interface ICallbackDataCmd {
    type: 'cmd'
    command: '/start' | '/subscribe' | '/subscription' | '/help' | '/referal'
}

export type ICallbackTypes = ICallbackDataCmd | ICallbackDataSubscribe
