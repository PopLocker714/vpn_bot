import { DeleteUserCommand } from "@remnawave/backend-contract";
import getRemnawaveInstance from "@utils/getRemnawaveInstance";

interface IParams {
	uuid: DeleteUserCommand.Request["uuid"];
}

export default async ({ uuid }: IParams) => {
	const url = DeleteUserCommand.url(uuid);
	const method = DeleteUserCommand.endpointDetails.REQUEST_METHOD;

	const res = await getRemnawaveInstance<DeleteUserCommand.Response>(url, {
		method,
		body: JSON.stringify({
			uuid,
		} as DeleteUserCommand.Request),
	});

	if ("response" in res) {
		const data = res.response;
		return data;
	} else {
		return res;
	}
};
