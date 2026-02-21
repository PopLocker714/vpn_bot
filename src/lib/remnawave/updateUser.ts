import { UpdateUserCommand } from "@remnawave/backend-contract";
import { setUserCache } from "@utils/cache/user.cache";
import getRemnawaveInstance from "@utils/getRemnawaveInstance";

interface IParams {
	expireAt: Date;
	status: UpdateUserCommand.Request["status"];
	activeInternalSquads: UpdateUserCommand.Request["activeInternalSquads"];
	uuid: UpdateUserCommand.Request["uuid"];
	description?: string;
	tag?: string;
}

export default async ({
	expireAt,
	status,
	activeInternalSquads,
	uuid,
	description,
	tag,
}: IParams) => {
	const url = UpdateUserCommand.url;
	const method = UpdateUserCommand.endpointDetails.REQUEST_METHOD;

	const res = await getRemnawaveInstance<UpdateUserCommand.Response>(url, {
		method,
		body: JSON.stringify({
			uuid,
			status,
			expireAt,
			activeInternalSquads,
			description,
			tag,
		} as UpdateUserCommand.Request),
	});

	if ("response" in res) {
		const user = res.response;
		await setUserCache(user).then((data) => {
			console.log("cache user", data);
		});
		return user;
	} else {
		return res;
	}
};
