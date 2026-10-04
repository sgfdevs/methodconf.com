import { describe, expect, it } from 'vitest';
import { buildOveItIframeState } from '#lib/oveit.ts';

describe('OveIt embed URL handling', () => {
    it('passes matching return hash path as next without changing the parent hash', () => {
        const state = buildOveItIframeState(
            'https://tickets.example/embed?id=5b12c452dc&theme=method',
            '#5b12c452dc/order/return',
        );

        expect(state?.embedId).toBe('5b12c452dc');
        expect(state?.iframeUrl.searchParams.get('next')).toBe('order');
        expect(state?.iframeUrl.toString()).toBe(
            'https://tickets.example/embed?id=5b12c452dc&theme=method&next=order',
        );
    });

    it('ignores hashes for a different embed and invalid embed URLs', () => {
        const state = buildOveItIframeState(
            'https://tickets.example/embed?id=current',
            '#other/order/return',
        );

        expect(state?.iframeUrl.searchParams.get('next')).toBeNull();
        expect(
            buildOveItIframeState('not a url', '#current/order'),
        ).toBeUndefined();
    });
});
