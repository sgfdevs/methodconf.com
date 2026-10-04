import { error } from '@sveltejs/kit';
import { getConference } from '#lib/server/getConference.ts';
import { redirectToTrailingSlash } from '#lib/server/slashRedirect.ts';
import { parseUrl } from '#lib/util.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

export const GET: RequestHandler = async ({ params, url }) => {
    const canonicalRedirect = redirectToTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    const conference = await getConference(params.conference);
    const targetUrl = parseUrl(conference?.properties.callForSpeakersUrl);

    if (!targetUrl) {
        error(404);
    }

    return new Response(null, {
        status: 307,
        headers: {
            location: targetUrl.toString(),
        },
    });
};
