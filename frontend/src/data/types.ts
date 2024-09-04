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

export type Track = Omit<
    components['schemas']['TrackContentResponseModel'],
    'contentType'
> & {
    contentType: 'track';
};

export type ScheduleItem = Session | (Track & { children: Session[] });
