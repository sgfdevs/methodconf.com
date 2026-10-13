import { error } from '@sveltejs/kit';
import { buildGenericPageHead, buildSpeakerHead } from '#lib/pageHead.ts';
import { getPageBlocks } from '#lib/pageBlocks.ts';
import { getConference } from '#lib/server/getConference.ts';
import {
    getPageDataForBlocks,
    type AdditionalPageData,
} from '#lib/server/getPageDataForBlocks.ts';
import { getSessionsForSpeaker } from '#lib/server/getSessionsForSpeaker.ts';
import { getSponsors } from '#lib/server/getSponsors.ts';
import { getSiteUrl } from '#lib/server/config.ts';
import { getItemByPathOrDefault } from '#lib/server/umbraco/getItemByPath.ts';
import type { Page, Speaker } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const conference = await getConference(params.conference);

    if (!conference) {
        throw error(404);
    }

    const item = await getItemByPathOrDefault(
        `${params.conference}/${params.slug}`,
        { expand: 'properties[$all]' },
    );

    if (!item) {
        throw error(404);
    }

    const siteUrl = getSiteUrl().toString();

    if (item.contentType === 'speaker') {
        const [layoutSponsors, sessions] = await Promise.all([
            getSponsors(conference.id),
            getSessionsForSpeaker(conference.id, item.id),
        ]);

        return {
            conferenceSlug: params.conference,
            conference,
            item: item as Speaker,
            layoutSponsors,
            sessions,
            sharedHead: buildSpeakerHead({
                speaker: item as Speaker,
                siteUrl,
            }),
        };
    }

    if (item.contentType === 'page') {
        const blocks = getPageBlocks(item);
        const [layoutSponsors, pageData]: [
            Awaited<ReturnType<typeof getSponsors>>,
            AdditionalPageData,
        ] = await Promise.all([
            getSponsors(conference.id),
            getPageDataForBlocks(conference, blocks),
        ]);

        return {
            conferenceSlug: params.conference,
            conference,
            item: item as Page,
            layoutSponsors,
            ...pageData,
            sharedHead: buildGenericPageHead({
                page: item as Page,
                siteUrl,
            }),
        };
    }

    throw error(404);
};
