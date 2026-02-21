import type { CreateUserCommand } from "@remnawave/backend-contract";
import sqlmem from "@/db/sqliteMemory";
import { $Users_c } from "@/db/sqliteMemory/schemas/users.schema";
import { and, eq, gt, or, sql } from "drizzle-orm";

export const setUserCache = async (
    user: CreateUserCommand.Response["response"],
) => {
    await sqlmem
        .insert($Users_c)
        .values({
            data: user,
            id: user.id,
            tg_id: user.telegramId,
            uuid: user.uuid,
        })
        .onConflictDoUpdate({
            target: $Users_c.id,
            set: {
                data: user,
                exp: sql`(strftime('%s','now') + 3600)`,
            },
        });
    return true;
};

export const getUserCache = async ({
    tg_id,
    uuid,
}: {
    tg_id?: number;
    uuid?: string;
}) => {
    if (!tg_id && !uuid) return undefined;

    const q = await sqlmem.query.$Users_c.findFirst({
        where: and(
            gt($Users_c.exp, sql`strftime('%s','now')`),
            or(
                tg_id !== undefined ? eq($Users_c.tg_id, tg_id) : undefined,
                uuid !== undefined ? eq($Users_c.uuid, uuid) : undefined,
            ),
        ),
    });
    return q?.data;
};
