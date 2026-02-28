import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { schema } from "@/db/sqlite/schema";

export const createDb = () => {
    const sqlite = new Database(`${Bun.env.DB_URL}`, { create: true });

    sqlite.run("PRAGMA journal_mode = WAL;");

    const db = drizzle({
        client: sqlite,
        schema,
    });

    migrate(db, {
        migrationsFolder: "./drizzle_sqlite",
    });

    return db;
};

const sqldb = createDb();

export default sqldb;
