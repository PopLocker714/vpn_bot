import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    out: "./drizzle_sqlite_memory",
    schema: "./src/db/sqliteMemory/schemas/**/*schema.{ts,js}",
    dialect: "sqlite",
    dbCredentials: {
        url: ":memory:",
    },
});
