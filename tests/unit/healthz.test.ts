import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../../src/routes/healthz/+server.ts';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('healthz', () => {
    it('returns an uncached success without contacting the CMS', async () => {
        const fetch = vi.fn(() => {
            throw new Error('CMS unavailable');
        });
        vi.stubGlobal('fetch', fetch);

        const response = await GET({} as Parameters<typeof GET>[0]);

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('ok\n');
        expect(response.headers.get('content-type')).toBe(
            'text/plain; charset=utf-8',
        );
        expect(response.headers.get('cache-control')).toBe('no-store');
        expect(response.headers.has('location')).toBe(false);
        expect(fetch).not.toHaveBeenCalled();
    });
});
