import { buildSharedHead } from '#lib/head.ts';
import {
    getCmsPublicUrl,
    getMediaPublicUrl,
    getSiteUrl,
    isSearchIndexingEnabled,
} from '#lib/server/config.ts';

export const load = () => {
    const siteUrl = getSiteUrl().toString();

    return {
        cmsPublicUrl: getCmsPublicUrl().toString(),
        mediaPublicUrl: getMediaPublicUrl().toString(),
        searchIndexingEnabled: isSearchIndexingEnabled(),
        sharedHead: buildSharedHead({ siteUrl }),
    };
};
