<script lang="ts">
    import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
    import CmsImage from '#lib/components/CmsImage.svelte';
    import Disclosure from '#lib/components/Disclosure.svelte';
    import FontAwesomeIcon from '#lib/components/FontAwesomeIcon.svelte';
    import RichText from '#lib/components/RichText.svelte';
    import { formatDate } from '#lib/date.ts';
    import { imageUrl } from '#lib/imageUrl.ts';
    import type { ParsedSession, Speaker } from '#lib/types.ts';

    interface Props {
        session: ParsedSession;
        style?: string;
        disableSpeakerLinks?: boolean;
        class?: string;
    }

    let {
        session,
        style,
        disableSpeakerLinks = false,
        class: className = '',
    }: Props = $props();

    const start = $derived(session.properties?.start);
    const description = $derived(session.properties?.description);
    const speakerContent = $derived(
        session.properties?.speakers?.find(isSpeakerContent),
    );
    const markup = $derived(description?.markup);
    const profileImage = $derived(
        speakerContent?.properties?.profileImage?.[0],
    );
    const profileImageUrl = $derived(
        profileImage?.url
            ? imageUrl(profileImage.url, { width: 100, height: 100 })
            : undefined,
    );
    const jobTitle = $derived(speakerContent?.properties?.jobTitle);
    const disclosureId = $derived(`session-card-${session.id}`);
    const wrapperClass = $derived(
        `bg-gray-100 p-4 2xl:p-8 ${className} session-card-accordion-wrapper`.trim(),
    );

    function isSpeakerContent(value: unknown): value is Speaker {
        return (
            typeof value === 'object' &&
            value !== null &&
            'contentType' in value &&
            value.contentType === 'speaker'
        );
    }
</script>

<div {style} class={wrapperClass}>
    {#if start}
        <time class="text-lg xl:text-2xl font-thin">
            {formatDate(start, 'h:mm a')}
        </time>
    {/if}

    {#if markup}
        <Disclosure id={disclosureId}>
            {#snippet trigger({ expanded, panelId, buttonId, toggle })}
                <div class="flex justify-between items-center">
                    <div class="flex items-center w-full text-left">
                        {#if profileImageUrl}
                            <CmsImage
                                src={profileImageUrl}
                                width={100}
                                height={100}
                                alt={`${speakerContent?.name ?? ''} profile image`}
                                class="w-[50px] h-[50px] md:w-[70px] md:h-[70px] lg:w-[75px] lg:h-[75px] 2xl:w-[80px] 2xl:h-[80px] rounded-full mr-3"
                            />
                        {/if}
                        <div>
                            <h3
                                class="text-base sm:text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold"
                            >
                                {session.name}
                            </h3>
                            {#if speakerContent}
                                <p class="text-sm sm:text-base mt-2">
                                    {#if disableSpeakerLinks}
                                        {speakerContent.name}
                                    {:else}
                                        <a
                                            href={speakerContent.route.path ??
                                                '#'}
                                            class="text-primary"
                                        >
                                            {speakerContent.name}</a
                                        >
                                    {/if}{jobTitle ? `: ${jobTitle}` : ''}
                                </p>
                            {/if}
                        </div>
                    </div>
                    <button
                        id={buttonId}
                        type="button"
                        class="text-primary font-medium text-lg ml-4 lg:ml-8 flex items-center"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onclick={toggle}
                    >
                        {expanded ? 'Less' : 'More'}
                        <span class="text-black text-sm ml-1">
                            <span
                                class={`inline-block transition-[transform] duration-300 ease-[cubic-bezier(0,0,0,1)] ${expanded ? 'rotate-180' : ''}`}
                            >
                                <FontAwesomeIcon icon={faChevronDown} />
                            </span>
                        </span>
                    </button>
                </div>
            {/snippet}

            <RichText class="mt-4" {markup} />
        </Disclosure>
    {:else}
        <div class="flex items-center w-full text-left">
            {#if profileImageUrl}
                <CmsImage
                    src={profileImageUrl}
                    width={100}
                    height={100}
                    alt={`${speakerContent?.name ?? ''} profile image`}
                    class="w-[50px] h-[50px] md:w-[70px] md:h-[70px] lg:w-[75px] lg:h-[75px] 2xl:w-[80px] 2xl:h-[80px] rounded-full mr-3"
                />
            {/if}
            <div>
                <h4
                    class="text-base sm:text-lg md:text-xl lg:text-2xl 2xl:text-3xl font-bold"
                >
                    {session.name}
                </h4>
                {#if speakerContent}
                    <p class="text-sm sm:text-base mt-2">
                        {#if disableSpeakerLinks}
                            {speakerContent.name}
                        {:else}
                            <a
                                href={speakerContent.route.path ?? '#'}
                                class="text-primary"
                            >
                                {speakerContent.name}</a
                            >
                        {/if}{jobTitle ? `: ${jobTitle}` : ''}
                    </p>
                {/if}
            </div>
        </div>
    {/if}
</div>
