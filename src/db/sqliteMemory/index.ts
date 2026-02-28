import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { schema } from "./schema";

const createMemoryDb = () => {
    const sqlite = new Database(":memory:", {
        strict: true,
        // safeIntegers: true,
    });

    sqlite.run("PRAGMA journal_mode = WAL;");

    const db = drizzle({
        client: sqlite,
        schema,
    });

    migrate(db, {
        migrationsFolder: "./drizzle_sqlite_memory",
    });

    return db;
};

const sqlmem = createMemoryDb();

export default sqlmem;
