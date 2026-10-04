<script lang="ts">
    import type { TextWithButtonsBlock } from '#lib/types.ts';
    import Button from './Button.svelte';
    import RichText from './RichText.svelte';

    interface Props {
        block: TextWithButtonsBlock;
    }

    let { block }: Props = $props();

    const text = $derived(block.properties?.text?.markup);
    const buttons = $derived(block.properties?.buttons ?? []);
</script>

<section class="my-12 sm:my-20">
    <div class="small-content-container">
        {#if text}
            <RichText class="mb-5" markup={text} />
        {/if}
        <div class="flex space-x-3">
            {#each buttons as button, index (button.destinationId ?? button.url ?? index)}
                <Button cmsLink={button}>{button.title}</Button>
            {/each}
        </div>
    </div>
</section>
