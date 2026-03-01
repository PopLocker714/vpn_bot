import { lte, sql } from "drizzle-orm";
import sqlmem from "./db/sqliteMemory";
import { $Users_c } from "./db/sqliteMemory/schemas/users.schema";

export const starcCron = () => {
    setInterval(async () => {
        await sqlmem
            .delete($Users_c)
            .where(lte($Users_c.exp, sql`strftime('%s','now')`));
    }, 60000);
};
