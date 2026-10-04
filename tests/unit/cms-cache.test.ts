import { describe, expect, it } from 'vitest';
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

describe('CMS JSON cache', () => {
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
        await cachedFetch(`${baseUrl}/cms-media/media/file.pdf`);
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
