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

export function partition<T>(
    items: T[],
    isValid: (item: T) => boolean,
): [T[], T[]] {
    const pass: T[] = [];
    const fail: T[] = [];

    for (const item of items) {
        (isValid(item) ? pass : fail).push(item);
    }

    return [pass, fail];
}
