<script lang="ts">
    import type { SponsorTier } from '#lib/types.ts';
    import SponsorCard from './SponsorCard.svelte';
    import { parseCardSize } from './sponsorCard.ts';

    interface Props {
        tier: SponsorTier;
    }

    let { tier }: Props = $props();

    const title = $derived(tier.properties?.title);
    const cardSize = $derived(
        parseCardSize(tier.properties?.logoSizes) ?? 'medium',
    );
    const sponsors = $derived(
        tier.properties?.sponsors?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsor') ?? [],
    );
    const headingStyles = $derived(
        cardSize === 'large'
            ? 'text-xl md:text-4xl font-bold'
            : 'text-xl md:text-3xl font-semibold',
    );
</script>

<div>
    {#if title}
        <div class="flex items-center mb-4 sm:mb-5">
            <div class="bg-primary h-[4px] flex-1"></div>
            <div class="px-5 text-center">
                <h3 class={headingStyles}>{title}</h3>
            </div>
            <div class="bg-primary h-[4px] flex-1"></div>
        </div>
    {/if}

    {#if sponsors.length > 0}
        <div
            class={`${cardSize === 'small' ? 'px-4' : ''} sm:px-10 mb-8 sm:mb-12`}
        >
            <div class="flex flex-wrap justify-center -m-2">
                {#each sponsors as sponsor (sponsor.id)}
                    <SponsorCard {sponsor} {cardSize} />
                {/each}
            </div>
        </div>
    {/if}
</div>
