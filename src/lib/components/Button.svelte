<script lang="ts">
    import { imageUrl } from '#lib/imageUrl.ts';
    import type { CmsLink } from '#lib/types.ts';
    import type { Snippet } from 'svelte';

    interface Props {
        cmsLink?: CmsLink;
        url?: string | null;
        children?: Snippet;
        class?: string;
    }

    const buttonClasses = 'button block';

    let { cmsLink, url, children, class: className }: Props = $props();

    const combinedClass = $derived(
        className ? `${buttonClasses} ${className}` : buttonClasses,
    );

    const label = $derived(cmsLink?.title ?? '');

    function linkWithQuery(
        baseUrl: string,
        queryString?: string | null,
    ): string {
        return queryString ? baseUrl + queryString : baseUrl;
    }

    const resolved = $derived.by(() => {
        if (cmsLink) {
            const { route, queryString, target } = cmsLink;

            if (cmsLink.linkType === 'Content' && route?.path) {
                return {
                    kind: 'anchor' as const,
                    href: linkWithQuery(route.path, queryString),
                    target: target || undefined,
                };
            }

            if (cmsLink.linkType === 'External' && cmsLink.url) {
                return {
                    kind: 'anchor' as const,
                    href: linkWithQuery(cmsLink.url, queryString),
                    target: target || undefined,
                };
            }

            if (cmsLink.linkType === 'Media' && cmsLink.url) {
                return {
                    kind: 'anchor' as const,
                    href: imageUrl(linkWithQuery(cmsLink.url, queryString)),
                    target: target || undefined,
                };
            }

            return { kind: 'button' as const };
        }

        if (!url) {
            return { kind: 'button' as const };
        }

        const isExternalUrl =
            url.startsWith('https://') || url.startsWith('http://');

        return {
            kind: 'anchor' as const,
            href: url,
            target: isExternalUrl ? '_blank' : undefined,
        };
    });
</script>

{#if resolved.kind === 'anchor'}
    <a class={combinedClass} href={resolved.href} target={resolved.target}>
        {#if children}
            {@render children()}
        {:else}
            {label}
        {/if}
    </a>
{:else}
    <button class={combinedClass}>
        {#if children}
            {@render children()}
        {:else}
            {label}
        {/if}
    </button>
{/if}
