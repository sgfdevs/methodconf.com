import React from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';
import { getSchedule } from '@/data/getSchedule';
import { ScheduleItem, SessionWithDates } from '@/data/types';
import { splitBy } from '@/util';
import { getConference } from '@/data/getConference';
import styles from '@/components/sections/ScheduleSection.module.css';
import { format } from 'date-fns';
import { CONFERENCE_DATE } from '@/config';

export async function ScheduleSection() {
    const conference = await getConference();
    const schedule = await getSchedule(conference!.id);

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

            <h3 className="text-4xl font-thin">
                {format(CONFERENCE_DATE, 'EEEE, MMMM do, yyyy')}
            </h3>
            <div
                className={`${styles.scheduleGrid} gap-8`}
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
                            gridArea: track.route.path.replaceAll('/', ''),
                        }}
                    >
                        <h3 className="text-4xl font-thin">{track.name}</h3>
                    </div>
                ))}
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        style={{
                            gridArea: session.route.path.replaceAll('/', ''),
                        }}
                        className="bg-gray-100 p-8"
                    >
                        {session.properties.start ? (
                            <time className="text-2xl font-thin">
                                {format(session.properties.start, 'h:mm a')}
                            </time>
                        ) : null}
                        <div className="flex">
                            <h4 className="text-3xl font-bold">
                                {session.name}
                            </h4>
                        </div>
                    </div>
                ))}
                <div></div>
            </div>
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

const HOUR_IN_MS = 1000 * 60 * 60;

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
