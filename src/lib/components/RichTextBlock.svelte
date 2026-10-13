<script lang="ts">
    import type { RichTextBlock } from '#lib/types.ts';
    import RichText from './RichText.svelte';

    interface Props {
        block: RichTextBlock;
    }

    let { block }: Props = $props();

    const markup = $derived(block.properties?.text?.markup);
</script>

<section class="my-12 sm:my-20">
    <div class="small-content-container">
        {#if markup}
            <RichText {markup} />
        {/if}
    </div>
</section>
