import {
    CMS_PUBLIC_URL,
    NEWSLETTER_ENDPOINT,
    NEWSLETTER_LIST_ID,
    SEARCH_INDEXING_ENABLED,
    SITE_URL,
    UMBRACO_BASE_URL,
} from '$app/env/private';
import { parseUrl } from '#lib/util.ts';

function getRequiredUrl(name: string, value: string | undefined): URL {
    const url = parseUrl(value);

    if (!url) {
        throw new Error(`${name} is not a valid URL`);
    }

    return url;
}

export function getUmbracoBaseUrl(): URL {
    return getRequiredUrl('UMBRACO_BASE_URL', UMBRACO_BASE_URL);
}

export function getCmsPublicUrl(): URL {
    return getRequiredUrl('CMS_PUBLIC_URL', CMS_PUBLIC_URL);
}

export function getSiteUrl(): URL {
    return getRequiredUrl('SITE_URL', SITE_URL);
}

export function isSearchIndexingEnabled(): boolean {
    return SEARCH_INDEXING_ENABLED;
}

export function getNewsletterConfig(): {
    endpoint?: URL;
    listId?: string;
} {
    return {
        endpoint: parseUrl(NEWSLETTER_ENDPOINT),
        listId: NEWSLETTER_LIST_ID,
    };
}
