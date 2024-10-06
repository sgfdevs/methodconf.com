import { useCallback, useEffect, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';

export function useTrackHeaderControls() {
    const gridAreaRef = useRef<HTMLDivElement | null>(null);
    const [columnWidth, setColumnWidth] = useState(0);
    const [scrollableWidth, setScrollableWidth] = useState(0);
    const [controlState, setControlState] = useState({
        isNextEnabled: false,
        isPrevEnabled: false,
    });

    const onControlClick = useCallback(
        (direction: 'next' | 'prev') => {
            const scrollAmount =
                direction === 'next' ? columnWidth : -columnWidth;

            gridAreaRef.current?.scrollBy({
                left: scrollAmount,
                behavior: 'smooth',
            });
        },
        [columnWidth],
    );

    useEffect(() => {
        const onResize = throttle(200, () => {
            if (!gridAreaRef.current) {
                return;
            }

            setColumnWidth(getSingleGridColumnWidth(gridAreaRef.current));
            setScrollableWidth(gridAreaRef.current.scrollWidth);
        });

        onResize();

        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
        };
    }, []);

    useEffect(() => {
        if (!gridAreaRef.current) {
            return;
        }

        const gridAreaEl = gridAreaRef.current;

        const onScroll = throttle(200, () => {
            const isScrolledToLeft = gridAreaEl.scrollLeft === 0;
            const maxScrollLeft = scrollableWidth - gridAreaEl.clientWidth;
            const isScrolledToRight =
                Math.ceil(gridAreaEl.scrollLeft) >= maxScrollLeft;

            setControlState({
                isPrevEnabled: !isScrolledToLeft,
                isNextEnabled: !isScrolledToRight,
            });
        });

        onScroll();

        gridAreaEl.addEventListener('scroll', onScroll);

        return () => {
            gridAreaEl.removeEventListener('scroll', onScroll);
        };
    }, [scrollableWidth]);

    return { gridAreaRef, controlState, onControlClick };
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

    const width = tempDiv.getBoundingClientRect().width;

    gridElement.removeChild(tempDiv);

    return width;
}
