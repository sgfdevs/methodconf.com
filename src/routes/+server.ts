import { error } from '@sveltejs/kit';
import { getDefaultConference } from '#lib/server/getDefaultConference.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const conference = await getDefaultConference();

    if (!conference) {
        error(404);
    }

    return new Response(null, {
        status: 307,
        headers: {
            location: conference.route.path ?? '/',
        },
    });
};
