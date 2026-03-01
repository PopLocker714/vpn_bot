import { type ExtractedUpdate, extractUpdate } from "@effect-ak/tg-bot";
import type { Update } from "@effect-ak/tg-bot-api";
import { userStateService } from "@lib/userState.methods";
import executeMethod from "@utils/executeMethod";
import { extractCommand } from "@utils/extractCommand";
import { mdv2 } from "@utils/telegramMarkdown";
import adminMenu from "./api/admin/admin.menu";
import promocodeCancel from "./api/admin/promocode/promocode.cancel";
import promocodeCreate from "./api/admin/promocode/promocode.create";
import promocodeCreateInput from "./api/admin/promocode/promocode.create.input";
import promocodeMenu from "./api/admin/promocode/promocode.menu";
import cancelState from "./api/cancel.state";
import preCheckout from "./api/preCheckout";
import promocodeInput from "./api/promocode/promocode.input";
import promocodeValidate from "./api/promocode/promocode.validate";
import referal from "./api/referal";
import runPayment from "./api/runPayment";
import startCmd from "./api/start/start";
import subscribe from "./api/subscribe";
import subscription from "./api/subscription";
import successfulPayment from "./api/successfulPayment";
import env from "./config/env";
import type { ICallbackDataCmd, ICallbackTypes } from "./types";

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
    cmd: ICallbackDataCmd["command"],
    update: ExtractedUpdate<"message" | "callback_query">,
) => {
    console.log(cmd);
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
        case "/promocode":
            await promocodeInput({ update });
            break;
        case "/cancel":
            await cancelState({ update });
            break;
        case "/admin":
            await adminMenu({ update });
            break;
        case "/admin/codes":
            await promocodeMenu({ update });
            break;
        case "/admin/codes/create":
            await promocodeCreate({ update });
            break;
        case "/admin/codes/update":
            // await promocodeUpdate({ update });
            break;
        case "/admin/codes/delete":
            // await promocodeDelete({ update });
            break;
        case "/admin/codes/cancel":
            await promocodeCancel({ update });
            break;
    }
};

const index = async (request: Bun.BunRequest<"/tg_webhook/secret_string">) => {
    const tgSecret = request.headers.get("x-telegram-bot-api-secret-token");

    if (tgSecret !== env.BOT_WEBHOOK_SECRET) {
        return new Response("Unauthorized", { status: 403 });
    }

    let currentUpdate: SupportedUpdate | undefined;
    try {
        const contentType = request.headers.get("content-type") ?? "";
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
                const state = await userStateService.getState(msg.chat.id);

                switch (state.type) {
                    case "idle":
                        if (cmd) {
                            await runCmd(
                                cmd as ICallbackDataCmd["command"],
                                msg,
                            );
                        }
                        if (msg.successful_payment) {
                            await successfulPayment({ update: msg });
                        }
                        break;
                    case "input_create_code":
                        await promocodeCreateInput({ update: msg });
                        break;
                    case "input_promocode":
                        await promocodeValidate({ update: msg });
                        break;
                }
                break;
            }
            case "callback_query": {
                const cb = update as ExtractedUpdate<"callback_query">;
                if (cb.data) {
                    let data: ICallbackTypes;
                    try {
                        data = JSON.parse(cb.data) as ICallbackTypes;
                    } catch (error) {
                        console.error(
                            "Failed to parse callback_query data JSON:",
                            cb.data,
                            error,
                        );
                        throw new Error(
                            "Failed to parse callback_query data JSON",
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
                const pcq = update as ExtractedUpdate<"pre_checkout_query">;
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
};

export default index;
