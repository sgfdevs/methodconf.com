import { beforeEach, describe, expect, it, vi } from 'vitest';

const privateEnv = vi.hoisted(() => ({
    UMBRACO_BASE_URL: 'https://cms-a.methodconf.test',
    CMS_PUBLIC_URL: 'https://cms-public.methodconf.test',
}));

vi.mock('$app/env/private', () => ({
    get UMBRACO_BASE_URL() {
        return privateEnv.UMBRACO_BASE_URL;
    },
    get CMS_PUBLIC_URL() {
        return privateEnv.CMS_PUBLIC_URL;
    },
}));

function contentItem(value: number) {
    return {
        id: `item-${value}`,
        contentType: 'conference',
        route: { path: `/item-${value}/` },
        properties: { value },
    };
}

const query = { filter: ['contentType:conference'] };

describe('Umbraco helper cache wiring', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.unstubAllGlobals();
        privateEnv.UMBRACO_BASE_URL = 'https://cms-a.methodconf.test';
        privateEnv.CMS_PUBLIC_URL = 'https://cms-public.methodconf.test';
    });

    it('coalesces helper calls and reuses the result on a warm third call', async () => {
        let resolve!: (response: Response) => void;
        const reply = new Promise<Response>((res) => {
            resolve = res;
        });
        const fetch = vi.fn(async () => await reply);
        vi.stubGlobal('fetch', fetch);
        const { getItemsOrDefault } =
            await import('#lib/server/umbraco/getItems.ts');
        const first = getItemsOrDefault(query);
        const second = getItemsOrDefault(query);
        const body = { total: 1, items: [contentItem(1)] };
        resolve(Response.json(body));
        await expect(first).resolves.toEqual(body);
        await expect(second).resolves.toEqual(body);
        await expect(getItemsOrDefault(query)).resolves.toEqual(body);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('rewrites cached content using the current public CMS URL without mutating prior results', async () => {
        const content = {
            ...contentItem(1),
            properties: {
                image: {
                    url: 'https://cms-a.methodconf.test/media/photo.jpg?crop=center#photo',
                },
                blocks: [
                    {
                        content: {
                            properties: {
                                text: {
                                    markup: '<p><img src = "https://cms-a.methodconf.test/media/logo.svg?crop=center#logo" srcset="https://cms-a.methodconf.test/media/logo.svg?crop=0,0,1,1 1x, /media/logo-2.svg 2x"><a href="https://external.test/media/file.pdf">External</a></p>',
                                },
                            },
                        },
                    },
                ],
            },
        };
        const fetch = vi.fn(async () => Response.json(content));
        vi.stubGlobal('fetch', fetch);
        const { getItemByPathOrDefault } =
            await import('#lib/server/umbraco/getItemByPath.ts');
        const first = await getItemByPathOrDefault('/2024/');
        const firstJson = JSON.stringify(first);
        expect(firstJson).toContain(
            'https://cms-public.methodconf.test/media/logo.svg?crop=center#logo',
        );
        expect(firstJson).toContain(
            'https://cms-public.methodconf.test/media/logo.svg?crop=0,0,1,1 1x, https://cms-public.methodconf.test/media/logo-2.svg 2x',
        );
        expect(firstJson).toContain(
            'https://cms-public.methodconf.test/media/photo.jpg?crop=center#photo',
        );
        expect(firstJson).toContain('https://external.test/media/file.pdf');
        expect(firstJson).not.toContain('https://cms-a.methodconf.test/media/');
        expect(
            content.properties.blocks[0].content.properties.text.markup,
        ).toContain('https://cms-a.methodconf.test/media/logo.svg');

        privateEnv.CMS_PUBLIC_URL = 'https://cms-other.methodconf.test';
        const second = JSON.stringify(await getItemByPathOrDefault('/2024/'));
        expect(second).toContain(
            'https://cms-other.methodconf.test/media/logo.svg?crop=center#logo',
        );
        expect(second).toContain(
            'https://cms-other.methodconf.test/media/photo.jpg?crop=center#photo',
        );
        expect(JSON.stringify(first)).toBe(firstJson);
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('isolates helper caches by runtime Umbraco origin', async () => {
        const origins: string[] = [];
        vi.stubGlobal(
            'fetch',
            async (input: RequestInfo | URL, init?: RequestInit) => {
                const request =
                    input instanceof Request ? input : new Request(input, init);
                origins.push(new URL(request.url).origin);
                return Response.json({
                    total: 1,
                    items: [contentItem(request.url.includes('cms-a') ? 1 : 2)],
                });
            },
        );
        const { getItemsOrDefault } =
            await import('#lib/server/umbraco/getItems.ts');
        for (const [host, expected] of [
            ['a', 1],
            ['b', 2],
            ['a', 1],
        ] as const) {
            privateEnv.UMBRACO_BASE_URL = `https://cms-${host}.methodconf.test`;
            await expect(getItemsOrDefault(query)).resolves.toEqual({
                total: 1,
                items: [contentItem(expected)],
            });
        }
        expect(origins).toEqual([
            'https://cms-a.methodconf.test',
            'https://cms-b.methodconf.test',
        ]);
    });
});
