<script lang="ts">
    import { onDestroy, tick, type Snippet } from 'svelte';

    type DisclosurePhase = 'exited' | 'entering' | 'entered' | 'exiting';

    interface TriggerProps {
        expanded: boolean;
        panelId: string;
        buttonId: string;
        toggle: () => void;
    }

    interface Props {
        id: string;
        trigger: Snippet<[TriggerProps]>;
        children: Snippet;
    }

    let { id, trigger, children }: Props = $props();

    const panelId = $derived(`${id}-panel`);
    const buttonId = $derived(`${id}-trigger`);
    const transitionDurationMs = 250;

    let phase = $state<DisclosurePhase>('exited');
    let panelElement = $state<globalThis.HTMLDivElement>();
    let height = $state('0px');
    let transitionTimer: ReturnType<typeof globalThis.setTimeout> | undefined;
    let transitionFrame: number | undefined;
    let resizeFrame: number | undefined;

    const expanded = $derived(phase === 'entering' || phase === 'entered');
    const wrapperStyle = $derived(
        `${phase === 'exited' ? 'display: none; ' : ''}height: ${height};`,
    );

    async function open() {
        clearPendingTransition();
        phase = 'entering';
        height = '0px';
        await tick();
        transitionFrame = globalThis.requestAnimationFrame(() => {
            transitionFrame = undefined;
            height = `${panelElement?.scrollHeight ?? 0}px`;
            transitionTimer = globalThis.setTimeout(() => {
                phase = 'entered';
                height = 'auto';
            }, transitionDurationMs);
        });
    }

    function close() {
        clearPendingTransition();
        height = `${panelElement?.scrollHeight ?? 0}px`;
        phase = 'exiting';
        transitionFrame = globalThis.requestAnimationFrame(() => {
            transitionFrame = undefined;
            height = '0px';
        });
        transitionTimer = globalThis.setTimeout(() => {
            phase = 'exited';
            height = '0px';
        }, transitionDurationMs);
    }

    function toggle() {
        if (expanded) {
            close();
        } else {
            void open();
        }
    }

    function clearPendingTransition() {
        if (transitionTimer) {
            globalThis.clearTimeout(transitionTimer);
            transitionTimer = undefined;
        }

        if (transitionFrame) {
            globalThis.cancelAnimationFrame(transitionFrame);
            transitionFrame = undefined;
        }

        if (resizeFrame) {
            globalThis.cancelAnimationFrame(resizeFrame);
            resizeFrame = undefined;
        }
    }

    function updateEnteringHeight() {
        if (phase !== 'entering') {
            return;
        }

        if (resizeFrame) {
            globalThis.cancelAnimationFrame(resizeFrame);
        }

        resizeFrame = globalThis.requestAnimationFrame(() => {
            resizeFrame = undefined;
            if (phase === 'entering') {
                height = `${panelElement?.scrollHeight ?? 0}px`;
            }
        });
    }

    $effect(() => {
        if (!panelElement || typeof globalThis.ResizeObserver === 'undefined') {
            return;
        }

        const resizeObserver = new globalThis.ResizeObserver(() => {
            updateEnteringHeight();
        });

        resizeObserver.observe(panelElement);

        return () => {
            resizeObserver.disconnect();
        };
    });

    onDestroy(clearPendingTransition);
</script>

{@render trigger({ expanded, panelId, buttonId, toggle })}

<div
    class="transition-[height] duration-300 ease-[cubic-bezier(0,0,0,1)] overflow-hidden"
    style={wrapperStyle}
>
    <div
        bind:this={panelElement}
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
    >
        {@render children()}
    </div>
</div>
