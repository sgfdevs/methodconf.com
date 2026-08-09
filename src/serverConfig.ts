import 'server-only';
import { parseUrl } from '@/util';

function getRequiredUrl(name: string): URL {
    const url = parseUrl(process.env[name]);

    if (!url) {
        throw new Error(`${name} is not a valid URL`);
    }

    return url;
}

export function getUmbracoBaseUrl(): URL {
    return getRequiredUrl('UMBRACO_BASE_URL');
}

export function getCmsPublicUrl(): URL {
    return getRequiredUrl('CMS_PUBLIC_URL');
}

export function getSiteUrl(): URL {
    return getRequiredUrl('SITE_URL');
}

export function getNewsletterConfig(): {
    endpoint?: URL;
    listId?: string;
} {
    return {
        endpoint: parseUrl(process.env.NEWSLETTER_ENDPOINT),
        listId: process.env.NEWSLETTER_LIST_ID,
    };
}
