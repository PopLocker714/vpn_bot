import { remnawaveService } from "@lib/remnawave";

const main = async () => {
    const users = await remnawaveService.user.getAll();

    if ("err" in users) {
        throw new Error(`Failed get users: ${users.err}`);
    }

    for (const user of users) {
        const res = await remnawaveService.user.delete({ uuid: user.uuid });
        console.log(res);
    }

    Bun.spawnSync(["rm", "dev.sqlite"]);
    Bun.spawnSync(["rm", "dev.sqlite-shm"]);
    Bun.spawnSync(["rm", "dev.sqlite-wal"]);
};

await main();
