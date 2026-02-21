export default async <R>(url: string, opt: BunFetchRequestInit) => {
    const fullUrl = `${Bun.env.REMNAWAVE_PANEL_URL}/${url}`
    try {
        const res = await fetch(fullUrl, {
            ...opt,
            headers: {
                Authorization: `Bearer ${Bun.env.REMNAWAVE_API_TOKEN}`,
                "Content-Type": "application/json"
            }
        })

        const rawBody = await res.text()
        if (!rawBody.trim()) {
            console.error("[remnawave] empty response body", {
                url: fullUrl,
                status: res.status,
                statusText: res.statusText,
            })
            return { err: `Empty response from Remnawave (${res.status})` }
        }

        let parsed: unknown
        try {
            parsed = JSON.parse(rawBody)
        } catch (error) {
            console.error("[remnawave] failed to parse response JSON", {
                url: fullUrl,
                status: res.status,
                statusText: res.statusText,
                bodySample: rawBody.slice(0, 500),
                error,
            })
            return { err: `Invalid JSON response from Remnawave (${res.status})` }
        }

        if (!res.ok) {
            if (typeof parsed === "object" && parsed !== null) {
                return parsed as R
            }

            console.error("[remnawave] non-object error response", {
                url: fullUrl,
                status: res.status,
                statusText: res.statusText,
                parsed,
            })
            return { err: `Remnawave HTTP ${res.status}: ${res.statusText}` }
        }

        return parsed as R
    } catch (error) {
        console.error("[remnawave] request failed", {
            url: fullUrl,
            error,
        })
        return { err: (error as Error).message }
    }
}
