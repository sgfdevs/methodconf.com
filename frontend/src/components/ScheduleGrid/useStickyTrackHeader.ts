import { useEffect, useRef, useState } from 'react';
import { throttle } from 'throttle-debounce';

export function useStickyTrackHeader() {
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const headerControlsRef = useRef<HTMLDivElement>(null);

    const [containerDimensions, setContainerDimensions] = useState({
        width: 0,
        height: 0,
        scrollOffset: 0,
    });
    const [headerHeight, setHeaderHeight] = useState(0);

    useEffect(() => {
        const onResize = throttle(200, () => {
            if (!scrollAreaRef.current || !headerRef.current) {
                return;
            }

            const containerBoundingClient =
                scrollAreaRef.current.getBoundingClientRect();
            const headerBoundingClient =
                headerRef.current.getBoundingClientRect();

            setContainerDimensions({
                width: containerBoundingClient.width,
                height: containerBoundingClient.height,
                scrollOffset: containerBoundingClient.top + window.scrollY,
            });
            setHeaderHeight(headerBoundingClient.height);
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
            if (!headerRef.current || !headerControlsRef.current) {
                return;
            }

            const headerEl = headerRef.current;
            const headerControlsEl = headerControlsRef.current;
            lastKnownScroll = window.scrollY;

            if (!isAnimating) {
                requestAnimationFrame(() => {
                    const offset = Math.min(
                        Math.max(
                            lastKnownScroll - containerDimensions.scrollOffset,
                            0,
                        ),
                        containerDimensions.height -
                            Math.max(headerHeight - 10, 0),
                    );

                    if (offset !== previousOffset) {
                        headerEl.style.transform = `translateY(${offset === 0 ? 0 : offset - 1}px) translateZ(0)`;
                        headerControlsEl.style.transform = `translateY(${offset === 0 ? 0 : offset - 1}px) translateZ(0)`;
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

    return { scrollAreaRef, headerRef, headerControlsRef };
}
