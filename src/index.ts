import { serve } from "bun";
import { isDev } from "./utils/constants";
import type { Update } from '@effect-ak/tg-bot-api';
import { extractUpdate, type ExtractedUpdate, } from '@effect-ak/tg-bot';
import { extractCommand } from "./utils/extractCommand";
import startCmd from "./api/start";
import subscribe from "./api/subscribe";
import referal from "./api/referal";
import type { ICallbackDataCmd, ICallbackTypes } from "./types";
import runPayment from "./api/runPayment";
import preCheckout from "./api/preCheckout";
import successfulPayment from "./api/successfulPayment";
import { startCacheGC } from "./cron";
import webhookRemnawave from "./api/webhookRemnawave";
import executeMethod from "@utils/executeMethod";
import subscription from "./api/subscription";

console.log("Reload last", Date.now());

if (Bun.env.SET_BOT_WEBHOOK === 'true') {
    const url = `https://${Bun.env.HOST}`
    await executeMethod('set_webhook', { url, allowed_updates: ['message', 'callback_query', 'pre_checkout_query',] }).then(data => {
        console.log(JSON.stringify(data, null, 2))
    })
}

startCacheGC()

const runCmd = (cmd: ICallbackDataCmd['command'] | string, update: ExtractedUpdate<'message' | 'callback_query'>) => {
    switch (cmd) {
        case '/start':
            startCmd({ update })
            break;
        case '/subscribe':
            subscribe({ update })
            break;
        case '/subscription':
            subscription({ update })
            break
        case '/referal':
            referal({ update })
            break
    }
}

const server = serve({
    hostname: Bun.env.HOSTNAME,
    port: Bun.env.PORT || 4004,
    development: isDev,
    routes: {
        "/webhook/remnawave": webhookRemnawave,
        "/": {
            POST: async request => {
                if (request.headers.get('content-type') !== 'application/json') {
                    console.log('Invalid content type')
                    return new Response('Invalid content type', { status: 400 });
                }

                const updateJson = await request.json() as Update;

                const update = extractUpdate(updateJson)

                if (!update) {
                    console.log("Failed to parse Update")
                    return new Response("Failed to parse Update", { status: 400 })
                }

                const cmd = extractCommand(update)

                switch (update.type) {
                    case 'message':
                        const msg = update as ExtractedUpdate<'message'>;
                        cmd && runCmd(cmd, msg)
                        if (msg.successful_payment) {
                            successfulPayment({ update: msg })
                        }
                        break;
                    case 'callback_query':
                        const cb = update as ExtractedUpdate<'callback_query'>;
                        if (cb.data) {
                            const data = JSON.parse(cb.data) as ICallbackTypes
                            if (data.type === 'cmd') {
                                runCmd(data.command, cb)
                            }
                            if (data.type === 'subscribe') {
                                runPayment({ data, update: cb })
                            }
                        } else {
                            console.error('callback_query no data')
                        }
                        break;
                    case 'pre_checkout_query':
                        const pcq = update as ExtractedUpdate<'pre_checkout_query'>;
                        preCheckout({ update: pcq })
                        break;
                }

                return new Response("ok");
            }
        }
    },
    async fetch(req) {
        console.log('NOT FOUND', req.headers.get("x-remnawave-signature"))
        return new Response("Not Found", { status: 404 });
    },
});

console.log(server.url.href)
