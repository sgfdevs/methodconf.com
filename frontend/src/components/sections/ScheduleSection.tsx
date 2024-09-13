import React from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';
import { ScheduleItem, ParsedSession } from '@/data/types';
import { splitByTyped } from '@/util';
import styles from '@/components/sections/ScheduleSection.module.css';
import { format } from 'date-fns';
import { CONFERENCE_DATE } from '@/config';
import { SessionCard } from '@/components/SessionCard';

export interface ScheduleSectionProps {
    schedule?: ScheduleItem[];
}

export function ScheduleSection({ schedule = [] }: ScheduleSectionProps) {
    if (schedule.length <= 0) {
        return;
    }

    const tracks = schedule.filter((item) => item.contentType === 'track');

    const sessions = schedule
        .flatMap((item) =>
            item.contentType === 'track' ? item.children : item,
        )
        .sort(sessionSort);

    const cssGrid: string[][] = createSessionGrid(schedule).map((gridRow) =>
        gridRow.map((gridColumn) =>
            gridColumn ? gridColumn.route.path.replaceAll('/', '') : '...',
        ),
    );

    cssGrid.unshift(
        tracks.map((track) => track.route.path.replaceAll('/', '')),
    );

    return (
        <section>
            <SectionTitleBar title="Schedule" />
            <div className="large-content-container">
                <div className="py-20">
                    <h3 className="text-xl xl:text-4xl font-thin mb-8">
                        {format(CONFERENCE_DATE, 'EEEE, MMMM do, yyyy')}
                    </h3>
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
                                    gridArea: track.route.path.replaceAll(
                                        '/',
                                        '',
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
                                    gridArea: session.route.path.replaceAll(
                                        '/',
                                        '',
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
        (session.properties.end?.getTime() ?? 0) -
        (session.properties.start?.getTime() ?? 0)
    );
}

function sessionSort(a?: ParsedSession, b?: ParsedSession): number {
    return (
        (a?.properties.start?.getTime() ?? 0) -
        (b?.properties.start?.getTime() ?? 0)
    );
}

const HOUR_IN_MS = 1000 * 60 * 60;

function createSessionGrid(
    schedule: ScheduleItem[],
): (ParsedSession | null)[][] {
    const [tracks, topLevelSessions] = splitByTyped(
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

        const rowTrackSessions: ParsedSession[] = rowTrackSession
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
