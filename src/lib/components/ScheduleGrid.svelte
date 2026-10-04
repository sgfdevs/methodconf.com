<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import {
        faChevronLeft,
        faChevronRight,
    } from '@fortawesome/free-solid-svg-icons';
    import FontAwesomeIcon from '#lib/components/FontAwesomeIcon.svelte';
    import SessionCard from '#lib/components/SessionCard.svelte';
    import {
        TRACK_HEADER_ID,
        buildVisibleGridState,
        clampStartColumnIndex,
        createGridAreaId,
        getEndPath,
        gridTemplateAreas,
        nextStartColumnIndex,
        previousStartColumnIndex,
        visibleColumnCountForWidth,
        type ScheduleGridRows,
    } from '#lib/components/schedule.ts';
    import type { ParsedSession, TrackWithSessions } from '#lib/types.ts';

    interface Props {
        grid: ScheduleGridRows;
        sessions: ParsedSession[];
        tracks: TrackWithSessions[];
    }

    interface PointerGesture {
        pointerId: number;
        startX: number;
        startY: number;
        direction?: 'next' | 'prev';
        swiping: boolean;
    }

    let { grid, sessions, tracks }: Props = $props();

    const swipeDelta = 10;
    const getTotalColumns = () => Math.max(tracks.length, grid[0]?.length ?? 0);
    const totalColumns = $derived(getTotalColumns());

    let visibleColumns = $state(Math.min(getTotalColumns(), 3));
    let startColumnIndex = $state(0);
    let pointerGesture: PointerGesture | undefined;

    const maxStartIndex = $derived(Math.max(totalColumns - visibleColumns, 0));
    const isPrevEnabled = $derived(startColumnIndex !== 0);
    const isNextEnabled = $derived(startColumnIndex < maxStartIndex);
    const visibleState = $derived(
        buildVisibleGridState({
            rows: grid,
            tracks,
            startColumnIndex,
            visibleColumns,
        }),
    );
    const templateAreas = $derived(gridTemplateAreas(visibleState.visibleGrid));

    function handleControl(direction: 'next' | 'prev') {
        if (direction === 'next') {
            startColumnIndex = nextStartColumnIndex(
                startColumnIndex,
                totalColumns,
                visibleColumns,
            );
        } else {
            startColumnIndex = previousStartColumnIndex(startColumnIndex);
        }
    }

    function setVisibleColumnCount(nextVisibleColumns: number) {
        visibleColumns = Math.min(nextVisibleColumns, totalColumns);
        startColumnIndex = clampStartColumnIndex(
            startColumnIndex,
            totalColumns,
            visibleColumns,
        );
    }

    function handlePointerDown(event: globalThis.PointerEvent) {
        if (!event.isPrimary) {
            return;
        }

        cleanupGestureListeners();
        pointerGesture = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            swiping: false,
        };
        globalThis.window.addEventListener('pointermove', handlePointerMove, {
            passive: false,
        });
        globalThis.window.addEventListener('pointerup', handlePointerUp);
        globalThis.window.addEventListener(
            'pointercancel',
            handlePointerCancel,
        );
    }

    function handlePointerMove(event: globalThis.PointerEvent) {
        if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) {
            return;
        }

        const deltaX = event.clientX - pointerGesture.startX;
        const deltaY = event.clientY - pointerGesture.startY;
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (absX < swipeDelta && absY < swipeDelta && !pointerGesture.swiping) {
            return;
        }

        if (absX > absY) {
            pointerGesture.swiping = true;
            pointerGesture.direction = deltaX < 0 ? 'next' : 'prev';
            if (event.cancelable) {
                event.preventDefault();
            }
        }
    }

    function handlePointerUp(event: globalThis.PointerEvent) {
        if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) {
            return;
        }

        if (pointerGesture.swiping && pointerGesture.direction) {
            handleControl(pointerGesture.direction);
        }

        pointerGesture = undefined;
        cleanupGestureListeners();
    }

    function handlePointerCancel(event: globalThis.PointerEvent) {
        if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) {
            return;
        }

        pointerGesture = undefined;
        cleanupGestureListeners();
    }

    function cleanupGestureListeners() {
        if (typeof globalThis.window === 'undefined') {
            return;
        }

        globalThis.window.removeEventListener('pointermove', handlePointerMove);
        globalThis.window.removeEventListener('pointerup', handlePointerUp);
        globalThis.window.removeEventListener(
            'pointercancel',
            handlePointerCancel,
        );
    }

    $effect(() => {
        visibleColumns = Math.min(visibleColumns, totalColumns);
        startColumnIndex = clampStartColumnIndex(
            startColumnIndex,
            totalColumns,
            visibleColumns,
        );
    });

    onMount(() => {
        const mediaQueries = [
            globalThis.window.matchMedia('(max-width: 1023px)'),
            globalThis.window.matchMedia(
                '(min-width: 1024px) and (max-width: 1279px)',
            ),
            globalThis.window.matchMedia('(min-width: 1280px)'),
        ];
        const updateVisibleColumns = () => {
            setVisibleColumnCount(
                visibleColumnCountForWidth(
                    globalThis.window.innerWidth,
                    totalColumns,
                ),
            );
        };

        updateVisibleColumns();
        mediaQueries.forEach((mediaQueryList) =>
            mediaQueryList.addEventListener('change', updateVisibleColumns),
        );

        return () => {
            mediaQueries.forEach((mediaQueryList) =>
                mediaQueryList.removeEventListener(
                    'change',
                    updateVisibleColumns,
                ),
            );
        };
    });

    onDestroy(cleanupGestureListeners);
</script>

<div
    role="group"
    aria-label="Schedule tracks"
    class="schedule-grid touch-pan-y"
    style:--grid-template-columns={visibleColumns}
    style:--grid-template-areas={templateAreas}
    onpointerdown={handlePointerDown}
>
    <div
        class="bg-primary sticky top-0"
        style:grid-area={createGridAreaId(TRACK_HEADER_ID)}
    >
        <div class="flex text-white text-2xl">
            <button
                type="button"
                aria-label="Previous track"
                class={`p-2 transition-opacity duration-300 ${isPrevEnabled ? 'opacity-100' : 'opacity-0'}`}
                onclick={() => handleControl('prev')}
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div class="flex w-full">
                {#each visibleState.visibleTracks as track (track.id)}
                    <div class="p-2 flex-1">
                        <div class="text-center text-white">
                            <h3 class="text-xl xl:text-4xl font-bold">
                                {track.name}
                            </h3>
                        </div>
                    </div>
                {/each}
            </div>
            <button
                type="button"
                aria-label="Next track"
                class={`p-2 transition-opacity duration-300 ${isNextEnabled ? 'opacity-100' : 'opacity-0'}`}
                onclick={() => handleControl('next')}
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </button>
        </div>
    </div>

    {#each sessions as session (session.id)}
        {@const gridAreaId = createGridAreaId(
            getEndPath(session.route.path ?? ''),
        )}
        <SessionCard
            {session}
            style={`grid-area: ${gridAreaId};`}
            class={visibleState.visibleIds.has(gridAreaId) ? '' : 'hidden'}
        />
    {/each}
</div>

<style>
    .schedule-grid {
        --grid-template-areas: none;
        --grid-template-columns: 0;

        display: grid;
        grid-template-areas: var(--grid-template-areas);
        grid-template-columns: repeat(
            var(--grid-template-columns),
            minmax(100%, 1fr)
        );
        gap: 1rem;
    }

    @media (width >= 64rem) {
        .schedule-grid {
            grid-template-columns: repeat(
                var(--grid-template-columns),
                minmax(50%, 1fr)
            );
        }
    }

    @media (width >= 80rem) {
        .schedule-grid {
            grid-template-columns: repeat(
                var(--grid-template-columns),
                minmax(33.3333333%, 1fr)
            );
        }
    }

    @media (width >= 96rem) {
        .schedule-grid {
            gap: 2rem;
            grid-template-columns: repeat(
                var(--grid-template-columns),
                minmax(calc(33.3333333% - 1rem), 1fr)
            );
        }
    }
</style>
