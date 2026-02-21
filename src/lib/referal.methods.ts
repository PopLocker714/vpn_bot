import { eq } from "drizzle-orm";
import sqldb from "@/db/sqlite";
import { $Referal, type TIReferal } from "@/db/sqlite/schemas/referal.schema";

const createIfNotExists = async (referal: TIReferal) => {
	try {
		await sqldb.insert($Referal).values(referal).onConflictDoNothing();
	} catch (e) {
		console.error("[error]: insert referral failed", e);
	}
};

const create = async (referal: TIReferal) => {
	try {
		await sqldb.insert($Referal).values(referal);
	} catch (e) {
		console.error("[error]: (create) insert referal faild", e);
	}
};

const get = async (userId: string) => {
	return await sqldb.query.$Referal.findFirst({
		where: eq($Referal.user_id, userId),
	});
};

const setBy = async (user_id: string, referal_by: string) => {
	try {
		await sqldb
			.update($Referal)
			.set({ referal_by })
			.where(eq($Referal.user_id, user_id));
	} catch (e) {
		console.error("[error]: (setBy) insert referal faild", e);
	}
};

const addRef = async (user_id: string, referal: string) => {
	try {
		const currentReferal = await sqldb.query.$Referal.findFirst({
			where: eq($Referal.user_id, user_id),
		});
		if (!currentReferal) throw new Error("Not found referal");
		const isExist = currentReferal.referals.find((id) => id === referal);
		if (!isExist) {
			await sqldb
				.update($Referal)
				.set({ user_id, referals: [...currentReferal.referals, referal] })
				.where(eq($Referal.user_id, user_id));
			return true;
		}
	} catch (e) {
		console.error("[error]: add referal faild", e);
	}
	return false;
};

const sign = (data: Bun.BlobOrStringOrBuffer, secret: string) => {
	const h = new Bun.CryptoHasher("sha256", secret);
	h.update(data);
	const res = h.digest("base64url");
	return res.slice(0, 10);
};

const generateRefCode = (userId: string) => {
	const sig = sign(userId, Bun.env.REF_SECRET!);
	return Buffer.from(`${userId}.${sig}`).toString("base64url");
};

export const verifyRefCode = (code: string) => {
	try {
		const raw = Buffer.from(code, "base64url").toString();
		const [userId, sig] = raw.split(".");
		if (!userId || !sig) return null;
		const expected = sign(userId, Bun.env.REF_SECRET!);
		if (sig !== expected) return null;
		return userId;
	} catch {
		return null;
	}
};

export const referalService = {
	get,
	setBy,
	create,
	addRef,
	generateRefCode,
	verifyRefCode,
	createIfNotExists,
};
