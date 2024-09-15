import type { Session, ParsedSession } from '@/data/types';
import { parseUtcAsCst } from '@/data/parseUtcAsCst';

export function parseSession(session: Session): ParsedSession {
    const { properties: { start, end, ...properties } = {}, ...original } =
        session;

    return {
        ...original,
        properties: {
            ...properties,
            start: start ? parseUtcAsCst(start) : undefined,
            end: end ? parseUtcAsCst(end) : undefined,
        },
    } satisfies ParsedSession;
}
