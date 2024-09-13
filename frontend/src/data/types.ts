import type { components } from '@/data/umbraco/schema';
import { Overwrite } from '@/util';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type Sponsor = components['schemas']['SponsorElementModel'];

export type Sponsors = components['schemas']['SponsorsContentResponseModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Session = components['schemas']['SessionContentResponseModel'];

export type ParsedSession = Overwrite<
    Session,
    {
        properties?: Overwrite<
            NonNullable<Session['properties']>,
            {
                start: Date | null;
                end: Date | null;
                // speaker: Speaker | null;
            }
        >;
    }
>;

export type Track = components['schemas']['TrackContentResponseModel'];

export type TrackWithSessions = Track & { children: ParsedSession[] };

export type ScheduleItem = ParsedSession | TrackWithSessions;
