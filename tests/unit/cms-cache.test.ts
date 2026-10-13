import { describe, expect, it, vi } from 'vitest';
import { createCmsJsonFetch } from '#lib/server/cache.ts';

type MockReply =
    | { status?: number; body: unknown; headers?: HeadersInit }
    | Error
    | (() => Promise<Response>);

const baseUrl = 'https://cms.methodconf.test';
const contentUrl = `${baseUrl}/umbraco/delivery/api/v2/content?filter=contentType%3Aconference`;

function jsonResponse(body: unknown, status = 200, headers: HeadersInit = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json', ...headers },
    });
}

function createMockFetch(replies: MockReply[]) {
    const requests: Request[] = [];

    const fetch: typeof globalThis.fetch = async (input, init) => {
        const request =
            input instanceof Request ? input : new Request(input, init);
        requests.push(request.clone());
        const reply = replies.shift();

        if (!reply) {
            throw new Error(
                `No mock reply for ${request.method} ${request.url}`,
            );
        }

        if (reply instanceof Error) {
            throw reply;
        }

        if (typeof reply === 'function') {
            return await reply();
        }

        return jsonResponse(reply.body, reply.status, reply.headers);
    };

    return { fetch, requests };
}

async function readJson(response: Response) {
    return (await response.json()) as {
        value: number;
        nested?: { count: number };
    };
}

function deferredResponse() {
    let resolve!: (response: Response) => void;
    let reject!: (error: unknown) => void;
    const promise = new Promise<Response>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

// Capture only the maps constructed by the cache, then restore the global
// before any requests run. Keep observing writes without a production test API.
function createObservedCache(
    options: Parameters<typeof createCmsJsonFetch>[0],
) {
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
    let cachedFetch: typeof fetch;
    try {
        cachedFetch = createCmsJsonFetch(options);
    } finally {
        vi.unstubAllGlobals();
    }
    expect(maps).toHaveLength(2);
    return { cachedFetch, maps };
}

describe('CMS JSON cache', () => {
    it.each(['5xx', 'network', 'malformed JSON'])(
        'cleans up unique cold %s failures and allows a retry',
        async (failure) => {
            const failedReply: MockReply =
                failure === '5xx'
                    ? { status: 503, body: { value: 503 } }
                    : failure === 'network'
                      ? new Error('cms offline')
                      : async () => new Response('{invalid');
            const { fetch, requests } = createMockFetch([
                ...Array<MockReply>(12).fill(failedReply),
                { body: { value: 1 } },
            ]);
            const { cachedFetch, maps } = createObservedCache({
                baseUrl,
                fetch,
                maxEntries: 2,
            });

            for (let key = 0; key < 12; key += 1) {
                const result = cachedFetch(`${contentUrl}&key=${key}`);
                if (failure === '5xx') {
                    expect((await result).status).toBe(503);
                } else {
                    await expect(result).rejects.toThrow();
                }
                expect(maps.map((map) => map.size)).toEqual([0, 0]);
            }

            expect(
                await readJson(await cachedFetch(`${contentUrl}&key=0`)),
            ).toEqual({ value: 1 });
            expect(
                await readJson(await cachedFetch(`${contentUrl}&key=0`)),
            ).toEqual({ value: 1 });
            expect(requests).toHaveLength(13);
            expect(maps.map((map) => map.size)).toEqual([1, 0]);
            expect(maps.every((map) => map.peakSize <= 2)).toBe(true);
        },
    );

    it.each(['5xx', 'network', 'malformed JSON'])(
        'retains stale data within max age after a %s refresh failure',
        async (failure) => {
            let now = 0;
            const failedReply: MockReply =
                failure === '5xx'
                    ? { status: 503, body: { value: 503 } }
                    : failure === 'network'
                      ? new Error('cms offline')
                      : async () => new Response('{invalid');
            const refresh = deferredResponse();
            const { fetch, requests } = createMockFetch([
                { body: { value: 1 } },
                failedReply,
                () => refresh.promise,
            ]);
            const { cachedFetch, maps } = createObservedCache({
                baseUrl,
                fetch,
                now: () => now,
            });
            await cachedFetch(contentUrl);
            now = 61_000;
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 1,
            });
            await Promise.all(maps[1].values());
            expect(maps.map((map) => map.size)).toEqual([1, 0]);

            now = 62_000;
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 1,
            });
            expect(requests).toHaveLength(3);
            refresh.resolve(jsonResponse({ value: 2 }));
            await Promise.all(maps[1].values());
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 2,
            });
        },
    );

    it.each(['5xx', 'network', 'malformed JSON'])(
        'stops serving stale data at the hard age during a pending %s refresh',
        async (failure) => {
            let now = 0;
            const refresh = deferredResponse();
            const { fetch, requests } = createMockFetch([
                { body: { value: 1 } },
                () => refresh.promise,
                { body: { value: 2 } },
            ]);
            const { cachedFetch, maps } = createObservedCache({
                baseUrl,
                fetch,
                now: () => now,
            });
            await cachedFetch(contentUrl);
            now = 60_000;
            await cachedFetch(contentUrl);
            expect(requests).toHaveLength(1);
            now = 60_001;
            await cachedFetch(contentUrl);
            now = 300_000;
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 1,
            });
            now = 300_001;
            const expired = cachedFetch(contentUrl);
            expect(maps.map((map) => map.size)).toEqual([0, 1]);
            expect(requests).toHaveLength(2);
            if (failure === 'network') {
                const rejected = expect(expired).rejects.toThrow('cms offline');
                refresh.reject(new Error('cms offline'));
                await rejected;
            } else if (failure === 'malformed JSON') {
                const rejected = expect(expired).rejects.toThrow();
                refresh.resolve(new Response('{invalid'));
                await rejected;
            } else {
                refresh.resolve(jsonResponse({ value: 503 }, 503));
                expect((await expired).status).toBe(503);
            }
            expect(maps.map((map) => map.size)).toEqual([0, 0]);
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 2,
            });
            expect(requests).toHaveLength(3);
        },
    );

    it('bounds active tracking while hung requests and excess failures overlap', async () => {
        const firstReply = deferredResponse();
        const secondReply = deferredResponse();
        const { fetch, requests } = createMockFetch([
            () => firstReply.promise,
            () => secondReply.promise,
            ...Array.from({ length: 12 }, (_, index): MockReply => {
                if (index % 3 === 0) {
                    return { status: 503, body: { value: 503 } };
                }
                if (index % 3 === 1) {
                    return new Error('cms offline');
                }
                return async () => new Response('{invalid');
            }),
            { body: { value: 3 } },
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            maxEntries: 2,
        });
        const first = cachedFetch(`${contentUrl}&key=first`);
        const second = cachedFetch(`${contentUrl}&key=second`);
        const excess = Array.from({ length: 12 }, (_, key) =>
            cachedFetch(`${contentUrl}&key=${key}`).then(readJson),
        );
        const results = await Promise.allSettled(excess);
        expect(
            results.filter((result) => result.status === 'rejected'),
        ).toHaveLength(8);
        expect(maps.map((map) => map.size)).toEqual([0, 2]);
        expect(maps.every((map) => map.peakSize <= 2)).toBe(true);

        const coalesced = cachedFetch(`${contentUrl}&key=first`);
        expect(requests).toHaveLength(14);
        firstReply.resolve(jsonResponse({ value: 1 }));
        secondReply.resolve(jsonResponse({ value: 2 }));
        expect(await readJson(await first)).toEqual({ value: 1 });
        expect(await readJson(await coalesced)).toEqual({ value: 1 });
        expect(await readJson(await second)).toEqual({ value: 2 });
        expect(maps.map((map) => map.size)).toEqual([2, 0]);

        expect(
            await readJson(await cachedFetch(`${contentUrl}&key=0`)),
        ).toEqual({ value: 3 });
        expect(maps.map((map) => map.size)).toEqual([2, 0]);
        expect(maps.every((map) => map.peakSize <= 2)).toBe(true);
    });

    it('coalesces refresh callers after the completed response is evicted', async () => {
        let now = 0;
        const refresh = deferredResponse();
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            () => refresh.promise,
            { body: { value: 2 } },
            { body: { value: 3 } },
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            now: () => now,
            maxEntries: 2,
        });
        await cachedFetch(contentUrl);
        now = 61_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        await cachedFetch(`${contentUrl}&key=second`);
        await cachedFetch(`${contentUrl}&key=third`);
        expect(maps.map((map) => map.size)).toEqual([2, 1]);
        expect(
            [...maps[0].keys()].every((key) => String(key).includes('&key=')),
        ).toBe(true);
        const first = cachedFetch(contentUrl);
        const second = cachedFetch(contentUrl);
        expect(requests).toHaveLength(4);

        refresh.resolve(jsonResponse({ value: 4 }));
        expect(await readJson(await first)).toEqual({ value: 4 });
        expect(await readJson(await second)).toEqual({ value: 4 });
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 4,
        });
        expect(requests).toHaveLength(4);
        expect(maps.every((map) => map.peakSize <= 2)).toBe(true);
    });

    it.each(['network', '5xx', '404', 'private', 'malformed JSON', 'success'])(
        'an old untracked %s outcome cannot alter a newer cached response',
        async (outcome) => {
            const pinnedReply = deferredResponse();
            const oldReply = deferredResponse();
            const { fetch, requests } = createMockFetch([
                () => pinnedReply.promise,
                () => oldReply.promise,
                { body: { value: 2 } },
            ]);
            const { cachedFetch, maps } = createObservedCache({
                baseUrl,
                fetch,
                maxEntries: 1,
            });
            const pinned = cachedFetch(`${contentUrl}&key=pinned`);
            const old = cachedFetch(contentUrl).then(
                (response) => ({ response }),
                (error: unknown) => ({ error }),
            );
            expect(maps.map((map) => map.size)).toEqual([0, 1]);
            pinnedReply.resolve(jsonResponse({ value: 1 }));
            await pinned;
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 2,
            });

            if (outcome === 'network') {
                oldReply.reject(new Error('old failure'));
            } else if (outcome === 'malformed JSON') {
                oldReply.resolve(new Response('{invalid'));
            } else {
                oldReply.resolve(
                    jsonResponse(
                        { value: 99 },
                        outcome === '5xx' ? 503 : outcome === '404' ? 404 : 200,
                        outcome === 'private'
                            ? {
                                  'cache-control': 'private',
                                  'set-cookie': 'a=1',
                              }
                            : {},
                    ),
                );
            }
            const result = await old;
            if (outcome === 'network') {
                expect(result).toEqual({ error: new Error('old failure') });
            } else {
                expect(result).toHaveProperty('response');
            }
            expect(await readJson(await cachedFetch(contentUrl))).toEqual({
                value: 2,
            });
            expect(requests).toHaveLength(3);
            expect(maps.map((map) => map.size)).toEqual([1, 0]);
            expect(maps.every((map) => map.peakSize <= 1)).toBe(true);
        },
    );

    it.each(['network', 'private'])(
        'an old untracked %s outcome cannot remove newer active tracking',
        async (outcome) => {
            const pinnedReply = deferredResponse();
            const oldReply = deferredResponse();
            const newReply = deferredResponse();
            const { fetch, requests } = createMockFetch([
                () => pinnedReply.promise,
                () => oldReply.promise,
                () => newReply.promise,
            ]);
            const { cachedFetch, maps } = createObservedCache({
                baseUrl,
                fetch,
                maxEntries: 1,
            });
            const pinned = cachedFetch(`${contentUrl}&key=pinned`);
            const old = cachedFetch(contentUrl).catch(() => undefined);
            pinnedReply.resolve(jsonResponse({ value: 1 }));
            await pinned;
            const newer = cachedFetch(contentUrl);
            if (outcome === 'network') {
                oldReply.reject(new Error('old failure'));
            } else {
                oldReply.resolve(
                    jsonResponse({ value: 99 }, 200, {
                        'cache-control': 'private',
                    }),
                );
            }
            await old;
            expect(maps[1].size).toBe(1);
            const joined = cachedFetch(contentUrl);
            expect(requests).toHaveLength(3);
            newReply.resolve(jsonResponse({ value: 2 }));
            expect(await readJson(await newer)).toEqual({ value: 2 });
            expect(await readJson(await joined)).toEqual({ value: 2 });
            expect(maps.map((map) => map.size)).toEqual([1, 0]);
        },
    );

    it('serves stale data without starting excess refreshes at active capacity', async () => {
        let now = 0;
        const hungReply = deferredResponse();
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            () => hungReply.promise,
            { body: { value: 2 } },
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            now: () => now,
            maxEntries: 1,
        });
        await cachedFetch(contentUrl);
        const hung = cachedFetch(`${contentUrl}&key=hung`);
        now = 61_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(requests).toHaveLength(2);
        expect(maps.map((map) => map.size)).toEqual([1, 1]);
        now = 301_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 2,
        });
        expect(maps.map((map) => map.size)).toEqual([0, 1]);
        hungReply.resolve(jsonResponse({ value: 3 }));
        await hung;
        expect(maps.every((map) => map.peakSize <= 1)).toBe(true);
    });

    it('resumes stale refreshes after a saturated active request fails', async () => {
        let now = 0;
        const hungReply = deferredResponse();
        const refreshReply = deferredResponse();
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            () => hungReply.promise,
            () => refreshReply.promise,
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            now: () => now,
            maxEntries: 1,
        });
        await cachedFetch(contentUrl);
        const hung = cachedFetch(`${contentUrl}&key=hung`);
        const rejected = expect(hung).rejects.toThrow('cms offline');
        now = 61_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(requests).toHaveLength(2);
        hungReply.reject(new Error('cms offline'));
        await rejected;
        expect(maps.map((map) => map.size)).toEqual([1, 0]);
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(requests).toHaveLength(3);
        refreshReply.resolve(jsonResponse({ value: 2 }));
        await Promise.all(maps[1].values());
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 2,
        });
        expect(maps.every((map) => map.peakSize <= 1)).toBe(true);
    });

    it('bypasses caching entirely with zero capacity', async () => {
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { body: { value: 2 } },
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            maxEntries: 0,
        });
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 2,
        });
        expect(requests).toHaveLength(2);
        expect(maps.every((map) => map.peakSize === 0)).toBe(true);
    });

    it('isolates caller aborts while active tracking is at capacity', async () => {
        const sharedReply = deferredResponse();
        const excessReply = deferredResponse();
        const { fetch, requests } = createMockFetch([
            () => sharedReply.promise,
            () => excessReply.promise,
            { body: { value: 3 } },
        ]);
        const { cachedFetch, maps } = createObservedCache({
            baseUrl,
            fetch,
            maxEntries: 1,
        });
        const controller = new AbortController();
        const first = cachedFetch(contentUrl, { signal: controller.signal });
        const firstRejected = expect(first).rejects.toThrow('caller left');
        const excessController = new AbortController();
        const excess = cachedFetch(`${contentUrl}&key=excess`, {
            signal: excessController.signal,
        });
        const joined = cachedFetch(contentUrl);
        controller.abort(new DOMException('caller left', 'AbortError'));
        excessController.abort();
        await firstRejected;
        expect(requests).toHaveLength(2);
        expect(requests[0].signal.aborted).toBe(false);
        expect(requests[1].signal.aborted).toBe(true);
        expect(maps.map((map) => map.size)).toEqual([0, 1]);

        // The mock deliberately ignores the excess caller's abort. Even this
        // late success must not populate the cache or cancel the shared fetch.
        excessReply.resolve(jsonResponse({ value: 99 }));
        await excess;
        expect(maps.map((map) => map.size)).toEqual([0, 1]);
        sharedReply.resolve(jsonResponse({ value: 1 }));
        expect(await readJson(await joined)).toEqual({ value: 1 });
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        expect(
            await readJson(await cachedFetch(`${contentUrl}&key=excess`)),
        ).toEqual({ value: 3 });
        expect(requests).toHaveLength(3);
        expect(maps.every((map) => map.peakSize <= 1)).toBe(true);
    });

    it('serves fresh cached JSON as a detached response body', async () => {
        let now = 0;
        const { fetch, requests } = createMockFetch([
            { body: { value: 1, nested: { count: 1 } } },
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });

        const first = await readJson(await cachedFetch(contentUrl));
        first.nested!.count = 99;
        now += 30_000;
        const second = await readJson(await cachedFetch(contentUrl));

        expect(requests).toHaveLength(1);
        expect(second).toEqual({ value: 1, nested: { count: 1 } });
    });

    it('returns stale data during stale-while-revalidate, then uses the refreshed value', async () => {
        let now = 0;
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { body: { value: 2 } },
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        now += 61_000;

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        await Promise.resolve();
        await Promise.resolve();

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 2,
        });
        expect(requests).toHaveLength(2);
    });

    it('coalesces cold requests for the same cache key', async () => {
        let resolveResponse: (response: Response) => void = () => undefined;
        const firstReply = new Promise<Response>((resolve) => {
            resolveResponse = resolve;
        });
        const { fetch, requests } = createMockFetch([() => firstReply]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });

        const first = cachedFetch(contentUrl);
        const second = cachedFetch(contentUrl);
        resolveResponse(jsonResponse({ value: 1 }));

        await expect(readJson(await first)).resolves.toEqual({ value: 1 });
        await expect(readJson(await second)).resolves.toEqual({ value: 1 });
        expect(requests).toHaveLength(1);
    });

    it('does not serve data past the hard max age when refresh fails', async () => {
        let now = 0;
        const { fetch } = createMockFetch([
            { body: { value: 1 } },
            new Error('cms offline'),
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });

        await cachedFetch(contentUrl);
        now += 301_000;

        await expect(cachedFetch(contentUrl)).rejects.toThrow('cms offline');
    });

    it('keeps cache entries bounded and isolates representation headers', async () => {
        let now = 0;
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { body: { value: 2 } },
            { body: { value: 3 } },
            { body: { value: 4 } },
            { body: { value: 5 } },
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
            maxEntries: 1,
        });

        expect(
            await readJson(
                await cachedFetch(
                    `${baseUrl}/umbraco/delivery/api/v2/content?take=1`,
                ),
            ),
        ).toEqual({ value: 1 });
        expect(
            await readJson(
                await cachedFetch(
                    `${baseUrl}/umbraco/delivery/api/v2/content?take=2`,
                ),
            ),
        ).toEqual({ value: 2 });
        expect(
            await readJson(
                await cachedFetch(
                    `${baseUrl}/umbraco/delivery/api/v2/content?take=1`,
                ),
            ),
        ).toEqual({ value: 3 });

        now += 1;
        await cachedFetch(contentUrl, {
            headers: { accept: 'application/json' },
        });
        await cachedFetch(contentUrl, {
            headers: { accept: 'application/vnd.api+json' },
        });

        expect(requests).toHaveLength(5);
    });

    it('retains separate cached representations for accept and language headers', async () => {
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { body: { value: 2 } },
            { body: { value: 3 } },
        ]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
        const representations = [
            { accept: 'application/json', 'accept-language': 'en' },
            { accept: 'application/vnd.api+json', 'accept-language': 'en' },
            { accept: 'application/json', 'accept-language': 'fr' },
        ];
        for (let pass = 0; pass < 2; pass += 1) {
            for (const [index, headers] of representations.entries()) {
                expect(
                    await readJson(await cachedFetch(contentUrl, { headers })),
                ).toEqual({ value: index + 1 });
            }
        }
        expect(requests).toHaveLength(3);
    });

    it('bypasses auth, preview, no-store, non-GET, media, and non-allowlisted requests', async () => {
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { body: { value: 2 } },
            { body: { value: 3 } },
            { body: { value: 4 } },
            { body: { value: 5 } },
            { body: { value: 6 } },
        ]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });

        await cachedFetch(contentUrl, {
            headers: { authorization: 'Bearer token' },
        });
        await cachedFetch(contentUrl, { headers: { cookie: 'preview=true' } });
        await cachedFetch(contentUrl, {
            headers: { 'x-umbraco-preview': 'true' },
        });
        await cachedFetch(new Request(contentUrl, { cache: 'no-store' }));
        await cachedFetch(`${baseUrl}/media/file.pdf`);
        await cachedFetch(contentUrl, { method: 'POST', body: '{}' });

        expect(requests).toHaveLength(6);
        expect(requests.map((request) => request.method)).toEqual([
            'GET',
            'GET',
            'GET',
            'GET',
            'GET',
            'POST',
        ]);
    });

    it('keeps the shared upstream request detached from caller aborts', async () => {
        let resolveBody: () => void = () => undefined;
        const body = new Promise<void>((resolve) => {
            resolveBody = resolve;
        });
        const requests: Request[] = [];
        const fetch: typeof globalThis.fetch = async (input, init) => {
            const request =
                input instanceof Request ? input : new Request(input, init);
            requests.push(request.clone());

            if (request.signal.aborted) {
                throw request.signal.reason;
            }

            await Promise.race([
                body,
                new Promise((_, reject) => {
                    request.signal.addEventListener(
                        'abort',
                        () => reject(request.signal.reason),
                        { once: true },
                    );
                }),
            ]);

            return jsonResponse({ value: 1 });
        };
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
        const controller = new AbortController();

        const first = cachedFetch(contentUrl, { signal: controller.signal });
        const second = cachedFetch(contentUrl);
        controller.abort(new DOMException('first caller left', 'AbortError'));
        resolveBody();

        await expect(first).rejects.toThrow(/first caller left|aborted/i);
        await expect(readJson(await second)).resolves.toEqual({ value: 1 });
        expect(requests).toHaveLength(1);
        expect(requests[0].signal.aborted).toBe(false);
    });

    it('does not start a cache request for an already-aborted caller', async () => {
        const { fetch, requests } = createMockFetch([{ body: { value: 1 } }]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });
        const controller = new AbortController();
        controller.abort(new DOMException('gone', 'AbortError'));

        await expect(
            cachedFetch(contentUrl, { signal: controller.signal }),
        ).rejects.toThrow(/gone|aborted/i);
        expect(requests).toHaveLength(0);
    });

    it('passes through private responses and set-cookie without storing them', async () => {
        const { fetch, requests } = createMockFetch([
            {
                body: { value: 1 },
                headers: {
                    'cache-control': 'private, no-store',
                    'set-cookie': 'preview=true; Path=/; HttpOnly',
                },
            },
            {
                body: { value: 2 },
                headers: { 'cache-control': 'no-cache' },
            },
        ]);
        const cachedFetch = createCmsJsonFetch({ baseUrl, fetch });

        const first = await cachedFetch(contentUrl);
        expect(await readJson(first)).toEqual({ value: 1 });
        expect(first.headers.get('set-cookie')).toContain('preview=true');

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 2,
        });
        expect(requests).toHaveLength(2);
    });

    it('evicts stale public data when the refresh becomes private', async () => {
        let now = 0;
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            {
                body: { value: 2 },
                headers: { 'cache-control': 'private, no-store' },
            },
            {
                body: { value: 3 },
                headers: { 'cache-control': 'private, no-store' },
            },
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        now += 61_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        await Promise.resolve();
        await Promise.resolve();

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 3,
        });
        expect(requests).toHaveLength(3);
    });

    it('does not store failed refreshes or keep stale content after an authoritative 404', async () => {
        let now = 0;
        const { fetch, requests } = createMockFetch([
            { body: { value: 1 } },
            { status: 404, body: { value: 404 } },
            { status: 404, body: { value: 404 } },
        ]);
        const cachedFetch = createCmsJsonFetch({
            baseUrl,
            fetch,
            now: () => now,
        });

        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        now += 61_000;
        expect(await readJson(await cachedFetch(contentUrl))).toEqual({
            value: 1,
        });
        await Promise.resolve();
        await Promise.resolve();

        const afterEviction = await cachedFetch(contentUrl);

        expect(afterEviction.status).toBe(404);
        expect(requests).toHaveLength(3);
    });
});
