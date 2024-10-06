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
import { useStickyTrackHeader } from '@/components/ScheduleGrid/useStickyTrackHeader';
import { useTrackHeaderControls } from '@/components/ScheduleGrid/useTrackHeaderControls';

export interface ScheduleGridProps {
    grid: string[][];
    sessions: ParsedSession[];
    tracks: TrackWithSessions[];
}

const columnStyles = [styles.hasOneCol, styles.hasTwoCol, styles.hasThreeCol];

const trackHeaderId = 'track-header';
const snapPointId = 'snap-point';

export function ScheduleGrid({ grid, tracks, sessions }: ScheduleGridProps) {
    grid = [
        tracks.map((_) => trackHeaderId),
        ...grid,
        tracks.map((_, index) => `${snapPointId}-${index}`),
    ];
    grid = updateGridIds(grid);

    const columns = grid[0]?.length ?? 1;
    const { scrollAreaRef, headerRef, headerControlsRef } =
        useStickyTrackHeader();
    const { gridAreaRef, controlState, onControlClick } =
        useTrackHeaderControls();

    const specialColumnSizing = columnStyles[columns] ?? '';

    return (
        <div className="relative">
            <div
                ref={headerControlsRef}
                className="absolute top-0 left-0 right-0 w-full z-20 flex justify-between text-white text-2xl p-2"
            >
                <button
                    disabled={!controlState.isPrevEnabled}
                    onClick={() => onControlClick('prev')}
                    className={`transition-opacity duration-200 ${!controlState.isPrevEnabled ? 'opacity-0' : 'opacity-100'}`}
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <button
                    disabled={!controlState.isNextEnabled}
                    onClick={() => onControlClick('next')}
                    className={`transition-opacity duration-200 ${!controlState.isNextEnabled ? 'opacity-0' : 'opacity-100'}`}
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
            <div
                ref={(el) => {
                    scrollAreaRef.current = el;
                    gridAreaRef.current = el;
                }}
                className={`${styles.scheduleGrid} ${specialColumnSizing} overflow-x-scroll snap-x snap-mandatory overflow-y-hidden relative`}
                style={
                    {
                        '--grid-template-columns': tracks.length,
                        '--grid-template-areas': grid
                            .map((row) => `"${row.join(' ')}"`)
                            .join('\n'),
                    } as CSSProperties
                }
            >
                <div
                    ref={headerRef}
                    className="bg-primary relative origin-top will-change-transform overflow-hidden"
                    style={{
                        gridArea: createGridAreaId(trackHeaderId),
                    }}
                >
                    <div className="flex w-full">
                        {tracks.map((track) => (
                            <div className="p-2 flex-1" key={track.id}>
                                <div className="text-center text-white">
                                    <h3 className="text-xl xl:text-4xl font-thin">
                                        {track.name}
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
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
                {tracks.map((track, index) => (
                    <div
                        key={`${snapPointId}-${track.id}`}
                        style={{
                            gridArea: createGridAreaId(
                                `${snapPointId}-${index}`,
                            ),
                        }}
                        className="snap-start w-0 pointer-events-none h-full"
                    ></div>
                ))}
            </div>
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
