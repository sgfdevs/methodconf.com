import { getUmbracoBaseUrl } from '#lib/server/config.ts';
import { redirectFromTrailingSlash } from '#lib/server/slashRedirect.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

const FORWARDED_REQUEST_HEADERS = [
    'accept',
    'range',
    'if-none-match',
    'if-modified-since',
];

function getMediaPath(pathname: string): string {
    return pathname
        .replace(/^\/cms-media\/?/, '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join('/');
}

async function proxyCmsMedia({ request, url }: Parameters<RequestHandler>[0]) {
    const canonicalRedirect = redirectFromTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    const upstreamUrl = new URL(
        getMediaPath(url.pathname),
        `${getUmbracoBaseUrl().toString().replace(/\/$/, '')}/`,
    );
    upstreamUrl.search = url.search;

    const headers = new Headers();

    for (const headerName of FORWARDED_REQUEST_HEADERS) {
        const headerValue = request.headers.get(headerName);

        if (headerValue) {
            headers.set(headerName, headerValue);
        }
    }

    const response = await fetch(upstreamUrl, {
        method: request.method,
        headers,
    });

    return new Response(request.method === 'HEAD' ? null : response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}

export const GET: RequestHandler = proxyCmsMedia;
export const HEAD: RequestHandler = proxyCmsMedia;
