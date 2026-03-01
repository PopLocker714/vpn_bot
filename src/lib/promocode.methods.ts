import { and, eq } from "drizzle-orm";
import sqldb from "@/db/sqlite";
import {
    $codes,
    $codeUses,
    type TSCodes,
} from "@/db/sqlite/schemas/codes.schema";

export const promoCodeService = {
    // Проверка валидности кода
    async isValid(code: string): Promise<TSCodes | null> {
        const row = await sqldb.query.$codes.findFirst({
            where: eq($codes.code, code),
        });

        if (!row) return null;
        if (row.disabled) return null;
        if (row.usesCount >= row.maxUses) return null;
        if (row.expireAt.getTime() < Date.now()) return null;

        return row;
    },

    // Проверка, использовал ли пользователь код
    async isUsedByUser(codeId: number, userUuid: string): Promise<boolean> {
        const usage = await sqldb.query.$codeUses.findFirst({
            where: and(
                eq($codeUses.codeId, codeId),
                eq($codeUses.userUuid, userUuid),
            ),
        });
        return !!usage;
    },

    // Отметить использование пользователем
    async useCode(codeRow: TSCodes, userUuid: string) {
        const alreadyUsed = await this.isUsedByUser(codeRow.id, userUuid);
        if (alreadyUsed) throw new Error("User already used this code");

        // атомарно добавляем запись в code_uses и увеличиваем usesCount
        await sqldb.transaction(async (tx) => {
            await tx.insert($codeUses).values({
                codeId: codeRow.id,
                userUuid,
            });

            await tx
                .update($codes)
                .set({ usesCount: codeRow.usesCount + 1 })
                .where(eq($codes.id, codeRow.id));
        });
    },

    // Основной метод для Telegram FSM
    async redeemCode(userUuid: string, code: string) {
        const row = await this.isValid(code);
        if (!row) return { success: false, reason: "invalid" };

        const alreadyUsed = await this.isUsedByUser(row.id, userUuid);
        if (alreadyUsed) return { success: false, reason: "already_used" };

        await this.useCode(row, userUuid);
        return { success: true, code: row.code };
    },

    // Получить код с пользователями, кто его использовал (relations)
    async getCodeWithUses(code: string) {
        return await sqldb.query.$codes.findFirst({
            where: eq($codes.code, code),
            with: { uses: true }, // подтягиваем все использования
        });
    },
};
