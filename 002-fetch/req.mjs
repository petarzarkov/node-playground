export const req = async ({ url, parser = "text", method = "GET", payload, timeout = 580, headers } = {}) => {
    const start = Date.now();
    const elapsed = () => Date.now() - start;
    const ac = new AbortController();
    const timeoutRequest = setTimeout(() => {
        ac.abort();
    }, timeout);
    try {
        const req = await fetch(url, {
            method,
            signal: ac.signal,
            ...headers && { headers },
            ...payload && { body: JSON.stringify(payload) }
        })

        const res = await req[parser]();
        return { ...parser === "text" ? { text: res }: { ...res }, elapsed: elapsed() }
    } catch (error) {
        if (error.message === "The operation was aborted") {
            return {
                error: "Request timed out",
                method,
                url,
                stack: new Error().stack,
                configuredTimeout: timeout,
                elapsed: elapsed()
            }
        }
        return { error: error.message, stack: error.stack }
    } finally {
        clearTimeout(timeoutRequest);
    }
}
