import { describe, expect, it } from 'vitest';
import {
    buildCmsImageAttributes,
    buildOptimizerUrl,
    nextFixedWidths,
} from '../../src/lib/images/cmsImage.ts';

describe('CmsImage helper', () => {
    it('matches the fixed-width Next 1x/2x rounding', () => {
        expect(nextFixedWidths(100)).toEqual([128, 256]);
        expect(nextFixedWidths(500)).toEqual([640, 1080]);
        expect(nextFixedWidths(1549)).toEqual([1920, 3840]);
    });

    it('uses the last fixed-width candidate as src and preserves attrs', () => {
        const attrs = buildCmsImageAttributes({
            src: '/cms-media/media/a/photo.jpg?width=100&height=100',
            width: 100,
            height: 100,
            alt: 'Gene Gotimer',
            class: 'rounded-full',
            loading: 'lazy',
            decoding: 'async',
        });

        expect(attrs).toMatchObject({
            src: buildOptimizerUrl(
                '/cms-media/media/a/photo.jpg?width=100&height=100',
                256,
                75,
            ),
            width: 100,
            height: 100,
            alt: 'Gene Gotimer',
            class: 'rounded-full',
            loading: 'lazy',
            decoding: 'async',
        });
        expect(attrs.srcset).toBe(
            `${buildOptimizerUrl('/cms-media/media/a/photo.jpg?width=100&height=100', 128, 75)} 1x, ${buildOptimizerUrl('/cms-media/media/a/photo.jpg?width=100&height=100', 256, 75)} 2x`,
        );
    });

    it('deduplicates fixed-width srcset candidates', () => {
        const attrs = buildCmsImageAttributes({
            src: '/cms-media/media/a/logo.png?height=375',
            width: 3840,
            height: 930,
            alt: 'Sponsor',
            quality: 100,
        });

        expect(attrs.srcset).toBe(
            `${buildOptimizerUrl('/cms-media/media/a/logo.png?height=375', 3840, 100)} 1x`,
        );
    });
});
