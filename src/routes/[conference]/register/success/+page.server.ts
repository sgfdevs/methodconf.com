import { error } from '@sveltejs/kit';
import { getConference } from '#lib/server/getConference.ts';
import { getSponsors } from '#lib/server/getSponsors.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const conference = await getConference(params.conference);

    if (!conference) {
        throw error(404);
    }

    return {
        conferenceSlug: params.conference,
        conference,
        layoutSponsors: await getSponsors(conference.id),
        robotsNoIndex: true,
    };
};
