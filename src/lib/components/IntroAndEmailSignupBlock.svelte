<script lang="ts">
    import NewsletterForm from '#lib/components/NewsletterForm.svelte';
    import {
        APPLE_APP_STORE_LINK,
        GOOGLE_PLAY_STORE_LINK,
    } from '#lib/config.ts';
    import type { components } from '#lib/umbraco/deliveryApiSchema.d.ts';

    interface Props {
        block?: components['schemas']['IntroAndEmailSignupBlockElementModel'];
        params: {
            conference: string;
        };
    }

    let { params }: Props = $props();
</script>

<section class="flex flex-col lg:flex-row">
    <div class="bg-gray-100 py-16 lg:w-1/2 lg:px-5">
        <div class="content-container lg:max-w-[500px]">
            <div class="mb-8">
                <h2 class="font-bold text-xl lg:text-4xl">
                    Invest In Yourself and Hone Your Craft
                </h2>
                <p>
                    Method Conference Springfield, MO is an immersive one-day
                    conference with three tracks, two one-hour session tracks, a
                    workshop track, and a keynote. All with an intense focus on
                    digital development, design, UX, content, code, and more.
                </p>
            </div>
            <a
                href={`/${params.conference}/register/`}
                class="button inline-block mb-8"
            >
                Register Now
            </a>
            <h3 class="font-bold text-xl lg:text-2xl mb-4">
                Download Our Mobile App!
            </h3>
            <div class="flex space-x-4">
                <a
                    class="block"
                    href={APPLE_APP_STORE_LINK}
                    title="Download iOS app"
                >
                    <img
                        src="/app-store.svg"
                        alt="Download on the App Store"
                        width="165"
                        height="55"
                    />
                </a>
                <a
                    class="block"
                    href={GOOGLE_PLAY_STORE_LINK}
                    title="Download android app"
                >
                    <img
                        src="/play-store.svg"
                        alt="Get it on Google Play"
                        width="186"
                        height="55"
                    />
                </a>
            </div>
        </div>
    </div>
    <div class="lg:w-1/2 lg:px-5">
        <div
            class="content-container max-w-[650px] lg:max-w-[400px] mx-auto py-8 lg:pt-16"
        >
            <p class="font-bold text-xl mb-4">
                Stay in-the-know about event updates and new speaker
                announcements.
            </p>
            <NewsletterForm />
        </div>
    </div>
</section>
