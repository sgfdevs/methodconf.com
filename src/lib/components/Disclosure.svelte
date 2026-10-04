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
    let animationFrame: number | undefined;

    const isMounted = $derived(phase !== 'exited');
    const expanded = $derived(phase === 'entering' || phase === 'entered');
    const display = $derived(phase === 'exited' ? 'none' : undefined);

    async function open() {
        clearPendingTransition();
        phase = 'entering';
        height = '0px';
        await tick();
        height = `${panelElement?.scrollHeight ?? 0}px`;
        transitionTimer = globalThis.setTimeout(() => {
            phase = 'entered';
            height = 'auto';
        }, transitionDurationMs);
    }

    function close() {
        clearPendingTransition();
        height = `${panelElement?.scrollHeight ?? 0}px`;
        phase = 'exiting';
        animationFrame = globalThis.requestAnimationFrame(() => {
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

        if (animationFrame) {
            globalThis.cancelAnimationFrame(animationFrame);
            animationFrame = undefined;
        }
    }

    $effect(() => {
        if (!panelElement || typeof globalThis.ResizeObserver === 'undefined') {
            return;
        }

        const resizeObserver = new globalThis.ResizeObserver(() => {
            if (phase === 'entering') {
                height = `${panelElement?.scrollHeight ?? 0}px`;
            }
        });

        resizeObserver.observe(panelElement);

        return () => {
            resizeObserver.disconnect();
        };
    });

    onDestroy(clearPendingTransition);
</script>

{@render trigger({ expanded, panelId, buttonId, toggle })}

{#if isMounted}
    <div
        class="transition-[height] duration-300 ease-[cubic-bezier(0,0,0,1)] overflow-hidden"
        style:display
        style:height
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
{/if}
