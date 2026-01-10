import type { ICTX } from "@/types";
import executeMethod from "@utils/executeMethod";

interface IParams extends ICTX<'pre_checkout_query'> {
    // data: ICallbackDataSubscribe
}

export default async ({ update }: IParams) => {

    console.log("invoice_payload", JSON.parse(update.invoice_payload))
    await executeMethod('answer_pre_checkout_query', { ok: true, pre_checkout_query_id: update.id })
}
