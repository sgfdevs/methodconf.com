import { _throw, parseUrl } from '@/util';

export const CST_TZ = 'America/Chicago';

export const APPLE_APP_STORE_LINK =
    'https://apps.apple.com/us/app/method-conf/id1498359521';
export const GOOGLE_PLAY_STORE_LINK =
    'https://play.google.com/store/apps/details?id=com.sgfdevs.methodConfApp';
export const BUILDING_MAP =
    'https://cms.methodconf.com/media/wixhir55/building-map.pdf';
export const PARKING_MAP =
    'https://cms.methodconf.com/media/pw1lyaa4/parking-map.pdf';

export const NEWSLETTER_ENDPOINT = parseUrl(process.env.NEWSLETTER_ENDPOINT);
export const NEWSLETTER_LIST_ID = process.env.NEWSLETTER_LIST_ID;
export const NEXT_PUBLIC_UMBRACO_BASE_URL =
    parseUrl(process.env.NEXT_PUBLIC_UMBRACO_BASE_URL) ??
    _throw('NEXT_PUBLIC_UMBRACO_BASE_URL is not a valid url');
export const NEXT_PUBLIC_SITE_URL =
    parseUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    _throw('NEXT_PUBLIC_SITE_URL is not a valid url');
