import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { optimizeImageBuffer } from '../../src/lib/server/imageOptimizer.ts';

async function rgba(bytes: Uint8Array) {
    const { data, info } = await sharp(bytes)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return {
        data: new Uint8Array(data),
        width: info.width,
        height: info.height,
    };
}

async function fixturePng() {
    return sharp({
        create: {
            width: 20,
            height: 10,
            channels: 3,
            background: { r: 40, g: 90, b: 140 },
        },
    })
        .png()
        .toBuffer();
}

describe('image optimizer transform', () => {
    it('matches the expected Sharp WebP transform at decoded RGBA level', async () => {
        const input = await sharp(await fixturePng())
            .jpeg({ quality: 92 })
            .toBuffer();
        const optimized = await optimizeImageBuffer({
            input,
            width: 32,
            quality: 75,
            upstreamContentType: 'image/jpeg',
            accept: 'image/webp,image/apng,*/*',
        });
        const expected = await sharp(input, {
            limitInputPixels: 40_000_000,
            sequentialRead: true,
        })
            .rotate()
            .resize(32, undefined, { withoutEnlargement: true })
            .webp({ quality: 75 })
            .toBuffer();

        expect(optimized.contentType).toBe('image/webp');
        expect(await rgba(optimized.bytes)).toEqual(await rgba(expected));
    });

    it('does not enlarge natural dimensions and keeps PNG when WebP is not accepted', async () => {
        const input = await fixturePng();
        const optimized = await optimizeImageBuffer({
            input,
            width: 128,
            quality: 100,
            upstreamContentType: 'image/png',
            accept: 'image/png,*/*',
        });
        const metadata = await sharp(optimized.bytes).metadata();

        expect(optimized.contentType).toBe('image/png');
        expect(metadata.width).toBe(20);
        expect(metadata.height).toBe(10);
    });

    it.each([
        ['image/webp,image/apng,*/*', 'image/webp'],
        ['image/webp;level=1;q=0.5,image/jpeg', 'image/webp'],
        ['image/webp;q=0,image/jpeg,*/*;q=.8', 'image/jpeg'],
        ['image/*,*/*', 'image/jpeg'],
        ['*/*', 'image/jpeg'],
        ['', 'image/jpeg'],
        ['IMAGE/WEBP,image/jpeg', 'image/jpeg'],
    ])('negotiates %s as %s', async (accept, contentType) => {
        const optimized = await optimizeImageBuffer({
            input: await fixturePng(),
            width: 32,
            quality: 75,
            upstreamContentType: 'image/jpeg',
            accept,
        });

        expect(optimized.contentType).toBe(contentType);
    });
});
