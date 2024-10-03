'use client';
import { useEffect, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';
import styles from '@/components/ScheduleGrid.module.css';
import { SessionCard } from '@/components/SessionCard';
import type { ParsedSession, TrackWithSessions } from '@/data/types';

export interface ScheduleGridProps {
    grid: string[][];
    sessions: ParsedSession[];
    tracks: TrackWithSessions[];
}

export function ScheduleGrid({ grid, tracks, sessions }: ScheduleGridProps) {
    grid = updateGridIds(grid);

    const containerRef = useRef<HTMLDivElement>(null);

    const columns = grid[0]?.length ?? 1;

    const [columnWidth, setColumnWidth] = useState(0);
    const [elementWidth, setElementWidth] = useState(0);
    const [scrollableWidth, setScrollableWidth] = useState(0);

    useEffect(() => {
        const onResize = throttle(200, () => {
            if (!containerRef.current) {
                return;
            }

            setColumnWidth(getSingleGridColumnWidth(containerRef.current));
            setElementWidth(containerRef.current.offsetWidth);
            setScrollableWidth(containerRef.current.scrollWidth);
        });

        onResize();

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`${styles.scheduleGrid} overflow-x-scroll`}
            style={
                {
                    '--grid-template-areas': grid
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
                        gridArea: createGridAreaId(track.route.path),
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
    return `area${id.replaceAll('/', '')}`;
}

function getEndPath(path: string) {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? path;
}

function getSingleGridColumnWidth(gridElement: HTMLElement) {
    const tempDiv = document.createElement('div');
    // Span only the first column
    tempDiv.style.gridColumn = `1 / 2`;
    tempDiv.style.gridRow = `1 / 2`;
    tempDiv.style.minWidth = '1px';
    tempDiv.style.minHeight = '1px';
    tempDiv.style.visibility = 'hidden';

    gridElement.appendChild(tempDiv);

    gridElement.offsetHeight;

    const width = tempDiv.getBoundingClientRect().width;

    gridElement.removeChild(tempDiv);

    return width;
}
