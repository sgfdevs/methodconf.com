<script lang="ts">
    import GenericPage from '#lib/components/GenericPage.svelte';
    import HomeNav from '#lib/components/HomeNav.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const routeParams = $derived({
        conference: data.conferenceSlug,
        slug: [],
    });
</script>

<HomeNav params={routeParams} conference={data.conference} />
<GenericPage
    params={routeParams}
    conference={data.conference}
    page={data.page}
    schedule={data.schedule}
    sponsors={data.sponsors}
/>
