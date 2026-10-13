export function redirectToTrailingSlash(url: URL): Response | undefined {
    if (url.pathname.endsWith('/')) {
        return undefined;
    }

    return new Response(null, {
        status: 308,
        headers: {
            location: `${url.pathname}/${url.search}`,
        },
    });
}

export function redirectFromTrailingSlash(url: URL): Response | undefined {
    if (!url.pathname.endsWith('/')) {
        return undefined;
    }

    return new Response(null, {
        status: 308,
        headers: {
            location: `${url.pathname.replace(/\/$/, '')}${url.search}`,
        },
    });
}
