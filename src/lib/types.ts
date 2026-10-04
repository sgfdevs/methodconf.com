import type { components } from '#lib/umbraco/deliveryApiSchema.d.ts';
import type { UmbracoContent } from '#lib/umbraco/types.ts';
import type { Overwrite } from '#lib/util.ts';

type Content = UmbracoContent;

export type Conference = Extract<Content, { contentType: 'conference' }>;

export type ParsedConference = Overwrite<
    Conference,
    {
        properties: Overwrite<
            NonNullable<Conference['properties']>,
            {
                date?: Date;
            }
        >;
    }
>;

export type Sponsors = Extract<Content, { contentType: 'sponsors' }>;

export type SponsorTier = components['schemas']['SponsorTierElementModel'];

export type Sponsor = components['schemas']['SponsorElementModel'];

export type Sessions = Extract<Content, { contentType: 'sessions' }>;

export type Speaker = Extract<Content, { contentType: 'speaker' }>;

export type Session = Extract<Content, { contentType: 'session' }>;

export type ParsedSession = Overwrite<
    Session,
    {
        properties: Overwrite<
            NonNullable<Session['properties']>,
            {
                start?: Date;
                end?: Date;
            }
        >;
    }
>;

export type Track = Extract<Content, { contentType: 'track' }>;

export type TrackWithSessions = Track & { children: ParsedSession[] };

export type ScheduleItem = ParsedSession | TrackWithSessions;

export type PublicScheduleGridCell = string | null;

export type Schedule = {
    items: ScheduleItem[];
    grid: PublicScheduleGridCell[][];
};

export type Page = Extract<Content, { contentType: 'home' | 'page' }>;

export type ContentBlock = components['schemas']['IApiElementModel'];

export type RichTextBlock = components['schemas']['RichTextElementModel'];

export type TextWithButtonsBlock =
    components['schemas']['TextWithButtonsElementModel'];

export type CmsLink = components['schemas']['ApiLinkModel'];
