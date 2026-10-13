<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
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
                const mediaUrl = new globalThis.URL(
                    imageUrl(cmsLink.url, page.data.cmsPublicUrl),
                );
                if (queryString) {
                    const query = new globalThis.URLSearchParams(queryString);
                    for (const [key, value] of query) {
                        mediaUrl.searchParams.set(key, value);
                    }
                }

                return {
                    kind: 'anchor' as const,
                    href: mediaUrl.toString(),
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

    const internalPath = $derived.by(() => {
        if (resolved.kind !== 'anchor' || resolved.href.startsWith('#')) {
            return null;
        }
        if (resolved.href.startsWith('/') && !resolved.href.startsWith('//')) {
            return resolved.href.slice(1);
        }
        try {
            const root = new globalThis.URL(resolve(''), page.url.href);
            const destination = new globalThis.URL(
                resolved.href,
                page.url.href,
            );
            return destination.href.startsWith(root.href)
                ? destination.href.slice(root.href.length)
                : null;
        } catch {
            return null;
        }
    });
</script>

{#snippet content()}
    {#if children}
        {@render children()}
    {:else}
        {label}
    {/if}
{/snippet}

{#if resolved.kind === 'anchor'}
    {#if resolved.href.startsWith('#')}
        <a
            class={combinedClass}
            href={`#${resolved.href.slice(1)}`}
            target={resolved.target}
        >
            {@render content()}
        </a>
    {:else if internalPath !== null}
        <a
            class={combinedClass}
            href={resolve(...([internalPath] as Parameters<typeof resolve>))}
            target={resolved.target}
        >
            {@render content()}
        </a>
    {:else}
        <a
            class={combinedClass}
            href={resolved.href}
            target={resolved.target}
            rel="external"
        >
            {@render content()}
        </a>
    {/if}
{:else}
    <button class={combinedClass}>
        {@render content()}
    </button>
{/if}
