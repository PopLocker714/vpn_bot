export interface WebhookHeaders {
    "x-remnawave-signature": string;
    "x-remnawave-timestamp": string;
}

export async function validateWebhookHcmc(
    req: Request,
    secret?: string,
): Promise<boolean> {
    const signatureHeader = req.headers.get("x-remnawave-signature") ?? "";
    if (!signatureHeader || !secret) return false;

    const rawBody = await req.text();
    if (!rawBody.trim()) return false;

    let payload: unknown;
    try {
        payload = JSON.parse(rawBody);
    } catch (error) {
        console.error("[webhook] invalid json payload", error);
        return false;
    }

    const hasher = new Bun.CryptoHasher("sha256", secret);
    hasher.update(JSON.stringify(payload));
    const signature = hasher.digest("hex");

    console.log("v2", signature);
    console.log("v2", signatureHeader);

    return signature === signatureHeader;
}
