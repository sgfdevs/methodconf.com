import React from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';
import type {
    ScheduleItem,
    ParsedSession,
    ParsedConference,
} from '@/data/types';
import { formatDate, splitBy } from '@/util';
import styles from '@/components/contentBlocks/ScheduleBlock.module.css';
import { SessionCard } from '@/components/SessionCard';

export interface ScheduleBlockProps {
    conference: ParsedConference;
    schedule?: ScheduleItem[];
}

export function ScheduleBlock({
    conference,
    schedule = [],
}: ScheduleBlockProps) {
    const { date } = conference.properties;

    const tracks = schedule.filter((item) => item.contentType === 'track');

    const sessions = schedule
        .flatMap((item) =>
            item.contentType === 'track' ? item.children : item,
        )
        .sort(sessionSort);

    const cssGrid: string[][] = createSessionGrid(schedule).map((gridRow) =>
        gridRow.map((gridColumn) =>
            gridColumn ? createGridAreaId(gridColumn.route.path) : '...',
        ),
    );

    cssGrid.unshift(tracks.map((track) => createGridAreaId(track.route.path)));

    return (
        <section id="schedule">
            <SectionTitleBar title="Schedule" />
            <div className="large-content-container">
                <div className="py-12 sm:py-20">
                    {date ? (
                        <h3 className="text-xl xl:text-4xl font-thin mb-8">
                            {formatDate(date, 'EEEE, MMMM do, yyyy')}
                        </h3>
                    ) : null}

                    <div
                        className={`${styles.scheduleGrid} gap-4 xl:gap-8 overflow-x-scroll`}
                        style={
                            {
                                '--grid-template-areas': cssGrid
                                    .map((row) => `"${row.join(' ')}"`)
                                    .join('\n'),
                                '--grid-template-columns': tracks.length,
                            } as React.CSSProperties
                        }
                    >
                        {tracks.map((track) => (
                            <div
                                key={track.id}
                                style={{
                                    gridArea: createGridAreaId(
                                        track.route.path,
                                    ),
                                }}
                            >
                                <h3 className="text-xl xl:text-4xl font-thin">
                                    {track.name}
                                </h3>
                            </div>
                        ))}
                        {sessions.map((session) => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                style={{
                                    gridArea: createGridAreaId(
                                        session.route.path,
                                    ),
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function getSessionDuration(session: ParsedSession): number {
    return (
        (session.properties?.end?.getTime() ?? 0) -
        (session.properties?.start?.getTime() ?? 0)
    );
}

function sessionSort(a?: ParsedSession, b?: ParsedSession): number {
    return (
        (a?.properties?.start?.getTime() ?? 0) -
        (b?.properties?.start?.getTime() ?? 0)
    );
}

const HOUR_IN_MS = 1000 * 60 * 60;

function createGridAreaId(id: string): string {
    return `area${id.replaceAll('/', '')}`;
}

function createSessionGrid(
    schedule: ScheduleItem[],
): (ParsedSession | null)[][] {
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

    const sessionGrid: (ParsedSession | null)[][] = [];

    let topLevelSessionIndex = 0;
    let trackSessionIndex = 0;

    for (let i = 0; i < totalRows; i++) {
        sessionGrid.push([]);

        const topLevelSession = topLevelSessions[topLevelSessionIndex];
        const rowTrackSession = trackSessions[trackSessionIndex];
        const isTopLevelSessionRow =
            topLevelSession &&
            (topLevelSession.properties?.start?.getTime() ?? 0) <
                (rowTrackSession?.properties?.start?.getTime() ?? Infinity);

        if (isTopLevelSessionRow) {
            for (let j = 0; j < trackCount; j++) {
                sessionGrid[i]![j] = topLevelSession;
            }

            topLevelSessionIndex++;
            continue;
        }

        trackSessionIndex++;

        const rowTrackSessions: ParsedSession[] = rowTrackSession
            ? [rowTrackSession]
            : [];

        for (let j = 0; j < trackCount - 1; j++) {
            const nextTrackSession = trackSessions[trackSessionIndex];
            if (
                nextTrackSession &&
                rowTrackSession?.properties?.start?.getTime() ===
                    nextTrackSession.properties?.start?.getTime()
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
