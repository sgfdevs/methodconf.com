import type { components } from '@/data/umbraco/schema';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Session = Omit<
    components['schemas']['SessionContentResponseModel'],
    'contentType'
> & {
    contentType: 'session';
};

export type SessionWithDates = Omit<Session, 'properties'> & {
    properties: Omit<Session['properties'], 'start' | 'end'> & {
        start: Date | null;
        end: Date | null;
    };
};

export type Track = Omit<
    components['schemas']['TrackContentResponseModel'],
    'contentType'
> & {
    contentType: 'track';
};

export type TrackWithSessions = Track & { children: SessionWithDates[] };

export type ScheduleItem = SessionWithDates | TrackWithSessions;
