<script lang="ts">
    import IntroAndEmailSignupBlock from '#lib/components/IntroAndEmailSignupBlock.svelte';
    import LocationBlock from '#lib/components/LocationBlock.svelte';
    import RichTextBlock from '#lib/components/RichTextBlock.svelte';
    import ScheduleBlock from '#lib/components/ScheduleBlock.svelte';
    import SponsorsBlock from '#lib/components/SponsorsBlock.svelte';
    import TextWithButtonsBlock from '#lib/components/TextWithButtonsBlock.svelte';
    import { getPageBlocks } from '#lib/pageBlocks.ts';
    import type {
        Page,
        ParsedConference,
        Schedule,
        Sponsors,
    } from '#lib/types.ts';

    interface Props {
        params: {
            conference: string;
            slug?: string[];
        };
        conference: ParsedConference;
        page: Page;
        schedule?: Schedule;
        sponsors?: Sponsors;
    }

    let { params, conference, page, schedule, sponsors }: Props = $props();

    const blocks = $derived(getPageBlocks(page));
</script>

{#each blocks as block (block.id)}
    {#if block.contentType === 'introAndEmailSignupBlock'}
        <IntroAndEmailSignupBlock {params} />
    {:else if block.contentType === 'scheduleBlock'}
        <ScheduleBlock {conference} {schedule} />
    {:else if block.contentType === 'locationBlock'}
        <LocationBlock />
    {:else if block.contentType === 'sponsorsBlock'}
        <SponsorsBlock {sponsors} />
    {:else if block.contentType === 'richText'}
        <RichTextBlock {block} />
    {:else if block.contentType === 'textWithButtons'}
        <TextWithButtonsBlock {block} />
    {/if}
{/each}
