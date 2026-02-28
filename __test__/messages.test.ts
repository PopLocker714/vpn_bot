import { describe, expect, test } from "bun:test";
import executeMethod from "@utils/executeMethod";
import { SUPPORTED_LANGS, t } from "@utils/translateHelper";
import { startMsgParams } from "@/api/start/start";

const chat_id = Number(Bun.env.BOT_ADMIN_ID);

describe("START MESSAGES", async () => {
    for (const lang of SUPPORTED_LANGS) {
        test(`start_welcome (${lang})`, async () => {
            const res = await executeMethod("send_message", {
                ...startMsgParams,
                text: t(lang, "start_welcome", "@sis9127!@#$%^&*()_+"),
                chat_id,
            });
            await Bun.sleep(1000);
            expect(res.ok).toBe(true);
        });
    }

    test("3 + 3", () => {
        expect(3 + 3).toBe(6);
    });
});
