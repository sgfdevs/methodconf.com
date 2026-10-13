<script lang="ts">
    import {
        icon as renderIcon,
        type IconDefinition,
    } from '@fortawesome/fontawesome-svg-core';

    interface Props {
        icon: IconDefinition;
        title?: string;
    }

    let { icon, title }: Props = $props();

    const markup = $derived(renderIcon(icon, { title }).html.join(''));
</script>

<!-- Trusted static Font Awesome icon HTML from locked @fortawesome packages. -->
<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html markup}
