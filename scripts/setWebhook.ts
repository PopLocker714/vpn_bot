import executeMethod from "@utils/executeMethod";
import env from "@/config/env";

const url = `https://${env.BOT_WEBHOOK_HOST}`;

await executeMethod("set_webhook", {
    url,
    secret_token: env.BOT_WEBHOOK_SECRET,
    allowed_updates: ["message", "callback_query", "pre_checkout_query"],
});
console.log(await executeMethod("get_webhook_info"));
