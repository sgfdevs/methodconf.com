import { error } from '@sveltejs/kit';
import { getDefaultConference } from '#lib/server/getDefaultConference.ts';
import { redirectToTrailingSlash } from '#lib/server/slashRedirect.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

export const GET: RequestHandler = async ({ url }) => {
    const canonicalRedirect = redirectToTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    const conference = await getDefaultConference();

    if (!conference) {
        error(404);
    }

    const path = (conference.route.path ?? '/').replace(/\/$/, '');

    return new Response(null, {
        status: 308,
        headers: {
            location: `${path}/register/`,
        },
    });
};
