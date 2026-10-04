<script lang="ts">
    /* global HTMLIFrameElement, MessageEvent, window */
    import { onMount } from 'svelte';
    import { buildOveItIframeState } from '#lib/oveit.ts';

    interface Props {
        embedUrl: string;
    }

    let { embedUrl }: Props = $props();

    let iframe: HTMLIFrameElement | undefined = $state();
    let iframeSrc: string | undefined = $state();
    let embedId: string | undefined = $state();

    function sendInfo(time: number) {
        iframe?.contentWindow?.postMessage(
            {
                type: 'info',
                referrer: window.location.href,
                embedID: embedId,
                time,
            },
            '*',
        );
    }

    function resizeIframe(height: unknown) {
        if (!iframe) {
            return;
        }

        const parsedHeight = Number(height);
        iframe.style.height = `${Number.isNaN(parsedHeight) ? 800 : parsedHeight}px`;
    }

    onMount(() => {
        const iframeState = buildOveItIframeState(
            embedUrl,
            window.location.hash,
        );

        if (!iframeState) {
            return;
        }

        embedId = iframeState.embedId;
        iframeSrc = iframeState.iframeUrl.toString();

        function onWindowMessage(event: MessageEvent) {
            if (event.source !== iframe?.contentWindow) {
                return;
            }

            switch (event.data?.type) {
                case 'resize':
                    resizeIframe(event.data.height);
                    break;
                case 'info':
                    sendInfo(event.data.time);
                    break;
            }
        }

        function onWindowResize() {
            iframe?.contentWindow?.postMessage({ type: 'resize' }, '*');
        }

        window.addEventListener('message', onWindowMessage);
        window.addEventListener('resize', onWindowResize);

        return () => {
            window.removeEventListener('message', onWindowMessage);
            window.removeEventListener('resize', onWindowResize);
        };
    });
</script>

{#if iframeSrc}
    <iframe
        bind:this={iframe}
        title="Registration"
        class="w-full overflow-hidden"
        src={iframeSrc}
    ></iframe>
{:else}
    Loading...
{/if}
