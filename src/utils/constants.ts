import env from "@/config/env";

export const isDevelopment =
    env.NODE_ENV === "development" || env.NODE_ENV === "test";
