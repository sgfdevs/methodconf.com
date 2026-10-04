import { beforeEach, describe, expect, it, vi } from 'vitest';

const privateEnv = vi.hoisted(() => ({
    UMBRACO_BASE_URL: 'https://cms-a.methodconf.test',
    CMS_PUBLIC_URL: 'https://cms-public.methodconf.test',
    SITE_URL: 'https://www.methodconf.test',
    SEARCH_INDEXING_ENABLED: false,
    NEWSLETTER_ENDPOINT: undefined as string | undefined,
    NEWSLETTER_LIST_ID: undefined as string | undefined,
}));

vi.mock('$app/env/private', () => ({
    get UMBRACO_BASE_URL() {
        return privateEnv.UMBRACO_BASE_URL;
    },
    get CMS_PUBLIC_URL() {
        return privateEnv.CMS_PUBLIC_URL;
    },
    get SITE_URL() {
        return privateEnv.SITE_URL;
    },
    get SEARCH_INDEXING_ENABLED() {
        return privateEnv.SEARCH_INDEXING_ENABLED;
    },
    get NEWSLETTER_ENDPOINT() {
        return privateEnv.NEWSLETTER_ENDPOINT;
    },
    get NEWSLETTER_LIST_ID() {
        return privateEnv.NEWSLETTER_LIST_ID;
    },
}));

function resetPrivateEnv(): void {
    privateEnv.UMBRACO_BASE_URL = 'https://cms-a.methodconf.test';
    privateEnv.CMS_PUBLIC_URL = 'https://cms-public.methodconf.test';
    privateEnv.SITE_URL = 'https://www.methodconf.test';
    privateEnv.SEARCH_INDEXING_ENABLED = false;
    privateEnv.NEWSLETTER_ENDPOINT = undefined;
    privateEnv.NEWSLETTER_LIST_ID = undefined;
}

function contentItem(value: number) {
    return {
        id: `item-${value}`,
        contentType: 'conference',
        route: { path: `/item-${value}/` },
        properties: { value },
    };
}

function stubFetch(fetch: typeof globalThis.fetch): void {
    vi.stubGlobal('fetch', fetch);
}

describe('Umbraco helper cache wiring', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        resetPrivateEnv();
    });

    it('reuses the CMS cache across repeated getItemsOrDefault helper calls', async () => {
        const requests: string[] = [];
        stubFetch(async (input, init) => {
            const request =
                input instanceof Request ? input : new Request(input, init);
            requests.push(request.url);
            return Response.json({ total: 0, items: [] });
        });
        const { getItemsOrDefault } =
            await import('#lib/server/umbraco/getItems.ts');

        await getItemsOrDefault({ filter: ['contentType:conference'] });
        await getItemsOrDefault({ filter: ['contentType:conference'] });

        expect(requests).toHaveLength(1);
    });

    it('coalesces simultaneous getItemsOrDefault helper calls', async () => {
        let resolveResponse: (response: Response) => void = () => undefined;
        const firstResponse = new Promise<Response>((resolve) => {
            resolveResponse = resolve;
        });
        const requests: string[] = [];
        stubFetch(async (input, init) => {
            const request =
                input instanceof Request ? input : new Request(input, init);
            requests.push(request.url);
            return await firstResponse;
        });
        const { getItemsOrDefault } =
            await import('#lib/server/umbraco/getItems.ts');

        const first = getItemsOrDefault({ filter: ['contentType:conference'] });
        const second = getItemsOrDefault({
            filter: ['contentType:conference'],
        });
        resolveResponse(Response.json({ total: 0, items: [] }));

        await expect(first).resolves.toEqual({ total: 0, items: [] });
        await expect(second).resolves.toEqual({ total: 0, items: [] });
        expect(requests).toHaveLength(1);
    });

    it('reuses the CMS cache across repeated getItemByPathOrDefault helper calls', async () => {
        const requests: string[] = [];
        stubFetch(async (input, init) => {
            const request =
                input instanceof Request ? input : new Request(input, init);
            requests.push(request.url);
            return Response.json(contentItem(1));
        });
        const { getItemByPathOrDefault } =
            await import('#lib/server/umbraco/getItemByPath.ts');

        await expect(getItemByPathOrDefault('/2024/')).resolves.toEqual(
            contentItem(1),
        );
        await expect(getItemByPathOrDefault('/2024/')).resolves.toEqual(
            contentItem(1),
        );

        expect(requests).toHaveLength(1);
    });

    it('keeps helper caches isolated by runtime Umbraco base URL', async () => {
        const requests: string[] = [];
        stubFetch(async (input, init) => {
            const request =
                input instanceof Request ? input : new Request(input, init);
            requests.push(request.url);
            return Response.json({
                total: 1,
                items: [contentItem(request.url.includes('cms-a') ? 1 : 2)],
            });
        });
        const { getItemsOrDefault } =
            await import('#lib/server/umbraco/getItems.ts');

        await expect(
            getItemsOrDefault({ filter: ['contentType:conference'] }),
        ).resolves.toEqual({
            total: 1,
            items: [contentItem(1)],
        });

        privateEnv.UMBRACO_BASE_URL = 'https://cms-b.methodconf.test';
        await expect(
            getItemsOrDefault({ filter: ['contentType:conference'] }),
        ).resolves.toEqual({
            total: 1,
            items: [contentItem(2)],
        });

        privateEnv.UMBRACO_BASE_URL = 'https://cms-a.methodconf.test';
        await expect(
            getItemsOrDefault({ filter: ['contentType:conference'] }),
        ).resolves.toEqual({
            total: 1,
            items: [contentItem(1)],
        });

        expect(requests.map((url) => new URL(url).origin)).toEqual([
            'https://cms-a.methodconf.test',
            'https://cms-b.methodconf.test',
        ]);
    });
});
