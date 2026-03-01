import { sql } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type UserState = {
    [K in keyof UserStatePayloadMap]: {
        type: K;
        payload: UserStatePayloadMap[K];
    };
}[keyof UserStatePayloadMap];

export const userStateEnum = ["idle", "input_create_code"] as const;

export type EUserStateType = (typeof userStateEnum)[number];

export type UserStatePayloadMap = {
    idle: null;
    input_create_code: {
        code: string;
        expDays: number | null;
        userCount: number | null;
    };
};

const TTL = 15 * 60 * 1000; // 15 минут

export const $UserStates = sqliteTable("user_states", {
    userId: int("user_id").primaryKey(),
    stateType: text("state_type", {
        enum: userStateEnum,
    }).notNull(),
    payload: text("payload", { mode: "json" }).$type<
        UserStatePayloadMap[keyof UserStatePayloadMap]
    >(),
    exp: int({ mode: "timestamp" })
        .notNull()
        .$defaultFn(() => sql`(strftime('%s','now') + ${TTL})`),
});

export type TIUserStates = typeof $UserStates.$inferInsert;
export type TSUserStates = typeof $UserStates.$inferSelect;
