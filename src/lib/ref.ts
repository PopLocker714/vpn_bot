const sign = (data: Bun.BlobOrStringOrBuffer, secret: string) => {
    const h = new Bun.CryptoHasher("sha256", secret)

    console.log('==signdata', data)
    h.update(data)
    const res = h.digest("base64url")
    console.log('==sign', res)
    console.log('==sign', res.slice(0, 10))
    return res.slice(0, 10)
}

export const generateRefCode = (userId: string) => {
    const sig = sign(userId, Bun.env.REF_SECRET!)
    return Buffer.from(`${userId}.${sig}`).toString("base64url")
}

export const verifyRefCode = (code: string) => {
    try {
        const raw = Buffer.from(code, "base64url").toString()
        const [userId, sig] = raw.split(".")

        console.log("raw", raw)
        console.log("userId", userId)
        console.log("sig", sig)

        if (!userId || !sig) return null

        const expected = sign(userId, Bun.env.REF_SECRET!)
        console.log("expected", expected)
        console.log(sig === expected)

        if (sig !== expected) return null

        return userId
    } catch {
        return null
    }
}
