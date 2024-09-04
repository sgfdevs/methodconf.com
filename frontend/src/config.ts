import { _throw, parseUrl } from '@/util';

export const SPEAKER_LINK = 'https://sessionize.com/method-conference-2024/';
export const LOCATION_IFRAME_URL =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3177.5064710178376!2d-93.29300142284976!3d37.211950144379166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87cf62fce4b64373%3A0xb83189288308d87f!2sefactory!5e0!3m2!1sen!2sus!4v1717465582324!5m2!1sen!2sus';

export const TICKET_LINK = '/tickets';

export const DEFAULT_CONFERENCE = '2024';

export const CONFERENCE_DATE = new Date('October 12, 2024');

export const NEWSLETTER_ENDPOINT = parseUrl(process.env.NEWSLETTER_ENDPOINT);
export const NEWSLETTER_LIST_ID = process.env.NEWSLETTER_LIST_ID;
export const UMBRACO_BASE_URL =
    parseUrl(process.env.UMBRACO_BASE_URL) ??
    _throw('UMBRACO_BASE_URL is not a valid url');
