import { describe, expect, it, vi } from 'vitest';
import { createCmsJsonFetch } from '#lib/server/cache.ts';

const baseUrl = 'https://cms.methodconf.test';
const contentUrl = `${baseUrl}/umbraco/delivery/api/v2/content?filter=contentType%3Aconference`;
type Reply = Response | Error | Promise<Response>;

function json(value: number, status = 200, headers?: HeadersInit) {
    return Response.json({ value }, { status, headers });
}

function mockFetch(replies: Reply[]) {
    const requests: Request[] = [];
    const fetch: typeof globalThis.fetch = async (input, init) => {
        requests.push(
            input instanceof Request ? input : new Request(input, init),
        );
        const reply = replies.shift();
        if (!reply) throw new Error('No mock reply');
        if (reply instanceof Error) throw reply;
        return await reply;
    };
    return { fetch, requests };
}

async function value(response: Response) {
    return (await response.json()).value as number;
}

function deferred() {
    let resolve!: (response: Response) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<Response>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function failure(kind: string): Reply {
    if (kind === '5xx') return json(503, 503);
    if (kind === 'network') return new Error('cms offline');
    return new Response('{invalid');
}

// Only leak and capacity tests observe maps. Neither depends on their order.
function observedCache(options: Parameters<typeof createCmsJsonFetch>[0]) {
    const NativeMap = globalThis.Map;
    const maps: ObservedMap<unknown, unknown>[] = [];
    class ObservedMap<K, V> extends NativeMap<K, V> {
        peakSize = 0;
        constructor() {
            super();
            maps.push(this);
        }
        override set(key: K, value: V): this {
            super.set(key, value);
            this.peakSize = Math.max(this.peakSize, this.size);
            return this;
        }
    }
    vi.stubGlobal('Map', ObservedMap);
    try {
        return { cachedFetch: createCmsJsonFetch(options), maps };
    } finally {
        vi.unstubAllGlobals();
    }
}

describe('CMS JSON cache', () => {
    it.each(['5xx', 'network', 'malformed JSON'])(
        'cleans up cold %s failures and allows a retry',
        async (kind) => {
            const { fetch, requests } = mockFetch([
                ...Array.from({ length: 12 }, () => failure(kind)),
                json(1),
            ]);
            const { cachedFetch, maps } = observedCache({
                baseUrl,
                fetch,
                maxEntries: 2,
            });
            expect(maps).toHaveLength(2);
            for (let key = 0; key < 12; key++) {
                const result = cachedFetch(`${contentUrl}&key=${key}`);
                if (kind === '5xx') expect((await result).status).toBe(503);
                else await expect(result).rejects.toThrow();
                expect(maps.every((map) => map.size === 0)).toBe(true);
            }
            for (let call = 0; call < 2; call++) {
                expect(
                    await value(await cachedFetch(`${contentUrl}&key=0`)),
                ).toBe(1);
            }
            expect(requests).toHaveLength(13);
            expect(maps.map((map) => map.size).sort()).toEqual([0, 1]);
        },
    );

    it('bounds both maps while hung requests and excess failures overlap', async () => {
        const firstReply = deferred();
        const secondReply = deferred();
        const { fetch, requests } = mockFetch([
            firstReply.promise,
            secondReply.promise,
            ...Array.from({ length: 12 }, (_, index) =>
                failure(['5xx', 'network', 'malformed JSON'][index % 3]),
            ),
            json(3),
        ]);
        const { cachedFetch, maps } = observedCache({
            baseUrl,
            fetch,
            maxEntries: 2,
        });
        expect(maps).toHaveLength(2);
        const first = cachedFetch(`${contentUrl}&key=first`);
        const second = cachedFetch(`${contentUrl}&key=second`);
        const excess = await Promise.allSettled(
            Array.from({ length: 12 }, (_, key) =>
                cachedFetch(`${contentUrl}&key=${key}`).then(value),
            ),
        );
        expect(
            excess.filter((result) => result.status === 'rejected'),
        ).toHaveLength(8);
        expect(maps.map((map) => map.size).sort()).toEqual([0, 2]);
        const joined = cachedFetch(`${contentUrl}&key=first`);
        expect(requests).toHaveLength(14);
        firstReply.resolve(json(1));
        secondReply.resolve(json(2));
        expect(await value(await first)).toBe(1);
        expect(await value(await joined)).toBe(1);
        expect(await value(await second)).toBe(2);
        expect(await value(await cachedFetch(`${contentUrl}&key=0`))).toBe(3);
        expect(maps.map((map) => map.size).sort()).toEqual([0, 2]);
        expect(maps.every((map) => map.peakSize <= 2)).toBe(true);
    });

    it('coalesces refresh callers after the completed response is evicted', async () => {
        let now = 0;
        const refresh = deferred();
        const { fetch, requests } = mockFetch([
            json(1),
            refresh.promise,
            json(2),
            json(3),
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
            maxEntries: 2,
        });
        await cachedFetch(contentUrl);
        now = 61_000;
        expect(await value(await cachedFetch(contentUrl))).toBe(1);
        await cachedFetch(`${contentUrl}&key=second`);
        await cachedFetch(`${contentUrl}&key=third`);
        const first = cachedFetch(contentUrl);
        const second = cachedFetch(contentUrl);
        expect(requests).toHaveLength(4);
        refresh.resolve(json(4));
        expect(await value(await first)).toBe(4);
        expect(await value(await second)).toBe(4);
        expect(await value(await cachedFetch(contentUrl))).toBe(4);
        expect(requests).toHaveLength(4);
    });

    it.each(['success', 'private', '404'])(
        'an old saturation bypass %s cannot change a newer cached response',
        async (outcome) => {
            const pinnedReply = deferred();
            const oldReply = deferred();
            const { fetch, requests } = mockFetch([
                pinnedReply.promise,
                oldReply.promise,
                json(2),
            ]);
            const cachedFetch = createCmsJsonFetch({
                baseUrl,
                fetch,
                maxEntries: 1,
            });
            const pinned = cachedFetch(`${contentUrl}&key=pinned`);
            const old = cachedFetch(contentUrl);
            pinnedReply.resolve(json(1));
            await pinned;
            expect(await value(await cachedFetch(contentUrl))).toBe(2);
            oldReply.resolve(
                json(
                    99,
                    outcome === '404' ? 404 : 200,
                    outcome === 'private'
                        ? { 'cache-control': 'private' }
                        : undefined,
                ),
            );
            expect(await value(await old)).toBe(99);
            expect(await value(await cachedFetch(contentUrl))).toBe(2);
            expect(requests).toHaveLength(3);
        },
    );

    it('serves fresh detached bodies, then stale data until a refresh completes', async () => {
        let now = 0;
        const refresh = deferred();
        const { fetch, requests } = mockFetch([
            Response.json({ nested: { count: 1 } }),
            refresh.promise,
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });
        const first = await (await cachedFetch(contentUrl)).json();
        first.nested.count = 99;
        now = 60_000;
        expect(await (await cachedFetch(contentUrl)).json()).toEqual({
            nested: { count: 1 },
        });
        expect(requests).toHaveLength(1);
        now++;
        expect(await (await cachedFetch(contentUrl)).json()).toEqual({
            nested: { count: 1 },
        });
        expect(requests).toHaveLength(2);
        refresh.resolve(json(2));
        await vi.waitFor(async () =>
            expect(await value(await cachedFetch(contentUrl))).toBe(2),
        );
        expect(requests).toHaveLength(2);
    });

    it('retains stale data after a network refresh failure and retries', async () => {
        let now = 0;
        const refresh = deferred();
        const { fetch, requests } = mockFetch([
            json(1),
            new Error('cms offline'),
            refresh.promise,
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });
        await cachedFetch(contentUrl);
        now = 61_000;
        expect(await value(await cachedFetch(contentUrl))).toBe(1);
        await vi.waitFor(async () => {
            expect(await value(await cachedFetch(contentUrl))).toBe(1);
            expect(requests).toHaveLength(3);
        });
        refresh.resolve(json(2));
        await vi.waitFor(async () =>
            expect(await value(await cachedFetch(contentUrl))).toBe(2),
        );
        expect(requests).toHaveLength(3);
    });

    it('stops serving stale data past hard age even when the pending refresh fails', async () => {
        let now = 0;
        const refresh = deferred();
        const { fetch, requests } = mockFetch([
            json(1),
            refresh.promise,
            json(2),
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });
        await cachedFetch(contentUrl);
        now = 60_001;
        await cachedFetch(contentUrl);
        now = 300_000;
        expect(await value(await cachedFetch(contentUrl))).toBe(1);
        now++;
        const expired = cachedFetch(contentUrl);
        const rejected = expect(expired).rejects.toThrow('cms offline');
        expect(requests).toHaveLength(2);
        refresh.reject(new Error('cms offline'));
        await rejected;
        expect(await value(await cachedFetch(contentUrl))).toBe(2);
        expect(requests).toHaveLength(3);
    });

    it('isolates shared caller aborts but forwards the overflow caller signal', async () => {
        const sharedReply = deferred();
        const overflowReply = deferred();
        const { fetch, requests } = mockFetch([
            sharedReply.promise,
            overflowReply.promise,
            json(3),
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            maxEntries: 1,
        });
        const controller = new AbortController();
        const first = cachedFetch(contentUrl, { signal: controller.signal });
        const rejected = expect(first).rejects.toThrow('caller left');
        const overflowController = new AbortController();
        const overflow = cachedFetch(`${contentUrl}&key=overflow`, {
            signal: overflowController.signal,
        });
        const joined = cachedFetch(contentUrl);
        controller.abort(new DOMException('caller left', 'AbortError'));
        overflowController.abort();
        await rejected;
        expect(requests).toHaveLength(2);
        expect(requests[0].signal.aborted).toBe(false);
        expect(requests[1].signal.aborted).toBe(true);
        // Even if upstream ignores the overflow abort, its reply cannot be cached.
        overflowReply.resolve(json(99));
        await overflow;
        sharedReply.resolve(json(1));
        expect(await value(await joined)).toBe(1);
        expect(await value(await cachedFetch(contentUrl))).toBe(1);
        expect(
            await value(await cachedFetch(`${contentUrl}&key=overflow`)),
        ).toBe(3);
        expect(requests).toHaveLength(3);
    });

    it('retains separate cached representations for accept and language headers', async () => {
        const { fetch, requests } = mockFetch([json(1), json(2), json(3)]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
        const representations = [
            { accept: 'application/json', 'accept-language': 'en' },
            { accept: 'application/vnd.api+json', 'accept-language': 'en' },
            { accept: 'application/json', 'accept-language': 'fr' },
        ];
        for (let pass = 0; pass < 2; pass++) {
            for (const [index, headers] of representations.entries()) {
                expect(
                    await value(await cachedFetch(contentUrl, { headers })),
                ).toBe(index + 1);
            }
        }
        expect(requests).toHaveLength(3);
    });

    it.each<[string, string, RequestInit?]>([
        [
            'authorization',
            contentUrl,
            { headers: { authorization: 'Bearer token' } },
        ],
        ['cookie', contentUrl, { headers: { cookie: 'preview=true' } }],
        ['preview', contentUrl, { headers: { 'x-umbraco-preview': 'true' } }],
        ['no-store', contentUrl, { cache: 'no-store' }],
        [
            'private request',
            contentUrl,
            { headers: { 'cache-control': 'private' } },
        ],
        ['POST', contentUrl, { method: 'POST', body: '{}' }],
        ['media', `${baseUrl}/media/file.pdf`],
        ['non-allowlisted', `${baseUrl}/api/other`],
        ['other origin', contentUrl.replace(baseUrl, 'https://other.test')],
    ])('bypasses %s requests on both calls', async (_, url, init) => {
        const { fetch, requests } = mockFetch([json(1), json(2)]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
        expect(await value(await cachedFetch(url, init))).toBe(1);
        expect(await value(await cachedFetch(url, init))).toBe(2);
        expect(requests).toHaveLength(2);
    });

    it.each(['private', 'no-store', 'no-cache', 'set-cookie'])(
        'does not cache a %s response',
        async (header) => {
            const headers: HeadersInit =
                header === 'set-cookie'
                    ? { 'set-cookie': 'preview=true' }
                    : { 'cache-control': header };
            const { fetch, requests } = mockFetch([
                json(1, 200, headers),
                json(2),
            ]);
            const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
            const first = await cachedFetch(contentUrl);
            if (header === 'set-cookie') {
                expect(first.headers.get(header)).toBe('preview=true');
            }
            expect(await value(first)).toBe(1);
            expect(await value(await cachedFetch(contentUrl))).toBe(2);
            expect(requests).toHaveLength(2);
        },
    );

    it.each(['private', '404'])(
        'evicts stale public data after an authoritative %s refresh',
        async (outcome) => {
            let now = 0;
            const refresh = deferred();
            const { fetch, requests } = mockFetch([
                json(1),
                refresh.promise,
                json(3),
            ]);
            const cachedFetch = createCmsJsonFetch({
                baseUrl,
                fetch,
                now: () => now,
            });
            await cachedFetch(contentUrl);
            now = 61_000;
            expect(await value(await cachedFetch(contentUrl))).toBe(1);
            refresh.resolve(
                json(
                    2,
                    outcome === '404' ? 404 : 200,
                    outcome === 'private'
                        ? { 'cache-control': 'private' }
                        : undefined,
                ),
            );
            await vi.waitFor(async () =>
                expect(await value(await cachedFetch(contentUrl))).toBe(3),
            );
            expect(requests).toHaveLength(3);
        },
    );

    it('bypasses caching with zero capacity', async () => {
        const { fetch, requests } = mockFetch([json(1), json(2)]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            maxEntries: 0,
        });
        expect(await value(await cachedFetch(contentUrl))).toBe(1);
        expect(await value(await cachedFetch(contentUrl))).toBe(2);
        expect(requests).toHaveLength(2);
    });
});
