import { parseUrl } from '#lib/util.ts';

export interface OveItIframeState {
    embedId?: string;
    iframeUrl: URL;
}

export function buildOveItIframeState(
    embedUrl: string,
    locationHash = '',
): OveItIframeState | undefined {
    const iframeUrl = parseUrl(embedUrl);

    if (!iframeUrl) {
        return;
    }

    const embedId = iframeUrl.searchParams.get('id') ?? undefined;

    if (embedId && locationHash) {
        const hash = locationHash.startsWith('#')
            ? locationHash.substring(1)
            : locationHash;
        const parts = hash.split('/');

        if (parts.length >= 2 && parts[0] === embedId && parts[1]) {
            iframeUrl.searchParams.set('next', parts[1]);
        }
    }

    return { embedId, iframeUrl };
}
