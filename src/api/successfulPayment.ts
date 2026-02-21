import { MESSAGE_EFFECTS } from "@effect-ak/tg-bot-client";
import { referalService } from "@lib/referal.methods";
import { remnawaveService } from "@lib/remnawave";
import executeMethod from "@utils/executeMethod";
import getNewExpireAt from "@utils/getNewExpireAt";
import { mdv2 } from "@utils/telegramMarkdown";
import { backButtonMenu } from "@/buttons";
import sqldb from "@/db/sqlite";
import { $Transactions } from "@/db/sqlite/schemas/transaction.schema";
import type { ICallbackDataSubscribe, ICTX } from "@/types";

interface IParams extends ICTX<"message"> {}

export default async ({ update }: IParams) => {
	if (!update.successful_payment) return;

	let payload: ICallbackDataSubscribe;
	try {
		payload = JSON.parse(
			update.successful_payment.invoice_payload,
		) as ICallbackDataSubscribe;
	} catch (error) {
		console.error(
			"Failed to parse successful_payment invoice_payload JSON:",
			update.successful_payment.invoice_payload,
			error,
		);
		await executeMethod("send_message", {
			chat_id: update.chat.id,
			text: mdv2`Ошибка оплаты: не удалось обработать данные платежа. Напишите в поддержку.`,
			parse_mode: "MarkdownV2",
		});
		return;
	}

	const user = await remnawaveService.user.getByTelegramId(update.chat.id);
	const squds = await remnawaveService.squads.getSquads();

	if ("response" in squds && user && !("err" in user)) {
		let giftReferDays = 0;

		const refer = await referalService.get(user.uuid);
		if (refer) {
			if (refer.referal_by) {
				const isInsert = await referalService.addRef(
					refer.referal_by,
					user.uuid,
				);
				if (isInsert) {
					giftReferDays += 7;
					await remnawaveService.user.addDays(refer.referal_by, 15);
					const referal_by = await remnawaveService.user.getByUuid(
						refer.referal_by,
						true,
					);

					if ("telegramId" in referal_by) {
						if (referal_by.telegramId) {
							await executeMethod("send_message", {
								chat_id: referal_by.telegramId,
								text: mdv2`Привет вот бонус за друга 15 дней`,
								parse_mode: "MarkdownV2",
							});
						}
					}
				}
			}
		}

		const squadsUuids = squds.response.internalSquads.map(
			(squad) => squad.uuid,
		);
		const newExpireAt = getNewExpireAt(
			user.expireAt,
			payload.days + giftReferDays,
		);

		const resUpdatedUser = await remnawaveService.user.update({
			uuid: user.uuid,
			activeInternalSquads: squadsUuids,
			status: "ACTIVE",
			expireAt: newExpireAt,
			description: `
PAYMENT_PROVIDER: ${update.successful_payment.provider_payment_charge_id}
TELEGRAM_PROVIDE: ${update.successful_payment.telegram_payment_charge_id}
PAYMENT_DATE: ${new Date().toLocaleString()}
PAYLOAD: ${JSON.stringify(payload, null, 2)}
`,
		});

		await sqldb
			.insert($Transactions)
			.values({
				provider_payment_charge_id:
					update.successful_payment.provider_payment_charge_id,
				telegram_payment_charge_id:
					update.successful_payment.telegram_payment_charge_id,
				user_id: user.uuid,
				data: update.successful_payment,
			})
			.then(() => console.log("succes saved payment"))
			.catch((e) => {
				console.error("[eroor] faild saved transaction", e);
			});

		if ("err" in resUpdatedUser || "statusCode" in resUpdatedUser) {
			if ("message" in resUpdatedUser) {
				await executeMethod("send_message", {
					chat_id: update.chat.id,
					text: mdv2`Произашла внутренняя ошибка: ${resUpdatedUser.message}`,
					parse_mode: "MarkdownV2",
				});
			}

			if ("err" in resUpdatedUser) {
				await executeMethod("send_message", {
					chat_id: update.chat.id,
					text: mdv2`Произашла внутренняя ошибка: ${resUpdatedUser.err}`,
					parse_mode: "MarkdownV2",
				});
			}

			return;
		}

		if ("uuid" in resUpdatedUser) {
			const refer_by_res = refer?.referal_by
				? await remnawaveService.user.getByUuid(refer?.referal_by)
				: undefined;
			if (refer_by_res && "id" in refer_by_res && giftReferDays > 0) {
				await executeMethod("send_message", {
					chat_id: update.chat.id,
					text: mdv2`Мы добавили бонусные ${giftReferDays} дней за то, что вас пригласил *${refer_by_res.username}*`,
					parse_mode: "MarkdownV2",
					message_effect_id: MESSAGE_EFFECTS["🎉"],
				});
			}

			await executeMethod("send_message", {
				chat_id: update.chat.id,
				text: mdv2`
🎉 Оплата прошла успешно!
Ниже будет ссылка на инструкцию для подключения
Если не получается подключться обратитесь в поддержку
Приятного пользования 😉`,
				parse_mode: "MarkdownV2",
				message_effect_id: MESSAGE_EFFECTS["🎉"],
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: "Подключиться",
								url: `${Bun.env.REMNAWAVE_WEB}/${resUpdatedUser.shortUuid}`,
							},
						],
						[backButtonMenu],
					],
				},
			});
			return;
		}
	}
};
