<script lang="ts">
    import ChildPageShell from '#lib/components/ChildPageShell.svelte';
    import GenericPage from '#lib/components/GenericPage.svelte';
    import SpeakerDetailPage from '#lib/components/SpeakerDetailPage.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const routeParams = $derived({ conference: data.conferenceSlug });
    const pageParams = $derived({
        conference: data.conferenceSlug,
        slug:
            data.item.route.path
                ?.replace(new RegExp(`^/${data.conferenceSlug}/?`), '')
                .split('/')
                .filter(Boolean) ?? [],
    });
</script>

<ChildPageShell
    conference={data.conference}
    params={routeParams}
    sponsors={data.layoutSponsors}
>
    {#if data.item.contentType === 'speaker'}
        <SpeakerDetailPage speaker={data.item} sessions={data.sessions ?? []} />
    {:else}
        <GenericPage
            params={pageParams}
            conference={data.conference}
            page={data.item}
            schedule={data.schedule}
            sponsors={data.sponsors}
        />
    {/if}
</ChildPageShell>
