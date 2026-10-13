<script lang="ts">
    import ChildPageShell from '#lib/components/ChildPageShell.svelte';
    import OveItEmbed from '#lib/components/OveItEmbed.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const routeParams = $derived({ conference: data.conferenceSlug });
</script>

<ChildPageShell
    conference={data.conference}
    params={routeParams}
    sponsors={data.layoutSponsors}
>
    <section class="py-14">
        <div class="content-container">
            <OveItEmbed embedUrl={data.registerUrl} />
        </div>
    </section>
</ChildPageShell>
