import executeMethod from "@utils/executeMethod";
import type { ICTX } from "@/types";

interface IParams extends ICTX<"pre_checkout_query"> {
    // data: ICallbackDataSubscribe
}

export default async ({ update }: IParams) => {
    try {
        console.log("invoice_payload", JSON.parse(update.invoice_payload));
    } catch (error) {
        console.error(
            "Failed to parse pre_checkout invoice_payload:",
            update.invoice_payload,
            error,
        );
    }
    await executeMethod("answer_pre_checkout_query", {
        ok: true,
        pre_checkout_query_id: update.id,
    });
};
