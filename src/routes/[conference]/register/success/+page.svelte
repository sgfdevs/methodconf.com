<script lang="ts">
    import ChildPageShell from '#lib/components/ChildPageShell.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const routeParams = $derived({ conference: data.conferenceSlug });
</script>

<ChildPageShell
    conference={data.conference}
    params={routeParams}
    sponsors={data.layoutSponsors}
>
    <section class="py-24 md:py-32">
        <div class="content-container text-center">
            <h1 class="text-2xl md:text-5xl font-bold mb-2 md:mb-8">
                Thank You for Registering
            </h1>
            <p class="text-md md:text-2xl">
                We’ve sent a confirmation email to your inbox.
            </p>
            <p class="text-md md:text-2xl">
                If you don't receive that email or have any other issues please
                email <a href="mailto:info@methodconf.com" class="text-primary"
                    >info@methodconf.com</a
                >
            </p>
            <br />
            <a
                href={`/${data.conferenceSlug}/`}
                class="button secondary inline-block"
            >
                Back Home
            </a>
        </div>
    </section>
</ChildPageShell>
