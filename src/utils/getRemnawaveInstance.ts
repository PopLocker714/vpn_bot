export default async <R>(url: string, opt: BunFetchRequestInit) => {
    const res = await fetch(`${Bun.env.REMNAWAVE_PANEL_URL}/${url}`, {
        ...opt,
        headers: {
            Authorization: `Bearer ${Bun.env.REMNAWAVE_API_TOKEN}`,
            "Content-Type": "application/json"
        }
    })

    if (!res.ok) {
        return await res.json() as R
    }

    try {
        const response = await res.json() as R
        return response
    } catch (e) {
        console.error(e)
        return { err: (e as Error).message }
    }

}
