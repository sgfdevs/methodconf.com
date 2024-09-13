import { Session, ParsedSession, Speaker } from '@/data/types';
import { parseUtcAsCst } from '@/data/parseUtcAsCst';

export function parseSessionDates(session: Session): ParsedSession {
    const { start, end, speaker } = session.properties ?? {};

    const updatedSession = session as ParsedSession;

    updatedSession.properties = {
        ...updatedSession.properties,
        start: start ? parseUtcAsCst(start) : null,
        end: end ? parseUtcAsCst(end) : null,
        speaker: (speaker?.[0] as Speaker) ?? null,
    };

    return updatedSession;
}
