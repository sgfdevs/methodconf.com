'use client';
import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';
import styles from '@/components/ScheduleGrid.module.css';
import { SessionCard } from '@/components/SessionCard';
import type { ParsedSession, TrackWithSessions } from '@/data/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

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

    const containerRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);

    const columns = grid[0]?.length ?? 1;

    const [columnWidth, setColumnWidth] = useState(0);
    const [containerDimensions, setContainerDimensions] = useState({
        width: 0,
        height: 0,
        scrollOffset: 0,
    });
    const [headerHeight, setHeaderHeight] = useState(0);
    const [scrollableWidth, setScrollableWidth] = useState(0);

    useEffect(() => {
        const onResize = throttle(200, () => {
            if (!containerRef.current || !headerRef.current) {
                return;
            }

            const containerBoundingClient =
                containerRef.current.getBoundingClientRect();
            const headerBoundingClient =
                headerRef.current.getBoundingClientRect();

            setColumnWidth(getSingleGridColumnWidth(containerRef.current));
            setContainerDimensions({
                width: containerBoundingClient.width,
                height: containerBoundingClient.height,
                scrollOffset: containerBoundingClient.top + window.scrollY,
            });
            setHeaderHeight(headerBoundingClient.height);
            setScrollableWidth(containerRef.current.scrollWidth);
        });

        onResize();

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        let isAnimating = false;
        let lastKnownScroll = 0;
        let previousOffset = 0;

        const onPageScroll = () => {
            if (!headerRef.current) {
                return;
            }

            const headerEl = headerRef.current;
            lastKnownScroll = window.scrollY;

            if (!isAnimating) {
                requestAnimationFrame(() => {
                    const offset = Math.min(
                        Math.max(
                            lastKnownScroll - containerDimensions.scrollOffset,
                            0,
                        ),
                        containerDimensions.height - headerHeight - 10,
                    );

                    if (offset !== previousOffset) {
                        headerEl.style.transform = `translateY(${offset === 0 ? 0 : offset - 1}px) translateZ(0)`;
                    }

                    isAnimating = false;
                    previousOffset = offset;
                });

                isAnimating = true;
            }
        };

        onPageScroll();

        window.addEventListener('scroll', onPageScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onPageScroll);
        };
    }, [
        containerDimensions.height,
        containerDimensions.scrollOffset,
        headerHeight,
    ]);

    const specialColumnSizing = columnStyles[columns] ?? '';

    return (
        <div
            ref={containerRef}
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
            {/*<div className="absolute top-0 left-0">*/}
            {/*    <FontAwesomeIcon icon={faChevronLeft} />*/}
            {/*</div>*/}
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
                        gridArea: createGridAreaId(`${snapPointId}-${index}`),
                    }}
                    className="snap-start w-0 pointer-events-none h-full"
                ></div>
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
    return `area-${id.replaceAll('/', '')}`;
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
