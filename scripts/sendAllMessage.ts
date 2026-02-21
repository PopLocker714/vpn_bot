import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import { mdv2 } from "@utils/telegramMarkdown";

const main = async () => {
    const users = await remnawaveService.user.getAll();

    if ("err" in users) {
        throw new Error(`Failed send message: ${users.err}`);
    }

    for (const user of users) {
        if (user.telegramId) {
            executeMethod("send_message", {
                chat_id: user.telegramId,
                text: mdv2`Если не работает соединение нажмите на кнопку обновления в вашем приложении она выглядит примерно так 🔄`,
                parse_mode: "MarkdownV2",
            });
        }
    }
};

await main();
