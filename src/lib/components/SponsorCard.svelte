<script lang="ts">
    import { imageUrl } from '#lib/imageUrl.ts';
    import type { Sponsor } from '#lib/types.ts';
    import CmsImage from './CmsImage.svelte';

    export type CardSize = 'large' | 'medium' | 'small';

    interface Props {
        sponsor: Sponsor;
        cardSize: CardSize;
    }

    let { sponsor, cardSize }: Props = $props();

    const properties = $derived(sponsor.properties ?? {});
    const title = $derived(properties.title ?? '');
    const image = $derived(properties.logo?.[0]);
    const imageHeight = $derived(
        cardSize === 'large' ? 375 : cardSize === 'medium' ? 240 : 175,
    );
    const cardWidth = $derived(
        cardSize === 'large'
            ? 'w-full lg:w-1/2'
            : cardSize === 'medium'
              ? 'w-1/2 lg:w-1/3'
              : 'w-1/2 sm:w-1/3 lg:w-1/4',
    );
    const minHeight = $derived(
        cardSize === 'large'
            ? 'min-h-[180px] sm:min-h-[275px]'
            : cardSize === 'medium'
              ? 'min-h-[80px] sm:min-h-[150px]'
              : 'min-h-[75px] sm:min-h-[130px]',
    );
    const cardStyles = $derived(
        `p-2 sm:p-5 shadow-[0_8px_15px_rgba(0,0,0,0.1)] rounded-2xl h-full ${minHeight}${properties.darkBackground ? ' bg-black' : ''}`,
    );
    const logoUrl = $derived(
        image?.url ? imageUrl(image.url, { height: imageHeight }) : undefined,
    );
</script>

<div class={`p-2 ${cardWidth}`}>
    {#if properties.url}
        <a
            class={`block ${cardStyles}`}
            href={properties.url}
            target="_blank"
            title={title || undefined}
        >
            <div class="flex items-center justify-center h-full">
                {#if image && logoUrl}
                    <CmsImage
                        src={logoUrl}
                        height={image.height ?? 200}
                        width={image.width ?? 300}
                        quality={100}
                        alt={`${title} logo`}
                    />
                {:else}
                    <p>{title}</p>
                {/if}
            </div>
        </a>
    {:else}
        <div class={cardStyles}>
            <div class="flex items-center justify-center h-full">
                {#if image && logoUrl}
                    <CmsImage
                        src={logoUrl}
                        height={image.height ?? 200}
                        width={image.width ?? 300}
                        quality={100}
                        alt={`${title} logo`}
                    />
                {:else}
                    <p>{title}</p>
                {/if}
            </div>
        </div>
    {/if}
</div>
