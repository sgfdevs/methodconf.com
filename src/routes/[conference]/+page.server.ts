import { error } from '@sveltejs/kit';
import { buildGenericPageHead } from '#lib/pageHead.ts';
import { getPageBlocks } from '#lib/pageBlocks.ts';
import { getConference } from '#lib/server/getConference.ts';
import {
    getPageDataForBlocks,
    type AdditionalPageData,
} from '#lib/server/getPageDataForBlocks.ts';
import { getSiteUrl } from '#lib/server/config.ts';
import { getItemByPathOrDefault } from '#lib/server/umbraco/getItemByPath.ts';
import type { Page } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const conference = await getConference(params.conference);

    if (!conference) {
        throw error(404);
    }

    const page = await getItemByPathOrDefault(`${params.conference}/home`, {
        expand: 'properties[$all]',
    });

    if (page?.contentType !== 'home') {
        throw error(404);
    }

    const blocks = getPageBlocks(page);
    const pageData: AdditionalPageData = await getPageDataForBlocks(
        conference,
        blocks,
    );

    return {
        conferenceSlug: params.conference,
        conference,
        page: page as Page,
        ...pageData,
        sharedHead: buildGenericPageHead({
            page: page as Page,
            siteUrl: getSiteUrl().toString(),
        }),
    };
};
