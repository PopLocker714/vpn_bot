import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle_sqlite",
    schema: "./src/db/sqlite/schemas/**/*schema.{ts,js}",
    dialect: "sqlite",
    dbCredentials: {
        url: `${process.env.NODE_ENV === "production" ? "prod" : "dev"}.sqlite`,
    },
});
