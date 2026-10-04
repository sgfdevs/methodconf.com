<script lang="ts">
    import { dev } from '$app/env';
    import { page } from '$app/state';
    import Footer from '#lib/components/Footer.svelte';
    import { resolveDocumentTitle } from '#lib/head.ts';
    import '../app.css';
    import { onMount, type Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    const plausibleHeadHtml =
        `<script id="next-plausible-script" async src="https://plausible.sgf.dev/js/pa-MKQsdxqo5_oFk0NmM56b1.js"><` +
        `/script><script id="next-plausible-init">;(window.plausible = window.plausible || function () {
  ;(plausible.q = plausible.q || []).push(arguments)
}), (plausible.init = plausible.init || function (i) {
  plausible.o = i || {}
})
plausible.init()<` +
        `/script>`;

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
    let clientMounted = $state(false);

    onMount(() => {
        clientMounted = true;
    });

    const head = $derived(page.data.sharedHead ?? data.sharedHead);
    const documentTitle = $derived(
        resolveDocumentTitle({
            sharedTitle: head.title,
            status: page.status,
            errorMessage: page.error?.message,
            clientMounted,
        }),
    );
    const shouldEmitLayoutRobots = $derived(
        !data.searchIndexingEnabled && page.status < 400,
    );
</script>

<svelte:head>
    <title>{documentTitle}</title>
    {#if head.description}
        <meta name="description" content={head.description} />
    {/if}
    <meta property="og:title" content={head.openGraph.title} />
    {#if head.description}
        <meta property="og:description" content={head.description} />
    {/if}
    <meta property="og:image" content={head.openGraph.image.url} />
    <meta property="og:image:type" content={head.openGraph.image.type} />
    <meta
        property="og:image:width"
        content={String(head.openGraph.image.width)}
    />
    <meta
        property="og:image:height"
        content={String(head.openGraph.image.height)}
    />
    <meta name="twitter:card" content={head.twitter.card} />
    <meta name="twitter:title" content={head.twitter.title} />
    {#if head.description}
        <meta name="twitter:description" content={head.description} />
    {/if}
    <meta name="twitter:image" content={head.twitter.image.url} />
    <meta name="twitter:image:type" content={head.twitter.image.type} />
    <meta
        name="twitter:image:width"
        content={String(head.twitter.image.width)}
    />
    <meta
        name="twitter:image:height"
        content={String(head.twitter.image.height)}
    />
    <link
        rel="icon"
        href={head.icon.href}
        sizes={head.icon.sizes}
        type={head.icon.type}
    />
    <link
        rel="preload"
        href="/fonts/source-sans-3/47df9ba1c7236d3b-s.p.137759vg1sbmi.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
    />
    {#if shouldEmitLayoutRobots}
        <meta name="robots" content="noindex,nofollow" />
    {/if}
    {#if !dev}
        <!-- next-plausible parity scripts copied from next-plausible's provider output. -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html plausibleHeadHtml}
    {/if}
</svelte:head>

<main class="min-h-screen bg-white">
    {@render children()}
</main>

<Footer />
