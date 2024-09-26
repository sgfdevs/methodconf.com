import { _throw, parseUrl } from '@/util';

export const CST_TZ = 'America/Chicago';

export const NEWSLETTER_ENDPOINT = parseUrl(process.env.NEWSLETTER_ENDPOINT);
export const NEWSLETTER_LIST_ID = process.env.NEWSLETTER_LIST_ID;
export const NEXT_PUBLIC_UMBRACO_BASE_URL =
    parseUrl(process.env.NEXT_PUBLIC_UMBRACO_BASE_URL) ??
    _throw('NEXT_PUBLIC_UMBRACO_BASE_URL is not a valid url');
export const NEXT_PUBLIC_SITE_URL =
    parseUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    _throw('NEXT_PUBLIC_SITE_URL is not a valid url');
