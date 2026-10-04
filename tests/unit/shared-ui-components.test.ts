import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import Button from '../../src/lib/components/Button.svelte';
import DefaultNav from '../../src/lib/components/DefaultNav.svelte';
import HomeNav from '../../src/lib/components/HomeNav.svelte';
import Navigation from '../../src/lib/components/Navigation.svelte';
import RichText from '../../src/lib/components/RichText.svelte';
import SponsorCard from '../../src/lib/components/SponsorCard.svelte';
import TextInput from '../../src/lib/components/TextInput.svelte';
import { rewriteRichTextMediaUrls } from '../../src/lib/components/richText.ts';
import type {
    CmsLink,
    ParsedConference,
    Sponsor,
} from '../../src/lib/types.ts';

const conference = {
    contentType: 'conference',
    name: '2024',
    id: 'conference-id',
    route: { path: '/2024/', startItem: { id: 'root', path: '/' } },
    properties: {
        date: new Date('2024-10-12T05:00:00.000Z'),
    },
} as ParsedConference;

describe('shared UI components', () => {
    it('renders URL, CMS content, external, and media buttons with original classes', () => {
        expect(
            render(Button, { props: { url: '/2024/register/' } }).body,
        ).toContain('class="button block"');
        expect(
            render(Button, { props: { url: 'https://example.com' } }).body,
        ).toContain('target="_blank"');

        const contentLink: CmsLink = {
            linkType: 'Content',
            title: 'Read more',
            queryString: '?ref=nav',
            route: {
                path: '/2024/code-of-conduct/',
                startItem: { id: 'root', path: '/' },
            },
        };
        expect(
            render(Button, { props: { cmsLink: contentLink } }).body,
        ).toContain('href="/2024/code-of-conduct/?ref=nav"');

        const mediaLink: CmsLink = {
            linkType: 'Media',
            title: 'Map',
            url: '/media/wixhir55/building-map.pdf',
        };
        expect(
            render(Button, { props: { cmsLink: mediaLink } }).body,
        ).toContain('href="/cms-media/media/wixhir55/building-map.pdf"');
    });

    it('keeps text input label, input name, and peer focus classes', () => {
        const html = render(TextInput, {
            props: {
                label: 'Email',
                name: 'email',
                type: 'email',
                required: true,
            },
        }).body;

        expect(html).toContain('name="email"');
        expect(html).toContain('type="email"');
        expect(html).toContain('required');
        expect(html).toContain('peer-focus:text-black');
        expect(html).toContain('>Email</label>');
    });

    it('renders navigation and home header links with responsive skyline picture', () => {
        const navHtml = render(Navigation, {
            props: { links: [{ url: '#schedule', title: 'Schedule' }] },
        }).body;
        expect(navHtml).toContain('class="w-full bg-primary"');
        expect(navHtml).toContain('href="#schedule"');

        const homeHtml = render(HomeNav, {
            props: { conference, params: { conference: '2024' } },
        }).body;
        expect(homeHtml).toContain('src="/method-logo.svg"');
        expect(homeHtml).toContain('media="(min-width: 640px)"');
        expect(homeHtml).toContain('srcset="/skyline.svg"');
        expect(homeHtml).toContain('src="/skyline-mobile.svg"');
        expect(homeHtml).toContain('href="/2024/register/"');
    });

    it('renders default nav date and links using the shared date formatter', () => {
        const html = render(DefaultNav, {
            props: { conference, params: { conference: '2024' } },
        }).body;

        expect(html).toContain(
            'Saturday, October 12th, 2024 in Springfield, MO',
        );
        expect(html).toContain('href="/2024/"');
        expect(html).toContain('href="/2024/register/"');
    });

    it('rewrites only CMS rich text media URLs before trusted HTML rendering', () => {
        expect(
            rewriteRichTextMediaUrls(
                '<p><a href="/media/wixhir55/building-map.pdf">Map</a><img src="https://cms.methodconf.com/media/logo.png?width=100"><a href="https://example.com/media/file.pdf">External</a></p>',
            ),
        ).toBe(
            '<p><a href="/cms-media/media/wixhir55/building-map.pdf">Map</a><img src="/cms-media/media/logo.png?width=100"><a href="https://example.com/media/file.pdf">External</a></p>',
        );

        const html = render(RichText, {
            props: {
                markup: '<p><img src="/media/logo.png"></p>',
                class: 'mb-5',
            },
        }).body;
        expect(html).toContain('prose-a:text-primary');
        expect(html).toContain('class="prose');
        expect(html).toContain('src="/cms-media/media/logo.png"');
    });

    it('uses the fixed-width CMS image helper at quality 100 for sponsor logos', () => {
        const sponsor = {
            id: 'sponsor-id',
            contentType: 'sponsor',
            properties: {
                title: 'Acme',
                url: 'https://example.com',
                logo: [
                    {
                        id: 'logo-id',
                        name: 'Acme',
                        mediaType: 'Image',
                        url: '/media/logo.svg',
                        width: 300,
                        height: 120,
                        properties: null,
                    },
                ],
            },
        } as Sponsor;

        const html = render(SponsorCard, {
            props: { sponsor, cardSize: 'medium' },
        }).body;

        expect(html).toContain('href="https://example.com"');
        expect(html).toContain('alt="Acme logo"');
        expect(html).toContain('q=100');
        expect(html).toContain('width="300"');
        expect(html).toContain('height="120"');
        expect(html).toContain('min-h-[80px] sm:min-h-[150px]');
    });
});
