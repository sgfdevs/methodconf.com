<script lang="ts">
    import { dev } from '$app/env';
    import { page } from '$app/state';
    import Footer from '#lib/components/Footer.svelte';
    import '../app.css';
    import type { Snippet } from 'svelte';
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

    const isErrorPage = $derived(page.status >= 400);
</script>

<svelte:head>
    <title>Method Conference - October 12th 2024 - Springfield, MO</title>
    <meta property="og:image" content="/opengraph-image.jpg" />
    <link rel="icon" href="/icon.png" />
    <link
        rel="preload"
        href="/fonts/source-sans-3/47df9ba1c7236d3b-s.p.137759vg1sbmi.woff2"
        as="font"
        type="font/woff2"
        crossorigin="anonymous"
    />
    {#if !data.searchIndexingEnabled}
        <meta name="robots" content="noindex,nofollow" />
    {/if}
    {#if !dev}
        <!-- next-plausible parity scripts copied from next-plausible's provider output. -->
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html plausibleHeadHtml}
    {/if}
</svelte:head>

<main class="min-h-screen bg-white text-secondary">
    {@render children()}
</main>

{#if !isErrorPage}
    <Footer />
{/if}
