import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import Button from '../../src/lib/components/Button.svelte';
import LocationBlock from '../../src/lib/components/LocationBlock.svelte';
import RichText from '../../src/lib/components/RichText.svelte';
import SponsorCard from '../../src/lib/components/SponsorCard.svelte';
import TextInput from '../../src/lib/components/TextInput.svelte';
import { rewriteRichTextMediaUrls } from '../../src/lib/components/richText.ts';
import type { Sponsor } from '../../src/lib/types.ts';

vi.mock('$app/state', () => ({
    page: { data: { cmsPublicUrl: 'https://cms-public.example.test/' } },
}));

describe('shared UI components', () => {
    it.each<[string, ComponentProps<typeof Button>]>([
        ['href="/register/"', { url: '/register/' }],
        ['target="_blank"', { url: 'https://example.com' }],
        [
            'href="/page/?ref=nav"',
            {
                cmsLink: {
                    linkType: 'Content',
                    queryString: '?ref=nav',
                    route: {
                        path: '/page/',
                        startItem: { id: 'root', path: '/' },
                    },
                },
            },
        ],
        [
            'href="https://cms-public.example.test/media/map.pdf"',
            { cmsLink: { linkType: 'Media', url: '/media/map.pdf' } },
        ],
        [
            'href="https://cms-public.example.test/media/file.pdf?crop=center&amp;download=true#page=2"',
            {
                cmsLink: {
                    linkType: 'Media',
                    url: 'http://cms-internal.test/media/file.pdf?crop=center#page=2',
                    queryString: '?download=true',
                },
            },
        ],
    ])('renders button %s', (expected, props) => {
        expect(render(Button, { props }).body).toContain(expected);
    });

    it('associates the text input label with its ID and keeps native validation', () => {
        const html = render(TextInput, {
            props: {
                label: 'Email',
                name: 'email',
                type: 'email',
                required: true,
            },
        }).body;

        const id = html.match(/<input[^>]*id="([^"]+)"/)?.[1];
        expect(id).toBeTruthy();
        expect(html).toContain(`for="${id}"`);
        expect(html).toContain('name="email"');
        expect(html).toContain('type="email"');
        expect(html).toContain('required');
        expect(html).toContain('>Email</label>');
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
            },
        }).body;
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

    it('loads sponsor SVGs directly from the public CMS with intrinsic dimensions', () => {
        const sponsor = {
            properties: {
                title: 'Acme',
                url: 'https://example.com',
                logo: [
                    {
                        url: '/media/logo.svg',
                        width: 300,
                        height: 120,
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
        expect(html).toContain('width="300"');
        expect(html).toContain('height="120"');
    });
});
