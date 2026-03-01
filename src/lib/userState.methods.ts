import { eq } from "drizzle-orm";
import sqlmem from "@/db/sqliteMemory";
import {
    $UserStates,
    type UserStatePayloadMap,
} from "@/db/sqliteMemory/schemas/userState.schema";

export type UserState = {
    [K in keyof UserStatePayloadMap]: {
        type: K;
        payload: UserStatePayloadMap[K];
    };
}[keyof UserStatePayloadMap];

const TTL = 15 * 60 * 1000; // 15 минут

async function setState<T extends keyof UserStatePayloadMap>(
    userId: number,
    type: T,
    payload: UserStatePayloadMap[T],
) {
    const exp = new Date(Date.now() + TTL);

    await sqlmem
        .insert($UserStates)
        .values({
            userId,
            stateType: type,
            payload,
            exp,
        })
        .onConflictDoUpdate({
            target: $UserStates.userId,
            set: {
                stateType: type,
                payload,
                exp,
            },
        });
}

async function getState(userId: number): Promise<UserState> {
    const row = await sqlmem.query.$UserStates.findFirst({
        where: eq($UserStates.userId, userId),
    });

    if (!row) {
        return { type: "idle", payload: null };
    }

    // проверяем протух ли state
    if (row.exp.getTime() < Date.now()) {
        await clearState(userId);
        return { type: "idle", payload: null };
    }

    return {
        type: row.stateType,
        payload: row.payload,
    } as UserState;
}

async function clearState(userId: number) {
    await sqlmem.delete($UserStates).where(eq($UserStates.userId, userId));
}

export const userStateService = {
    setState,
    getState,
    clearState,
};
