<script lang="ts">
    import {
        faInstagram,
        faLinkedin,
        faXTwitter,
        faYoutube,
    } from '@fortawesome/free-brands-svg-icons';
    import FontAwesomeIcon from './FontAwesomeIcon.svelte';

    const year = new Date().getFullYear();

    const socialLinks = [
        {
            icon: faLinkedin,
            url: 'https://www.linkedin.com/company/methodconf',
            title: 'LinkedIn',
        },
        {
            icon: faInstagram,
            url: 'https://www.instagram.com/methodconference/',
            title: 'Instagram',
        },
        {
            icon: faXTwitter,
            url: 'https://twitter.com/methodconf',
            title: 'X',
        },
        {
            icon: faYoutube,
            url: 'https://www.youtube.com/c/sgfdevs/videos',
            title: 'YouTube',
        },
    ];
</script>

<footer
    class="content-container mx-auto flex justify-between items-center pt-4 pb-8 sm:pt-12 sm:pb-16 flex-col sm:flex-row-reverse"
>
    <section class="mb-5 sm:mb-0">
        <nav class="flex space-x-6" aria-label="Social links">
            {#each socialLinks as { icon, url, title } (url)}
                <a
                    href={url}
                    target="_blank"
                    class="text-primary text-lg"
                    aria-label={title}
                >
                    <FontAwesomeIcon {icon} />
                </a>
            {/each}
        </nav>
    </section>

    <section class="flex items-center flex-col sm:flex-row">
        <div class="w-16 mb-5 sm:mb-0">
            <img
                class="max-w-full mx-auto"
                src="/sgf-flag.svg"
                alt="Springfield Flag"
            />
        </div>
        <p class="ml-0 sm:ml-4">
            We ❤️ Springfield. <span>©{year} Springfield Devs. 501(c)6</span>
        </p>
    </section>
</footer>
