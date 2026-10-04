import { redirectToTrailingSlash } from '#lib/server/slashRedirect.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

export const GET: RequestHandler = ({ url }) => {
    const canonicalRedirect = redirectToTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    return new Response(null, {
        status: 307,
        headers: {
            location: '/register/',
        },
    });
};
