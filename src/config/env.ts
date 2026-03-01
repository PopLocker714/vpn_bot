import arkenv, { type } from "arkenv";

export const env = arkenv({
    NODE_ENV: "'development' | 'production' | 'test' = 'development'",
    PORT: type("number.port").default(() => 4004),
    HOSTNAME: type("string.host").default(() => "0.0.0.0"), // or string.ip.v4

    DB_URL: "string",

    SET_BOT_WEBHOOK: type("'true' | 'false'").default(() => "false"),
    BOT_WEBHOOK_HOST: "string",
    BOT_WEBHOOK_SECRET: "string <= 86",
    BOT_WEBHOOK_PATH_SECRET: "string",
    BOT_TOKEN: "string",
    BOT_NAME: "string",
    BOT_ADMIN_ID: "string.numeric.parse",

    REF_SECRET: "string <= 86",

    YKASSA_KASSA_ID: "string.numeric.parse",
    YKASSA_KASSA_API: "string",
    YKASSA_PROVIDER_TOKEN: "string",

    REMNAWAVE_PANEL_URL: "string.url",
    REMNAWAVE_WEB: "string.url",
    REMNAWAVE_API_TOKEN: "string",
    WEBHOOK_SECRET_HEADER: "string",

    // Optional variables with defaults
    // LOG_LEVEL: "'debug' | 'info' | 'warn' | 'error' = 'info'",

    // Arrays (comma-separated by default)
    // ALLOWED_ORIGINS: type("string[]").default(() => ["localhost"]),
    // FEATURE_FLAGS: type("string[]").default(() => []),

    // Optional environment variable
    // "API_KEY?": "string",
});

export default env;
