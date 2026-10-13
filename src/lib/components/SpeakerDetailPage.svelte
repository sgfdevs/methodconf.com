<script lang="ts">
    import {
        faInstagram,
        faLinkedin,
        faXTwitter,
        type IconDefinition,
    } from '@fortawesome/free-brands-svg-icons';
    import { faGlobe } from '@fortawesome/free-solid-svg-icons';
    import CmsImage from '#lib/components/CmsImage.svelte';
    import FontAwesomeIcon from '#lib/components/FontAwesomeIcon.svelte';
    import RichText from '#lib/components/RichText.svelte';
    import SessionCard from '#lib/components/SessionCard.svelte';
    import { imageUrl } from '#lib/imageUrl.ts';
    import type { ParsedSession, Speaker } from '#lib/types.ts';

    interface Props {
        speaker: Speaker;
        sessions: ParsedSession[];
    }

    interface SpeakerLink {
        url: string;
        icon: IconDefinition;
        title: string;
    }

    let { speaker, sessions }: Props = $props();

    const bio = $derived(speaker.properties?.bio);
    const jobTitle = $derived(speaker.properties?.jobTitle);
    const image = $derived(speaker.properties?.profileImage?.[0]);
    const links = $derived(getSpeakerLinks(speaker));

    function getSpeakerLinks(speaker: Speaker): SpeakerLink[] {
        const { websiteUrl, instagramUrl, linkedInUrl, xTwitterUrl } =
            speaker.properties ?? {};

        const links: SpeakerLink[] = [];

        if (websiteUrl) {
            links.push({
                url: websiteUrl,
                icon: faGlobe,
                title: `${speaker.name} Website`,
            });
        }

        if (xTwitterUrl) {
            links.push({
                url: xTwitterUrl,
                icon: faXTwitter,
                title: `${speaker.name} Twitter`,
            });
        }

        if (linkedInUrl) {
            links.push({
                url: linkedInUrl,
                icon: faLinkedin,
                title: `${speaker.name} LinkedIn`,
            });
        }

        if (instagramUrl) {
            links.push({
                url: instagramUrl,
                icon: faInstagram,
                title: `${speaker.name} Instagram`,
            });
        }

        return links;
    }
</script>

<section class="bg-gray-100 py-14">
    <div class="content-container">
        <div class="flex flex-wrap flex-col md:flex-row-reverse">
            <div class="w-full mb-5 md:mb-0 md:w-1/3">
                {#if image?.url}
                    <CmsImage
                        src={imageUrl(image.url, { width: 500, height: 560 })}
                        height={image.height ?? 200}
                        width={image.width ?? 300}
                        alt={`${speaker.name} profile image`}
                        class="mx-auto block w-full max-md:max-w-[400px]"
                    />
                {/if}
            </div>
            <div class="w-full md:w-2/3 md:pr-5">
                <h1 class="text-lg md:text-3xl mb-4">
                    <span class="font-bold">{speaker.name}</span>{jobTitle
                        ? `: ${jobTitle}`
                        : ''}
                </h1>
                {#if bio?.markup}
                    <RichText markup={bio.markup} />
                {/if}
                <div class="mt-4 flex flex-wrap space-x-3">
                    {#each links as { title, url, icon } (title)}
                        <a
                            href={url}
                            target="_blank"
                            {title}
                            class="text-primary text-2xl"
                        >
                            <FontAwesomeIcon {icon} />
                        </a>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</section>
{#if sessions.length > 0}
    <section class="py-14">
        <div class="content-container">
            <h2 class="text-lg md:text-3xl font-thin mb-5">Sessions</h2>
            {#each sessions as session (session.id)}
                <SessionCard
                    {session}
                    disableSpeakerLinks={true}
                    class="mb-5 last:mb-0"
                />
            {/each}
        </div>
    </section>
{/if}
