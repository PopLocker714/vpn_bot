export default (expAt: Date | string, days: number) => {
    const expireAt = new Date(expAt)

    const extraMs = 1000 * 60 * 60 * 24 * days;

    const newExpAt = expireAt > new Date()
        ? new Date(expireAt.getTime() + extraMs)
        : new Date(Date.now() + extraMs);

    return newExpAt
}
