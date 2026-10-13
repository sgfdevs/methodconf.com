import { buildSharedHead } from '#lib/head.ts';
import {
    getCmsPublicUrl,
    getSiteUrl,
    isSearchIndexingEnabled,
} from '#lib/server/config.ts';

export const load = () => {
    const siteUrl = getSiteUrl().toString();

    return {
        cmsPublicUrl: getCmsPublicUrl().toString(),
        searchIndexingEnabled: isSearchIndexingEnabled(),
        sharedHead: buildSharedHead({ siteUrl }),
    };
};
