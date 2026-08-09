import type { Conference, ParsedConference } from '@/data/types';
import { parseUtcAsCst } from '@/data/parseUtcAsCst';

export function parseConference(conference: Conference): ParsedConference {
    const { properties: { date, ...properties } = {}, ...original } =
        conference;

    return {
        ...original,
        properties: {
            ...properties,
            date: date ? parseUtcAsCst(date) : undefined,
        },
    } satisfies ParsedConference;
}
