import { useCallback, useEffect, useState } from 'react';

export interface UsePartialGridViewArgs {
    grid: string[][];
    breakpoints: { query: string; columns: number }[];
}

export function usePartialGridView({
    grid,
    breakpoints,
}: UsePartialGridViewArgs) {
    const totalColumns = grid[0]?.length ?? 1;
    const [visibleColumns, setVisibleColumns] = useState(
        Math.min(totalColumns, 3),
    );
    const [startColumnIndex, setStartColumnIndex] = useState(0);
    const maxStartIndex = Math.max(totalColumns - visibleColumns, 0);

    const onControlClick = useCallback(
        (direction: 'next' | 'prev') => {
            if (direction === 'next') {
                setStartColumnIndex((prevIndex) =>
                    Math.min(prevIndex + 1, maxStartIndex),
                );
            } else {
                setStartColumnIndex((prevIndex) => Math.max(prevIndex - 1, 0));
            }
        },
        [maxStartIndex],
    );

    useEffect(() => {
        const mediaQueries = breakpoints.map((bp) => ({
            ...bp,
            mediaQueryList: window.matchMedia(bp.query),
        }));

        const updateVisibleColumns = () => {
            for (const bp of mediaQueries) {
                if (bp.mediaQueryList.matches) {
                    setVisibleColumns(bp.columns);
                    break;
                }
            }

            setStartColumnIndex((prevIndex) => {
                const maxStartIndex = Math.max(
                    totalColumns - visibleColumns,
                    0,
                );
                return Math.min(prevIndex, maxStartIndex);
            });
        };

        updateVisibleColumns();

        mediaQueries.forEach((bp) =>
            bp.mediaQueryList.addEventListener('change', updateVisibleColumns),
        );

        return () => {
            mediaQueries.forEach((bp) =>
                bp.mediaQueryList.removeEventListener(
                    'change',
                    updateVisibleColumns,
                ),
            );
        };
    }, [breakpoints, totalColumns, visibleColumns]);

    return {
        startColumnIndex,
        visibleColumns,
        onControlClick,
        isPrevEnabled: startColumnIndex !== 0,
        isNextEnabled: startColumnIndex < maxStartIndex,
    };
}
