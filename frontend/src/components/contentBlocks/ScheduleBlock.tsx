import React from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';
import type { ParsedSession, ParsedConference, Schedule } from '@/data/types';
import { formatDate } from '@/util';
import styles from '@/components/contentBlocks/ScheduleBlock.module.css';
import { SessionCard } from '@/components/SessionCard';

export interface ScheduleBlockProps {
    conference: ParsedConference;
    schedule?: Schedule;
}

export function ScheduleBlock({ conference, schedule }: ScheduleBlockProps) {
    const { date } = conference.properties;

    const tracks =
        schedule?.items.filter((item) => item.contentType === 'track') ?? [];

    const sessions =
        schedule?.items
            .flatMap((item) =>
                item.contentType === 'track' ? item.children : item,
            )
            .sort(sessionSort) ?? [];

    const cssGrid: string[][] =
        schedule?.grid.map((gridRow) =>
            gridRow.map((gridColumn) =>
                gridColumn ? createGridAreaId(gridColumn) : '...',
            ),
        ) ?? [];

    cssGrid.unshift(tracks.map((track) => createGridAreaId(track.route.path)));

    return (
        <section id="schedule" className="mb-12 sm:mb-20">
            <SectionTitleBar title="Schedule" />
            <div className="large-content-container">
                <div className="pt-12 sm:pt-20">
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
                                        getEndPath(session.route.path),
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

function sessionSort(a?: ParsedSession, b?: ParsedSession): number {
    return (
        (a?.properties?.start?.getTime() ?? 0) -
        (b?.properties?.start?.getTime() ?? 0)
    );
}

function createGridAreaId(id: string): string {
    return `area${id.replaceAll('/', '')}`;
}

function getEndPath(path: string) {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? path;
}
