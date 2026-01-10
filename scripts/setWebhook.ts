import executeMethod from "@utils/executeMethod";

const url = `https://${Bun.env.HOST}`

await executeMethod('set_webhook', { url, allowed_updates: ['message', 'callback_query', 'pre_checkout_query',] })
console.log(await executeMethod('get_webhook_info'))
