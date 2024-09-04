import type { components } from '@/data/umbraco/schema';

export type Conference =
    components['schemas']['ConferenceContentResponseModel'];

export type Sessions = components['schemas']['SessionsContentResponseModel'];

export type Session = components['schemas']['SessionContentResponseModel'];
