<script lang="ts">
    import { buildCmsImageAttributes } from '#lib/images/cmsImage.ts';

    interface Props {
        src: string;
        width: number;
        height: number;
        alt: string;
        quality?: 75 | 100;
        sizes?: string;
        loading?: 'eager' | 'lazy';
        decoding?: 'async' | 'auto' | 'sync';
        fetchpriority?: 'high' | 'low' | 'auto';
        class?: string;
        style?: string;
    }

    let {
        src,
        width,
        height,
        alt,
        quality = 75,
        sizes,
        loading,
        decoding,
        fetchpriority,
        class: className,
        style,
    }: Props = $props();

    let attrs = $derived(
        buildCmsImageAttributes({
            src,
            width,
            height,
            alt,
            quality,
            sizes,
            loading,
            decoding,
            fetchpriority,
            class: className,
            style,
        }),
    );
</script>

<img
    src={attrs.src}
    srcset={attrs.srcset}
    width={attrs.width}
    height={attrs.height}
    alt={attrs.alt}
    loading={attrs.loading}
    decoding={attrs.decoding}
    fetchpriority={attrs.fetchpriority}
    class={attrs.class}
    style={attrs.style}
    sizes={attrs.sizes}
/>
