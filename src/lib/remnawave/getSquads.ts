import { GetInternalSquadsCommand } from "@remnawave/backend-contract"
import getRemnawaveInstance from "@utils/getRemnawaveInstance"

export default async () => {
    const url = GetInternalSquadsCommand.url
    const method = GetInternalSquadsCommand.endpointDetails.REQUEST_METHOD

    const res = await getRemnawaveInstance<GetInternalSquadsCommand.Response>(url, {
        method
    })

    return res
}
