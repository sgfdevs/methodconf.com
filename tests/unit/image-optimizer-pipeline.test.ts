import { beforeEach, describe, expect, it, vi } from 'vitest';

const sharpMock = vi.hoisted(() => {
    const order: string[] = [];
    const pipeline = {
        timeout: vi.fn(() => {
            order.push('timeout');
            return pipeline;
        }),
        metadata: vi.fn(() => {
            order.push('metadata');
            return Promise.resolve({ pages: 1 });
        }),
        rotate: vi.fn(() => {
            order.push('rotate');
            return pipeline;
        }),
        resize: vi.fn(() => {
            order.push('resize');
            return pipeline;
        }),
        webp: vi.fn(() => {
            order.push('webp');
            return pipeline;
        }),
        jpeg: vi.fn(() => {
            order.push('jpeg');
            return pipeline;
        }),
        png: vi.fn(() => {
            order.push('png');
            return pipeline;
        }),
        toBuffer: vi.fn(() => {
            order.push('toBuffer');
            return Promise.resolve(new Uint8Array([1, 2, 3]));
        }),
    };
    const sharp = vi.fn(() => pipeline);

    return { order, pipeline, sharp };
});

vi.mock('sharp', () => ({
    default: sharpMock.sharp,
}));

import {
    IMAGE_MAX_INPUT_PIXELS,
    IMAGE_SHARP_TIMEOUT_SECONDS,
    optimizeImageBuffer,
} from '../../src/lib/server/imageOptimizer.ts';

beforeEach(() => {
    sharpMock.order.length = 0;
    vi.clearAllMocks();
});

describe('image optimizer Sharp pipeline', () => {
    it('sets the processing timeout before metadata and transforms run', async () => {
        const input = new Uint8Array([10, 20, 30]);
        const optimized = await optimizeImageBuffer({
            input,
            width: 32,
            quality: 75,
            upstreamContentType: 'image/jpeg',
            accept: 'image/webp',
        });

        expect(sharpMock.sharp).toHaveBeenCalledWith(input, {
            limitInputPixels: IMAGE_MAX_INPUT_PIXELS,
            sequentialRead: true,
        });
        expect(sharpMock.pipeline.timeout).toHaveBeenCalledWith({
            seconds: IMAGE_SHARP_TIMEOUT_SECONDS,
        });
        expect(sharpMock.order).toEqual([
            'timeout',
            'metadata',
            'rotate',
            'resize',
            'webp',
            'toBuffer',
        ]);
        expect(optimized).toEqual({
            bytes: new Uint8Array([1, 2, 3]),
            contentType: 'image/webp',
        });
    });
});
