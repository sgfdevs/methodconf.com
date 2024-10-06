'use client';
import type { CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/components/ScheduleGrid/ScheduleGrid.module.css';
import { SessionCard } from '@/components/SessionCard';
import type { ParsedSession, TrackWithSessions } from '@/data/types';
import { usePartialGridView } from '@/components/ScheduleGrid/usePartialGridView';

export interface ScheduleGridProps {
    grid: string[][];
    sessions: ParsedSession[];
    tracks: TrackWithSessions[];
}

const trackHeaderId = 'track-header';

const breakpoints = [
    { query: '(max-width: 1023px)', columns: 1 },
    { query: '(min-width: 1024px) and (max-width: 1279px)', columns: 2 },
    { query: '(min-width: 1280px)', columns: 3 },
];

export function ScheduleGrid({ grid, tracks, sessions }: ScheduleGridProps) {
    grid = [tracks.map(() => trackHeaderId), ...grid];
    grid = updateGridIds(grid);

    const {
        startColumnIndex,
        visibleColumns,
        onControlClick,
        isPrevEnabled,
        isNextEnabled,
    } = usePartialGridView({
        grid,
        breakpoints,
    });

    const visibleGrid = grid.map((row) =>
        row.slice(startColumnIndex, startColumnIndex + visibleColumns),
    );

    const uniqueVisibleGridIds = new Set(visibleGrid.flatMap((row) => row));

    const visibleTracks = tracks.slice(
        startColumnIndex,
        startColumnIndex + visibleColumns,
    );

    return (
        <div
            className={`${styles.scheduleGrid}`}
            style={
                {
                    '--grid-template-columns': visibleColumns,
                    '--grid-template-areas': visibleGrid
                        .map((row) => `"${row.join(' ')}"`)
                        .join('\n'),
                } as CSSProperties
            }
        >
            <div
                className="bg-primary sticky top-0"
                style={{
                    gridArea: createGridAreaId(trackHeaderId),
                }}
            >
                <div className="flex text-white text-2xl">
                    <button
                        className={`p-2 transition-opacity duration-300 ${isPrevEnabled ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => onControlClick('prev')}
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <div className="flex w-full">
                        {visibleTracks.map((track) => (
                            <div className="p-2 flex-1" key={track.id}>
                                <div className="text-center text-white">
                                    <h3 className="text-xl xl:text-4xl font-bold">
                                        {track.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className={`p-2 transition-opacity duration-300 ${isNextEnabled ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => onControlClick('next')}
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
            </div>
            {sessions.map((session) => {
                const gridAreaId = createGridAreaId(
                    getEndPath(session.route.path),
                );

                return (
                    <SessionCard
                        key={session.id}
                        session={session}
                        style={{
                            gridArea: gridAreaId,
                        }}
                        className={
                            !uniqueVisibleGridIds.has(gridAreaId)
                                ? 'hidden'
                                : ''
                        }
                    />
                );
            })}
        </div>
    );
}

function updateGridIds(grid: string[][]): string[][] {
    return grid.map((gridRow) =>
        gridRow.map((gridColumn) =>
            gridColumn ? createGridAreaId(gridColumn) : '...',
        ),
    );
}

function createGridAreaId(id: string): string {
    return `area-${id.replaceAll('/', '')}`;
}

function getEndPath(path: string) {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? path;
}
