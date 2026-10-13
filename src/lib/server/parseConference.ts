import type { Conference, ParsedConference } from '#lib/types.ts';
import { parseUtcAsCst } from '#lib/date.ts';

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
