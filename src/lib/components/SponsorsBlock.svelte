<script lang="ts">
    import type { Sponsors } from '#lib/types.ts';
    import Button from './Button.svelte';
    import SectionTitleBar from './SectionTitleBar.svelte';
    import SponsorTierItem from './SponsorTierItem.svelte';

    interface Props {
        sponsors?: Sponsors;
    }

    let { sponsors }: Props = $props();

    const tiers = $derived(
        sponsors?.properties?.tiers?.items
            .map((item) => item.content)
            .filter((content) => content.contentType === 'sponsorTier') ?? [],
    );
    const opportunitiesUrl = $derived(
        sponsors?.properties?.opportunitiesUrl?.[0],
    );
</script>

<section id="sponsor" class="mb-12 sm:mb-20">
    <SectionTitleBar title="Sponsors" />

    <div class="pt-12 sm:pt-20">
        {#if tiers.length > 0}
            <div class="content-container mb-12 sm:mb-14">
                <p class="text-xl xl:text-4xl font-thin mb-8 text-center">
                    Method Conference 2024 is proud to be sponsored by
                </p>
                {#each tiers as tier (tier.id)}
                    <SponsorTierItem {tier} />
                {/each}
            </div>
        {/if}

        {#if opportunitiesUrl}
            <div class="content-container bg-black relative overflow-clip">
                <div
                    class="bg-primary w-0 sm:w-1/4 lg:w-1/3 h-full absolute right-0 top-0 bottom-0"
                ></div>
                <div
                    class="bg-primary w-[200%] sm:w-full h-[200%] absolute right-0 sm:right-1/4 lg:right-1/3 top-0 bottom-0 -rotate-45 origin-top-right"
                ></div>
                <div
                    class="flex flex-col xl:flex-row justify-center relative py-20 px-10 xl:space-x-8 items-center space-y-4 xl:space-y-0"
                >
                    <img
                        src="/method-logo.svg"
                        alt="Method Logo"
                        width="359"
                        height="78"
                    />

                    <p class="text-white font-bold text-2xl text-center">
                        Interested in becoming a sponsor?
                    </p>
                    <Button class="inline-block" cmsLink={opportunitiesUrl} />
                </div>
            </div>
        {/if}
    </div>
</section>
