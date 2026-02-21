import type { ExtractedUpdate } from "@effect-ak/tg-bot";
import { referalService } from "@lib/referal.methods";
import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import { mdv2 } from "@utils/telegramMarkdown";
import type { ICTX } from "@/types";

export default async ({ update }: ICTX<"message" | "callback_query">) => {
	const chat_id = "chat" in update ? update.chat.id : update.from.id;
	const existUser = await remnawaveService.user.getByTelegramId(chat_id, true);

	if (!existUser) {
		await executeMethod("send_message", {
			chat_id,
			parse_mode: "MarkdownV2",
			text: mdv2`Пользователь не зарегистрирован, нажмите /start`,
		});
		return;
	}

	if ("err" in existUser) {
		await executeMethod("send_message", {
			chat_id,
			parse_mode: "MarkdownV2",
			text: mdv2`Ошибка ${existUser.err}`,
		});
		return;
	}

	if (update.type === "callback_query") {
		const cb = update as ExtractedUpdate<"callback_query">;
		executeMethod("answer_callback_query", { callback_query_id: cb.id });
	}

	const link = `https://t.me/${Bun.env.BOT_NAME}?start=${referalService.generateRefCode(existUser.uuid)}`;

	await executeMethod("send_message", {
		chat_id,
		text: mdv2`
🚀 Приглашай друзей — получай дни подписки бесплатно!

Скопируируй свою реферальную ссылку, отправь её друзьям и зарабатывай бонусы 🎁

Как это работает:
— Друг оплачивает подписку на любую сумму
— Ты получаешь *+15 дней к своей подписке*
— Друг получает *+7 дней бонусом*

🔥 Чем больше друзей — тем больше дней бесплатной подписки для тебя!
Приглашай без ограничений и продлевай доступ снова и снова.`,
		parse_mode: "MarkdownV2",
		reply_markup: {
			inline_keyboard: [
				[{ text: "Копировать сылку", copy_text: { text: link } }],
			],
		},
	});
};
