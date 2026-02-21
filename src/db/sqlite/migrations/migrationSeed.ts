import { referalService } from "@lib/referal.methods";
import { remnawaveService } from "@lib/remnawave";

export const migrationSeed = async () => {
    const users = await remnawaveService.user.getAll();

    if ("err" in users) {
        throw new Error(`Failed migration seed: ${users.err}`);
    }

    for (const user of users) {
        await referalService.createIfNotExists({
            user_id: user.uuid,
            referals: [],
        });
    }

    console.log("✅ Referral seed done");
};
