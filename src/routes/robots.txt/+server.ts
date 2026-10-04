import { isSearchIndexingEnabled } from '#lib/server/config.ts';
import { redirectFromTrailingSlash } from '#lib/server/slashRedirect.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

export const GET: RequestHandler = ({ url }) => {
    const canonicalRedirect = redirectFromTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    const directive = isSearchIndexingEnabled() ? 'Allow' : 'Disallow';

    return new Response(`User-Agent: *\n${directive}: /\n`, {
        headers: {
            'content-type': 'text/plain',
        },
    });
};
