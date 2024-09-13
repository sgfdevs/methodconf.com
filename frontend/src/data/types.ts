import type { components } from '@/data/umbraco/schema';
import { Overwrite } from '@/util';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Speaker = components['schemas']['SpeakerContentResponseModel'];

export type Session = components['schemas']['SessionContentResponseModel'];

export type ParsedSession = Omit<Session, 'properties'> & {
    properties?: Overwrite<
        NonNullable<Session['properties']>,
        {
            start: Date | null;
            end: Date | null;
            speaker: Speaker | null;
        }
    >;
};

export type Track = components['schemas']['TrackContentResponseModel'];

export type TrackWithSessions = Track & { children: ParsedSession[] };

export type ScheduleItem = ParsedSession | TrackWithSessions;
