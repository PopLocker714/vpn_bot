export interface WebhookHeaders {
    "x-remnawave-signature": string
    "x-remnawave-timestamp": string
}

// export function validateWebhook(
//     body: unknown,
//     signatureHeader?: string | null,
//     webhookSecret?: string,
// ): boolean {
//     if (!webhookSecret) return false
//     if (!signatureHeader) return false
//     const hasher = new Bun.CryptoHasher("sha256", webhookSecret)
//     hasher.update(JSON.stringify(body))
//     const signature = hasher.digest("hex")
//     return signature === signatureHeader
// }

export function validateWebhook(
    rawBody: string,
    signature: string,
    secret: string,
): boolean {
    if (!secret || !signature) return false

    const hasher = new Bun.CryptoHasher("sha256", secret)
    hasher.update(rawBody)

    const expected = hasher.digest("hex")

    return expected === signature
}
