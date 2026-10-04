<script lang="ts">
    import Button from './Button.svelte';

    export interface NavigationLink {
        url: string;
        title: string;
    }

    interface Props {
        links: NavigationLink[];
    }

    let { links }: Props = $props();
</script>

<nav class="w-full bg-primary">
    <div class="content-container flex justify-end">
        <ul class="flex space-x-5 translate-y-1/2">
            {#each links as { url, title } (url)}
                <li>
                    <Button {url}>{title}</Button>
                </li>
            {/each}
        </ul>
    </div>
</nav>
