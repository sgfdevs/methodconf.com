import { buildSharedHead } from '#lib/head.ts';
import { getSiteUrl, isSearchIndexingEnabled } from '#lib/server/config.ts';

export const load = () => {
    const siteUrl = getSiteUrl().toString();

    return {
        searchIndexingEnabled: isSearchIndexingEnabled(),
        sharedHead: buildSharedHead({ siteUrl }),
    };
};
