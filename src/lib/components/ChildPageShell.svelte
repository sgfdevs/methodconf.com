<script lang="ts">
    import type { Snippet } from 'svelte';
    import DefaultNav from '#lib/components/DefaultNav.svelte';
    import SponsorsBlock from '#lib/components/SponsorsBlock.svelte';
    import type { ParsedConference, Sponsors } from '#lib/types.ts';

    interface Props {
        conference: ParsedConference;
        params: {
            conference: string;
        };
        sponsors?: Sponsors;
        children: Snippet;
    }

    let { conference, params, sponsors, children }: Props = $props();
</script>

<DefaultNav {conference} {params} />
{@render children()}
{#if sponsors}
    <SponsorsBlock {sponsors} />
{/if}
