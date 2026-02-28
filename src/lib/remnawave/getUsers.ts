import { GetAllUsersCommand } from "@remnawave/backend-contract";
import getRemnawaveInstance from "@utils/getRemnawaveInstance";

export default async () => {
    const url = GetAllUsersCommand.url;
    const method = GetAllUsersCommand.endpointDetails.REQUEST_METHOD;
    const reqest = async () =>
        await getRemnawaveInstance<GetAllUsersCommand.Response>(url, {
            method,
        });

    const res = await reqest();

    if ("response" in res) {
        const users = res.response.users;
        return users;
    } else {
        return res;
    }
};
