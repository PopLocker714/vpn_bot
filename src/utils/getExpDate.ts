export default (expireAt: Date) => {
    const MS_IN_HOUR = 1000 * 60 * 60
    const MS_IN_DAY = MS_IN_HOUR * 24

    const diffMs = expireAt.getTime() - Date.now()

    const days = Math.floor(diffMs / MS_IN_DAY)
    const hours = Math.floor((diffMs % MS_IN_DAY) / MS_IN_HOUR)

    return `${days} дн\\. ${hours} ч\\.`
}
