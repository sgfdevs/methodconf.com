import { describe, expect, it } from 'vitest';
import { imageUrl } from '../../src/lib/imageUrl.ts';
import { buildGenericPageHead } from '../../src/lib/pageHead.ts';
import type { Page } from '../../src/lib/types.ts';

const cmsPublicUrl = 'https://cms-public.example.test/';

describe('CMS media URLs', () => {
    it('resolves relative media against the configured public CMS', () => {
        expect(imageUrl('/media/logo.svg', cmsPublicUrl, { height: 240 })).toBe(
            'https://cms-public.example.test/media/logo.svg?height=240',
        );
        expect(imageUrl('media/map.pdf#page=2', cmsPublicUrl)).toBe(
            'https://cms-public.example.test/media/map.pdf#page=2',
        );
    });

    it('rebases absolute CMS URLs and preserves crop parameters and fragments', () => {
        const result = new URL(
            imageUrl(
                'http://cms-internal.test/media/a%20b/photo.jpg?crop=0,0,1,1&width=900&height=800&rmode=crop#photo',
                cmsPublicUrl,
                { width: 100, height: 100 },
            ),
        );
        expect(result.origin).toBe('https://cms-public.example.test');
        expect(result.pathname).toBe('/media/a%20b/photo.jpg');
        expect(Object.fromEntries(result.searchParams)).toEqual({
            crop: '0,0,1,1',
            width: '100',
            height: '100',
            rmode: 'crop',
        });
        expect(result.hash).toBe('#photo');
    });

    it('keeps existing queries unchanged when no dimensions are requested', () => {
        expect(
            imageUrl(
                '//cms-internal.test/media/photo.jpg?crop=0,0,1,1&foo=a%20b#photo',
                cmsPublicUrl,
            ),
        ).toBe(
            'https://cms-public.example.test/media/photo.jpg?crop=0,0,1,1&foo=a%20b#photo',
        );
    });

    it('does not retain configuration across calls', () => {
        expect(imageUrl('/media/logo.svg', 'https://cms-a.test/')).toBe(
            'https://cms-a.test/media/logo.svg',
        );
        expect(imageUrl('/media/logo.svg', 'https://cms-b.test/')).toBe(
            'https://cms-b.test/media/logo.svg',
        );
    });

    it('uses the public CMS for OpenGraph images rather than the site or API origin', () => {
        const page = {
            properties: {
                openGraphImage: [
                    {
                        url: 'http://cms-internal.test/media/og.png?crop=center#og',
                    },
                ],
            },
        } as Page;
        const head = buildGenericPageHead({
            page,
            siteUrl: 'https://www.example.test/',
            cmsPublicUrl,
        });

        expect(head.openGraph.image?.url).toBe(
            'https://cms-public.example.test/media/og.png?crop=center&width=1200&height=630#og',
        );
    });
});
