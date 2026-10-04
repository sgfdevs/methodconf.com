import * as privateEnv from '$app/env/private';
import { parseUrl } from '#lib/util.ts';

function getRequiredUrl(name: string, value: string | undefined): URL {
    const url = parseUrl(value);

    if (!url) {
        throw new Error(`${name} is not a valid URL`);
    }

    return url;
}

export function getUmbracoBaseUrl(): URL {
    return getRequiredUrl('UMBRACO_BASE_URL', privateEnv.UMBRACO_BASE_URL);
}

export function getCmsPublicUrl(): URL {
    return getRequiredUrl('CMS_PUBLIC_URL', privateEnv.CMS_PUBLIC_URL);
}

export function getSiteUrl(): URL {
    return getRequiredUrl('SITE_URL', privateEnv.SITE_URL);
}

export function isSearchIndexingEnabled(): boolean {
    return privateEnv.SEARCH_INDEXING_ENABLED;
}

export function getNewsletterConfig(): {
    endpoint?: URL;
    listId?: string;
} {
    return {
        endpoint: parseUrl(privateEnv.NEWSLETTER_ENDPOINT),
        listId: privateEnv.NEWSLETTER_LIST_ID,
    };
}
