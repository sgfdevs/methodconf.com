import { SectionTitleBar } from '@/components/SectionTitleBar';
import { getSchedule } from '@/data/getSchedule';
import {
    ScheduleItem,
    SessionWithDates,
    Track,
    TrackWithSessions,
} from '@/data/types';
import { splitBy } from '@/util';
import { getConference } from '@/data/getConference';

const HOUR_IN_MS = 1000 * 60 * 60;

export async function ScheduleSection() {
    const conference = await getConference();
    const schedule = await getSchedule(conference!.id);

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

    const grid: string[][] = [];

    let topLevelSessionIndex = 0;
    let trackSessionIndex = 0;

    for (let i = 0; i < totalRows; i++) {
        grid.push([]);

        const topLevelSession = topLevelSessions[topLevelSessionIndex];
        const rowTrackSession = trackSessions[trackSessionIndex];
        const isTopLevelSessionRow =
            topLevelSession &&
            (topLevelSession.properties.start?.getTime() ?? 0) <
                (rowTrackSession?.properties.start?.getTime() ?? Infinity);

        if (isTopLevelSessionRow) {
            for (let j = 0; j < trackCount; j++) {
                grid[i]![j] = topLevelSession?.route.path ?? 'none';
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
                grid[i]![j] = rowTrackSession.route.path;
                continue;
            }

            grid[i]![j] = 'none';
        }
    }

    // const trackWithMostSessions = tracks.reduce((most, track) => {
    //     return most.children.length > track.children.length ? track : most;
    // });
    //
    // const tracksWithEmptySessions: TrackWithEmptySessions[] = tracks.map(
    //     (track) => {
    //         for (let i = 0; i < trackWithMostSessions.children.length; i++) {
    //             const templateSession = trackWithMostSessions.children[i];
    //             const session = track.children[i];
    //         }
    //     },
    // );

    // for (const item of schedule) {
    //     if (item.contentType !== 'track') {
    //         continue;
    //     }
    //
    //     item.children.sort(sessionSort);
    // }

    // const tracksWithAllSessions = tracks.map((track) => {
    //     track.children.push(...topLevelSessions);
    //     track.children.sort(sessionSort);
    //     return track;
    // });
    //
    // const trackWithMostSessions = tracksWithAllSessions.reduce(
    //     (most, track) => {
    //         return most.children.length > track.children.length ? most : track;
    //     },
    // );
    //
    // for (const track of tracksWithAllSessions) {
    //     if (track === trackWithMostSessions) {
    //         continue;
    //     }
    //
    //     for (let i = 0; i < trackWithMostSessions.children.length; i++) {
    //         const templateSession = trackWithMostSessions.children[i]!;
    //         const session = track.children[i];
    //
    //         if (templateSession.route.path === session?.route.path) {
    //             continue;
    //         }
    //     }
    // }
    //
    // const grid: string[][] = [];
    //
    // for (let i = 0; i < trackWithMostSessions.children.length; i++) {
    //     grid.push([]);
    //     for (let j = 0; j < tracksWithAllSessions.length; j++) {
    //         const session = tracksWithAllSessions[j]?.children[i];
    //         grid[i]![j] = session?.route.path ?? 'none';
    //     }
    // }

    return (
        <section>
            <SectionTitleBar title="Schedule" />

            <div>
                {tracks.map((track) => (
                    <p key={track.id}>{track.name}</p>
                ))}
            </div>

            <pre>
                {grid
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
