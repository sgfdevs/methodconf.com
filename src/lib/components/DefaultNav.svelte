<script lang="ts">
    import { formatDate } from '#lib/date.ts';
    import type { ParsedConference } from '#lib/types.ts';
    import Navigation from './Navigation.svelte';

    interface Props {
        conference: ParsedConference;
        params: {
            conference: string;
        };
    }

    let { conference, params }: Props = $props();

    const date = $derived(conference.properties.date);
</script>

<header>
    <div class="w-full bg-secondary text-white flex flex-col justify-between">
        <div class="content-container relative text-center py-14">
            <img
                class="max-w-full mx-auto"
                src="/method-logo.svg"
                alt="Method Logo"
            />
            <h1 class="text-2xl lg:text-5xl lg:font-thin mt-9">
                <span class="sr-only">Method Conference </span>
                {date
                    ? `${formatDate(date, 'EEEE, MMMM do, yyyy')} in `
                    : ''}Springfield, MO
            </h1>
            <p class="text-lg mt-5">
                An immersive day of code, content, and design
            </p>
            <br />
        </div>
    </div>

    <Navigation
        links={[
            {
                url: `/${params.conference}/`,
                title: 'Event Details',
            },
            {
                url: `/${params.conference}/register/`,
                title: 'Register',
            },
        ]}
    />
</header>
