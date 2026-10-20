<script lang="ts">
    import { page } from '$app/state';
    import { rewriteRichTextMediaUrls } from './richText.ts';

    interface Props {
        markup: string;
        class?: string;
    }

    let { markup, class: className = '' }: Props = $props();

    const renderedMarkup = $derived(
        rewriteRichTextMediaUrls(
            markup,
            page.data.mediaPublicUrl,
            page.data.cmsPublicUrl,
        ),
    );
    const richTextClass = $derived(
        `prose prose-a:text-primary prose-a:decoration-0 prose-a:font-normal max-w-none ${className}`.trimEnd(),
    );
</script>

<div class={richTextClass}>
    <!-- Trusted CMS rich text. Media URLs use the public media origin. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderedMarkup}
</div>
