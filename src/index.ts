import executeMethod from "@utils/executeMethod";
import { serve } from "bun";
import webhookRemnawave from "./api/webhookRemnawave";
import env from "./config/env";
import { starcCron } from "./cron";
import webhookTgBot from "./index.post";
import { isDevelopment } from "./utils/constants";

console.log("Reload last", Date.now());

if (env.SET_BOT_WEBHOOK === "true") {
    const url = `https://${env.BOT_WEBHOOK_HOST}${env.BOT_WEBHOOK_PATH_SECRET}`;
    await executeMethod("set_webhook", {
        url,
        secret_token: env.BOT_WEBHOOK_SECRET,
        allowed_updates: ["message", "callback_query", "pre_checkout_query"],
    }).then((data) => {
        console.log(JSON.stringify(data, null, 2));
    });
}

starcCron();

const server = serve({
    hostname: env.HOSTNAME,
    port: env.PORT,
    development: isDevelopment,
    routes: {
        "/webhook/remnawave": webhookRemnawave,
        [env.BOT_WEBHOOK_PATH_SECRET as "/tg_webhook/secret_string"]: {
            POST: webhookTgBot,
        },
    },
    async fetch(req) {
        console.log("NOT FOUND", req.headers.get("x-remnawave-signature"));
        return new Response("Not Found", { status: 404 });
    },
});

console.log(server.url.href);
