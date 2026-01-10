import type { Api } from "@effect-ak/tg-bot-api";
import type { BodyInit, HeadersInit } from "bun";
import { isTgBotApiResponse, snakeToCamel, TgBotClientError } from "@effect-ak/tg-bot-client";

export interface ExitResultSuccess<M extends keyof Api> {
    ok: true;
    data: ReturnType<Api[M]>;
}

interface TgBotApiResponseSchema {
    ok: boolean;
    error_code?: number;
    description?: string;
    result?: unknown;
}

interface RequestOptions {
    type?: "json" | "urlencoded" | "multipart";
}

export default async <M extends keyof Api>(
    method: M,
    input: Parameters<Api[M]>[0] = {} as any,
    options: RequestOptions = {}
) => {
    const token = Bun.env.BOT_TOKEN;
    if (!token) throw new Error("❌ BOT_TOKEN не найден в окружении");

    const url = `https://api.telegram.org/bot${token}/${snakeToCamel(method)}`;
    const isSetMethod = method.toLowerCase().startsWith("set");
    const usePost = isSetMethod || Object.keys(input).length > 0;
    const type = options.type ?? "json";

    let body: BodyInit | undefined;
    let headers: HeadersInit = {};

    if (usePost) {
        if (type === "json") {
            headers["Content-Type"] = "application/json; charset=utf-8";
            body = JSON.stringify(input);
        }
        else if (type === "urlencoded") {
            headers["Content-Type"] = "application/x-www-form-urlencoded; charset=utf-8";
            body = new URLSearchParams(input as any).toString();
        }
        else if (type === "multipart") {
            const form = new FormData();
            for (const [k, v] of Object.entries(input)) form.append(k, v as any);
            body = form;
            headers = {};
        }
    }

    const res = await fetch(url, {
        method: usePost ? "POST" : "GET",
        headers,
        body: usePost ? body : undefined,
    });

    const data = await res.json() as TgBotApiResponseSchema;

    const isResponse = isTgBotApiResponse(data)
    if (!isResponse) {
        console.warn("!Wrong tg bot api response")
    }

    if (!data.ok) {
        console.error("❌ Telegram API Error:", {
            method,
            error_code: data.error_code,
            description: data.description,
        });
    }

    return data;
};
