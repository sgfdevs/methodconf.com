import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../src/lib/components/Button.svelte';
import DefaultNav from '../../src/lib/components/DefaultNav.svelte';
import HomeNav from '../../src/lib/components/HomeNav.svelte';
import Navigation from '../../src/lib/components/Navigation.svelte';
import LocationBlock from '../../src/lib/components/LocationBlock.svelte';
import RichText from '../../src/lib/components/RichText.svelte';
import SponsorCard from '../../src/lib/components/SponsorCard.svelte';
import SponsorsBlock from '../../src/lib/components/SponsorsBlock.svelte';
import TextInput from '../../src/lib/components/TextInput.svelte';
import { rewriteRichTextMediaUrls } from '../../src/lib/components/richText.ts';
import type {
    CmsLink,
    ParsedConference,
    Sponsor,
    Sponsors,
} from '../../src/lib/types.ts';

vi.mock('$app/state', () => ({
    page: { data: { cmsPublicUrl: 'https://cms-public.example.test/' } },
}));

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
        ).toContain(
            'href="https://cms-public.example.test/media/wixhir55/building-map.pdf"',
        );
    });

    it('rebases absolute CMS media buttons without dropping query parameters or fragments', () => {
        const html = render(Button, {
            props: {
                cmsLink: {
                    linkType: 'Media',
                    title: 'Download',
                    url: 'http://cms-internal.test/media/file.pdf?crop=center#page=2',
                    queryString: '?download=true',
                },
            },
        }).body;

        expect(html).toContain(
            'href="https://cms-public.example.test/media/file.pdf?crop=center&amp;download=true#page=2"',
        );
        expect(html).not.toContain('cms-internal.test');
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

        expect(html).toContain('text-input-root');
        expect(html).toContain('text-input-backdrop');
        expect(html).toContain('text-input-field');
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
                '<p><a href="/media/wixhir55/building-map.pdf">Map</a><img src="https://cms-private.example.test/media/logo.png?crop=0,0,1,1&amp;width=100#logo"><a href="https://example.com/media/file.pdf">External</a></p>',
                'https://cms-public.example.test/',
                'https://cms-private.example.test/',
            ),
        ).toBe(
            '<p><a href="https://cms-public.example.test/media/wixhir55/building-map.pdf">Map</a><img src="https://cms-public.example.test/media/logo.png?crop=0,0,1,1&amp;width=100#logo"><a href="https://example.com/media/file.pdf">External</a></p>',
        );

        const html = render(RichText, {
            props: {
                markup: '<p><img src="/media/logo.png"></p>',
                class: 'mb-5',
            },
        }).body;
        expect(html).toContain('prose-a:text-primary');
        expect(html).toContain('class="prose');
        expect(html).toContain(
            'src="https://cms-public.example.test/media/logo.png"',
        );
    });

    it('rewrites CMS rich text srcsets while keeping descriptors, crop commas, and external hosts', () => {
        const markup = `<img src = "/media/speaker's-photo.png" srcset = "http://cms-private.test/media/photo.png?crop=0,0,1,1#photo 1x, /media/photo-2.png 2x, https://external.test/media/photo.png 3x"><a href = '/media/map.pdf#page=2'>Map</a>`;
        expect(
            rewriteRichTextMediaUrls(
                markup,
                'https://cms-public.example.test/',
                'http://cms-private.test/',
            ),
        ).toBe(
            `<img src = "https://cms-public.example.test/media/speaker's-photo.png" srcset = "https://cms-public.example.test/media/photo.png?crop=0,0,1,1#photo 1x, https://cms-public.example.test/media/photo-2.png 2x, https://external.test/media/photo.png 3x"><a href = 'https://cms-public.example.test/media/map.pdf#page=2'>Map</a>`,
        );
        expect(
            rewriteRichTextMediaUrls(
                `<img srcset='/media/a.svg, /media/b.svg'>`,
                'https://cms-public.example.test/',
            ),
        ).toBe(
            `<img srcset='https://cms-public.example.test/media/a.svg, https://cms-public.example.test/media/b.svg'>`,
        );
    });

    it('uses the public CMS for location maps', () => {
        const html = render(LocationBlock).body;
        expect(html).toContain(
            'href="https://cms-public.example.test/media/wixhir55/building-map.pdf"',
        );
        expect(html).toContain(
            'href="https://cms-public.example.test/media/pw1lyaa4/parking-map.pdf"',
        );
    });

    it('keeps the sponsor CTA Method logo intrinsic dimensions', () => {
        const sponsors = {
            id: 'sponsors-id',
            contentType: 'sponsors',
            name: 'Sponsors',
            properties: {
                tiers: { items: [] },
                opportunitiesUrl: [
                    {
                        linkType: 'Media',
                        title: 'See Opportunities',
                        url: '/media/sponsor-packet.pdf',
                    },
                ],
            },
        } as unknown as Sponsors;

        const html = render(SponsorsBlock, { props: { sponsors } }).body;

        expect(html).toContain('src="/method-logo.svg"');
        expect(html).toContain('alt="Method Logo"');
        expect(html).toContain('width="359"');
        expect(html).toContain('height="78"');
    });

    it('loads sponsor SVGs directly from the public CMS with intrinsic dimensions', () => {
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
        expect(html).toContain(
            'src="https://cms-public.example.test/media/logo.svg?height=240"',
        );
        expect(html).toContain('loading="lazy"');
        expect(html).not.toContain('srcset=');
        expect(html).not.toContain('/_image');
        expect(html).toContain('width="300"');
        expect(html).toContain('height="120"');
        expect(html).toContain('min-h-[80px] sm:min-h-[150px]');
    });
});
