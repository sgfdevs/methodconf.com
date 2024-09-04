import { Session, SessionWithDates } from '@/data/types';

export function parseSessionDates(session: Session): SessionWithDates {
    const { start, end } = session.properties;

    const updatedSession = session as SessionWithDates;

    updatedSession.properties.start = start ? new Date(start) : null;
    updatedSession.properties.end = end ? new Date(end) : null;

    return updatedSession;
}
