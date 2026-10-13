const CMS_MEDIA_URL_PATTERN =
    /(?<attribute>\b(?:href|src)=["'])(?<url>(?:https?:\/\/[^"']+)?\/media\/[^"']+)(?<quote>["'])/gi;

function rewriteCmsMediaUrl(url: string): string {
    if (url.startsWith('/cms-media/')) {
        return url;
    }

    if (url.startsWith('/media/')) {
        return `/cms-media${url}`;
    }

    try {
        const parsed = new URL(url);

        if (!parsed.hostname.endsWith('methodconf.com')) {
            return url;
        }

        return `/cms-media${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
        return url;
    }
}

export function rewriteRichTextMediaUrls(markup: string): string {
    return markup.replace(
        CMS_MEDIA_URL_PATTERN,
        (_match, attribute: string, url: string, quote: string) =>
            `${attribute}${rewriteCmsMediaUrl(url)}${quote}`,
    );
}
