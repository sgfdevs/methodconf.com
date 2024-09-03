export function _throw(msg: string): never {
    throw msg;
}

export function parseUrl(urlStr?: string | null): URL | undefined {
    if (!urlStr) {
        return;
    }

    try {
        return new URL(urlStr);
    } catch (e) {
        return;
    }
}
