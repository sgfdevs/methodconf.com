import { SectionTitleBar } from '@/components/SectionTitleBar';
import { getSchedule } from '@/data/getSchedule';
import { ScheduleItem, SessionWithDates } from '@/data/types';
import { splitBy } from '@/util';
import { getConference } from '@/data/getConference';

const HOUR_IN_MS = 1000 * 60 * 60;

export async function ScheduleSection() {
    const conference = await getConference();
    const schedule = await getSchedule(conference!.id);

    const tracks = schedule.filter((item) => item.contentType === 'track');

    const cssGrid: string[][] = createSessionGrid(schedule).map((gridRow) =>
        gridRow.map((gridColumn) =>
            gridColumn ? gridColumn.route.path : 'none',
        ),
    );

    return (
        <section>
            <SectionTitleBar title="Schedule" />

            <div>
                {tracks.map((track) => (
                    <p key={track.id}>{track.name}</p>
                ))}
            </div>

            <pre>
                {cssGrid
                    .map((row) => row.map((col) => col.padEnd(100)).join(' '))
                    .join('\n')}
            </pre>
        </section>
    );
}

function getSessionDuration(session: SessionWithDates): number {
    return (
        (session.properties.end?.getTime() ?? 0) -
        (session.properties.start?.getTime() ?? 0)
    );
}

function sessionSort(a?: SessionWithDates, b?: SessionWithDates): number {
    return (
        (a?.properties.start?.getTime() ?? 0) -
        (b?.properties.start?.getTime() ?? 0)
    );
}

function createSessionGrid(
    schedule: ScheduleItem[],
): (SessionWithDates | null)[][] {
    const [tracks, topLevelSessions] = splitBy(
        schedule,
        (item) => item.contentType === 'track',
    );

    const trackCount = tracks.length;

    const trackSessions = tracks
        .flatMap((track) => track.children)
        .sort(sessionSort);

    topLevelSessions.sort(sessionSort);

    const trackSessionDurations = trackSessions.map(getSessionDuration);

    const minimumSessionDuration = Math.max(
        Math.min(...trackSessionDurations),
        HOUR_IN_MS,
    );

    const trackBlocks = tracks
        .map((track) =>
            track.children.reduce(
                (acc, session) => acc + getSessionDuration(session),
                0,
            ),
        )
        .map((duration) => Math.trunc(duration / minimumSessionDuration));

    const mostBlocksInTrack = Math.max(...trackBlocks);

    const totalRows = mostBlocksInTrack + topLevelSessions.length;

    const sessionGrid: (SessionWithDates | null)[][] = [];

    let topLevelSessionIndex = 0;
    let trackSessionIndex = 0;

    for (let i = 0; i < totalRows; i++) {
        sessionGrid.push([]);

        const topLevelSession = topLevelSessions[topLevelSessionIndex];
        const rowTrackSession = trackSessions[trackSessionIndex];
        const isTopLevelSessionRow =
            topLevelSession &&
            (topLevelSession.properties.start?.getTime() ?? 0) <
                (rowTrackSession?.properties.start?.getTime() ?? Infinity);

        if (isTopLevelSessionRow) {
            for (let j = 0; j < trackCount; j++) {
                sessionGrid[i]![j] = topLevelSession;
            }

            topLevelSessionIndex++;
            continue;
        }

        trackSessionIndex++;

        const rowTrackSessions: SessionWithDates[] = rowTrackSession
            ? [rowTrackSession]
            : [];

        for (let j = 0; j < trackCount - 1; j++) {
            const nextTrackSession = trackSessions[trackSessionIndex];
            if (
                nextTrackSession &&
                rowTrackSession?.properties.start?.getTime() ===
                    nextTrackSession.properties.start?.getTime()
            ) {
                rowTrackSessions.push(nextTrackSession);
                trackSessionIndex++;
            }
        }

        for (let j = 0; j < trackCount; j++) {
            const track = tracks[j]!;

            const trackSessionIds = track.children.map((session) => session.id);
            const rowTrackSession = rowTrackSessions.find((session) =>
                trackSessionIds.includes(session.id),
            );

            if (rowTrackSession) {
                sessionGrid[i]![j] = rowTrackSession;
                continue;
            }

            let previousSessionSearchDepth = 1;
            const previousRowSession =
                sessionGrid[i - previousSessionSearchDepth]?.[j];

            if (previousRowSession) {
                while (true) {
                    previousSessionSearchDepth++;

                    const beforePreviousRowSession =
                        sessionGrid[i - previousSessionSearchDepth]?.[j];

                    if (!beforePreviousRowSession) {
                        break;
                    }

                    if (beforePreviousRowSession.id !== previousRowSession.id) {
                        break;
                    }
                }

                const neededSessionBlocks = Math.trunc(
                    getSessionDuration(previousRowSession) /
                        minimumSessionDuration,
                );

                const renderedSessionBlocks = previousSessionSearchDepth - 1;

                if (neededSessionBlocks > renderedSessionBlocks) {
                    sessionGrid[i]![j] = previousRowSession;
                    continue;
                }
            }

            sessionGrid[i]![j] = null;
        }
    }

    return sessionGrid;
}
