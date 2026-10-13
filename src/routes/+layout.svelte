<script lang="ts">
    import '@fontsource-variable/source-sans-3/wght.css';
    import '../app.css';
    import type { Snippet } from 'svelte';
    import type { LayoutData } from './$types';

    let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<svelte:head>
    {#if !data.searchIndexingEnabled}
        <meta name="robots" content="noindex,nofollow" />
    {/if}
</svelte:head>

<main class="min-h-screen bg-white text-secondary">
    {@render children()}
</main>
