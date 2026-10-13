<script lang="ts">
    import { rewriteRichTextMediaUrls } from './richText.ts';

    interface Props {
        markup: string;
        class?: string;
    }

    let { markup, class: className = '' }: Props = $props();

    const renderedMarkup = $derived(rewriteRichTextMediaUrls(markup));
    const richTextClass = $derived(
        `prose prose-a:text-primary prose-a:decoration-0 prose-a:font-normal max-w-none ${className}`.trimEnd(),
    );
</script>

<div class={richTextClass}>
    <!-- Trusted CMS rich text. We only rewrite CMS media URLs to the local proxy before rendering. -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html renderedMarkup}
</div>
