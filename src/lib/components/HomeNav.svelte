<script lang="ts">
    import { formatDate } from '#lib/date.ts';
    import type { ParsedConference } from '#lib/types.ts';
    import Navigation from './Navigation.svelte';

    interface Props {
        params: {
            conference: string;
        };
        conference: ParsedConference;
    }

    let { params, conference }: Props = $props();

    const date = $derived(conference.properties.date);
</script>

<header>
    <div class="w-full bg-secondary text-white flex flex-col justify-between">
        <div class="content-container relative text-center pt-20">
            <img
                class="max-w-full mx-auto"
                src="/method-logo.svg"
                alt="Method Logo"
            />
            <h1 class="text-2xl md:text-4xl lg:text-5xl lg:font-thin mt-9">
                <span class="sr-only">Method Conference </span>
                {date
                    ? `${formatDate(date, 'EEEE, MMMM do, yyyy')} in `
                    : ''}Springfield, MO
            </h1>
            <p class="text-xl md:text-2xl font-medium mt-5">
                An immersive day of <span class="text-primary">code</span>,
                <span class="text-primary">content</span>, and
                <span class="text-primary">more</span>
            </p>
            <br />
            <br />
            <a
                href={`/${params.conference}/register/`}
                class="button secondary inline-block"
            >
                Register Now
            </a>
        </div>

        <div
            class="relative bottom-0 pt-14 bg-cover"
            style="background-image: url('/header-gradient.svg')"
        >
            <picture>
                <source media="(min-width: 640px)" srcset="/skyline.svg" />
                <img
                    class="object-cover w-full"
                    src="/skyline-mobile.svg"
                    alt=""
                    decoding="async"
                />
            </picture>
        </div>
    </div>

    <Navigation
        links={[
            {
                url: `/${params.conference}/register/`,
                title: 'Register',
            },
            { url: '#schedule', title: 'Schedule' },
            { url: '#location', title: 'Location' },
        ]}
    />
</header>
