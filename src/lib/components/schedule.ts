import type {
    ParsedSession,
    ScheduleItem,
    TrackWithSessions,
} from '#lib/types.ts';

export type ScheduleGridCell = string | null | undefined;
export type ScheduleGridRows = ScheduleGridCell[][];

export const TRACK_HEADER_ID = 'track-header';

export interface VisibleGridState {
    grid: string[][];
    visibleGrid: string[][];
    visibleTracks: TrackWithSessions[];
    visibleIds: Set<string>;
}

export function createGridAreaId(id: string): string {
    return `area-${id.replaceAll('/', '')}`;
}

export function getEndPath(path: string): string {
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? path;
}

export function updateGridIds(grid: ScheduleGridRows): string[][] {
    return grid.map((gridRow) =>
        gridRow.map((gridColumn) =>
            gridColumn ? createGridAreaId(gridColumn) : '...',
        ),
    );
}

export function clampStartColumnIndex(
    startColumnIndex: number,
    totalColumns: number,
    visibleColumns: number,
): number {
    return Math.max(
        0,
        Math.min(startColumnIndex, Math.max(totalColumns - visibleColumns, 0)),
    );
}

export function nextStartColumnIndex(
    startColumnIndex: number,
    totalColumns: number,
    visibleColumns: number,
): number {
    return clampStartColumnIndex(
        startColumnIndex + 1,
        totalColumns,
        visibleColumns,
    );
}

export function previousStartColumnIndex(startColumnIndex: number): number {
    return Math.max(startColumnIndex - 1, 0);
}

export function visibleColumnCountForWidth(
    width: number,
    totalColumns: number,
): number {
    if (totalColumns <= 0) {
        return 0;
    }

    if (width <= 1023) {
        return 1;
    }

    if (width <= 1279) {
        return Math.min(totalColumns, 2);
    }

    return Math.min(totalColumns, 3);
}

export function flattenAndSortSessions(
    items: ScheduleItem[] = [],
): ParsedSession[] {
    return items
        .flatMap((item) =>
            item.contentType === 'track' ? item.children : [item],
        )
        .sort(sessionStartSort);
}

export function getScheduleTracks(
    items: ScheduleItem[] = [],
): TrackWithSessions[] {
    return items.filter(
        (item): item is TrackWithSessions => item.contentType === 'track',
    );
}

export function buildVisibleGridState({
    rows,
    tracks,
    startColumnIndex,
    visibleColumns,
}: {
    rows: ScheduleGridRows;
    tracks: TrackWithSessions[];
    startColumnIndex: number;
    visibleColumns: number;
}): VisibleGridState {
    const grid = updateGridIds([tracks.map(() => TRACK_HEADER_ID), ...rows]);
    const visibleGrid = grid.map((row) =>
        row.slice(startColumnIndex, startColumnIndex + visibleColumns),
    );

    return {
        grid,
        visibleGrid,
        visibleTracks: tracks.slice(
            startColumnIndex,
            startColumnIndex + visibleColumns,
        ),
        visibleIds: new Set(visibleGrid.flat()),
    };
}

export function gridTemplateAreas(visibleGrid: string[][]): string {
    const nonEmptyRows = visibleGrid.filter((row) => row.length > 0);

    if (nonEmptyRows.length === 0) {
        return 'none';
    }

    return nonEmptyRows.map((row) => `"${row.join(' ')}"`).join('\n');
}

function sessionStartSort(a: ParsedSession, b: ParsedSession): number {
    return (
        (a.properties?.start?.getTime() ?? 0) -
        (b.properties?.start?.getTime() ?? 0)
    );
}
