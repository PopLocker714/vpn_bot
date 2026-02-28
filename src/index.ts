import { type ExtractedUpdate, extractUpdate } from "@effect-ak/tg-bot";
import type { Update } from "@effect-ak/tg-bot-api";
import executeMethod from "@utils/executeMethod";
import { serve } from "bun";
import preCheckout from "./api/preCheckout";
import referal from "./api/referal";
import runPayment from "./api/runPayment";
import startCmd from "./api/start/start";
import subscribe from "./api/subscribe";
import subscription from "./api/subscription";
import successfulPayment from "./api/successfulPayment";
import webhookRemnawave from "./api/webhookRemnawave";
import { startCacheGC } from "./cron";
import type { ICallbackDataCmd, ICallbackTypes } from "./types";
import { isDev } from "./utils/constants";
import { extractCommand } from "./utils/extractCommand";
import { mdv2 } from "./utils/telegramMarkdown";

console.log("Reload last", Date.now());

if (Bun.env.SET_BOT_WEBHOOK === "true") {
    const url = `https://${Bun.env.HOST}`;
    await executeMethod("set_webhook", {
        url,
        allowed_updates: ["message", "callback_query", "pre_checkout_query"],
    }).then((data) => {
        console.log(JSON.stringify(data, null, 2));
    });
}

startCacheGC();

type SupportedUpdate = ExtractedUpdate<
    "message" | "callback_query" | "pre_checkout_query"
>;

const getChatIdFromUpdate = (update?: SupportedUpdate): number | undefined => {
    if (!update) return;
    if ("chat" in update && update.chat && "id" in update.chat) {
        return update.chat.id;
    }
    if ("from" in update && update.from && typeof update.from.id === "number") {
        return update.from.id;
    }
    return;
};

const getUserErrorText = (error: unknown): string => {
    if (error instanceof Error) {
        const msg = error.message || "Unknown error";
        if (msg.includes("Failed to parse JSON")) {
            return "Сервер получил некорректные данные от внешнего сервиса.";
        }
        return msg;
    }
    if (typeof error === "string" && error.trim().length > 0) return error;
    return "Неизвестная ошибка.";
};

const notifyUserError = async (
    update: SupportedUpdate | undefined,
    error: unknown,
) => {
    const chatId = getChatIdFromUpdate(update);
    if (!chatId) return;

    const reason = getUserErrorText(error).slice(0, 3500);
    try {
        await executeMethod("send_message", {
            chat_id: chatId,
            parse_mode: "MarkdownV2",
            text: mdv2`Произошла ошибка при обработке запроса.
Причина: ${reason}
Попробуйте еще раз через минуту.`,
        });
    } catch (notifyError) {
        console.error("Failed to notify user about error:", notifyError);
    }
};

const runCmd = async (
    cmd: ICallbackDataCmd["command"] | string,
    update: ExtractedUpdate<"message" | "callback_query">,
) => {
    switch (cmd) {
        case "/start":
            await startCmd({ update });
            break;
        case "/subscribe":
            await subscribe({ update });
            break;
        case "/subscription":
            await subscription({ update });
            break;
        case "/referal":
            await referal({ update });
            break;
    }
};

const server = serve({
    hostname: Bun.env.HOSTNAME,
    port: Bun.env.PORT || 4004,
    development: isDev,
    routes: {
        "/webhook/remnawave": webhookRemnawave,
        "/": {
            POST: async (request) => {
                let currentUpdate: SupportedUpdate | undefined;
                try {
                    const contentType =
                        request.headers.get("content-type") ?? "";
                    if (!contentType.includes("application/json")) {
                        console.log("Invalid content type:", contentType);
                        return new Response("Invalid content type", {
                            status: 400,
                        });
                    }

                    const rawBody = await request.text();
                    if (!rawBody.trim()) {
                        console.log("Empty JSON body");
                        return new Response("Empty body", { status: 400 });
                    }

                    let updateJson: Update;
                    try {
                        updateJson = JSON.parse(rawBody) as Update;
                    } catch (error) {
                        console.log("Failed to parse request JSON:", error);
                        console.log("Raw body sample:", rawBody.slice(0, 300));
                        return new Response("Failed to parse JSON", {
                            status: 400,
                        });
                    }

                    const update = extractUpdate(updateJson);

                    if (!update) {
                        console.log("Failed to parse Update");
                        return new Response("Failed to parse Update", {
                            status: 400,
                        });
                    }
                    currentUpdate = update as SupportedUpdate;

                    const cmd = extractCommand(update);

                    switch (update.type) {
                        case "message": {
                            const msg = update as ExtractedUpdate<"message">;
                            if (cmd) {
                                await runCmd(cmd, msg);
                            }
                            if (msg.successful_payment) {
                                await successfulPayment({ update: msg });
                            }
                            break;
                        }
                        case "callback_query": {
                            const cb =
                                update as ExtractedUpdate<"callback_query">;
                            if (cb.data) {
                                let data: ICallbackTypes;
                                try {
                                    data = JSON.parse(
                                        cb.data,
                                    ) as ICallbackTypes;
                                } catch (error) {
                                    console.error(
                                        "Failed to parse callback_query data JSON:",
                                        cb.data,
                                        error,
                                    );
                                    await notifyUserError(
                                        cb as SupportedUpdate,
                                        "Некорректные данные кнопки. Нажмите /start и попробуйте снова.",
                                    );
                                    return new Response(
                                        "Invalid callback data",
                                        { status: 400 },
                                    );
                                }
                                if (data.type === "cmd") {
                                    await runCmd(data.command, cb);
                                }
                                if (data.type === "subscribe") {
                                    await runPayment({ data, update: cb });
                                }
                            } else {
                                console.error("callback_query no data");
                            }
                            break;
                        }
                        case "pre_checkout_query": {
                            const pcq =
                                update as ExtractedUpdate<"pre_checkout_query">;
                            await preCheckout({ update: pcq });
                            break;
                        }
                    }

                    return new Response("ok");
                } catch (e) {
                    if (e instanceof Error) {
                        console.error("----- Route '/' error:", {
                            name: e.name,
                            message: e.message,
                            stack: e.stack,
                        });
                    } else {
                        console.error("----- Route '/' unknown error:", e);
                    }
                    await notifyUserError(currentUpdate, e);
                    return new Response("ok");
                }
            },
        },
    },
    async fetch(req) {
        console.log("NOT FOUND", req.headers.get("x-remnawave-signature"));
        return new Response("Not Found", { status: 404 });
    },
});

console.log(server.url.href);
