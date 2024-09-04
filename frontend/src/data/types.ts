import type { components } from '@/data/umbraco/schema';
import { MappedOmit } from '@/util';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Speaker = Omit<
    components['schemas']['SpeakerContentResponseModel'],
    'contentType'
> & {
    contentType: 'speaker';
};

export type Session = Omit<
    components['schemas']['SessionContentResponseModel'],
    'contentType'
> & {
    contentType: 'session';
};

export type ParsedSession = MappedOmit<Session, 'properties'> & {
    properties: MappedOmit<
        Session['properties'],
        'start' | 'end' | 'speaker'
    > & {
        start: Date | null;
        end: Date | null;
        speaker: Speaker | null;
    };
};

export type Track = Omit<
    components['schemas']['TrackContentResponseModel'],
    'contentType'
> & {
    contentType: 'track';
};

export type TrackWithSessions = Track & { children: ParsedSession[] };

export type ScheduleItem = ParsedSession | TrackWithSessions;
