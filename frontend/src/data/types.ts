import type { TZDate } from '@date-fns/tz';
import type { components } from '@/data/umbraco/deliveryApiSchema';
import type { Overwrite } from '@/util';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type ParsedConference = Overwrite<
    Conference,
    {
        properties: Overwrite<
            NonNullable<Conference['properties']>,
            {
                date?: TZDate;
            }
        >;
    }
>;

export type Sponsors = components['schemas']['SponsorsContentResponseModel'];

export type SponsorTier = components['schemas']['SponsorTierElementModel'];

export type Sponsor = components['schemas']['SponsorElementModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Session = components['schemas']['SessionContentResponseModel'];

export type ParsedSession = Overwrite<
    Session,
    {
        properties: Overwrite<
            NonNullable<Session['properties']>,
            {
                start?: TZDate;
                end?: TZDate;
            }
        >;
    }
>;

export type Track = components['schemas']['TrackContentResponseModel'];

export type TrackWithSessions = Track & { children: ParsedSession[] };

export type ScheduleItem = ParsedSession | TrackWithSessions;

export type Schedule = { items: ScheduleItem[]; grid: string[][] };

export type Speaker = components['schemas']['SpeakerContentResponseModel'];

export type Page =
    | components['schemas']['PageContentResponseModel']
    | components['schemas']['HomeContentResponseModel'];

export type ContentBlock = components['schemas']['IApiElementModel'];

export type RichTextBlock = components['schemas']['RichTextElementModel'];

export type TextWithButtonsBlock =
    components['schemas']['TextWithButtonsElementModel'];

export type CmsLink = components['schemas']['ApiLinkModel'];
