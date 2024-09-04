import { Session, ParsedSession, Speaker } from '@/data/types';

export function parseSessionDates(session: Session): ParsedSession {
    const { start, end, speaker } = session.properties;

    const updatedSession = session as ParsedSession;

    updatedSession.properties.start = start ? new Date(start) : null;
    updatedSession.properties.end = end ? new Date(end) : null;
    updatedSession.properties.speaker = (speaker?.[0] as Speaker) ?? null;

    return updatedSession;
}
