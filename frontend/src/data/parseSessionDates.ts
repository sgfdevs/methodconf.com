import type { Session, ParsedSession } from '@/data/types';
import { parseUtcAsCst } from '@/data/parseUtcAsCst';

export function parseSessionDates(session: Session): ParsedSession {
    const { start, end } = session.properties ?? {};

    const updatedSession = session as ParsedSession;

    updatedSession.properties = {
        ...updatedSession.properties,
        start: start ? parseUtcAsCst(start) : null,
        end: end ? parseUtcAsCst(end) : null,
    };

    return updatedSession;
}
