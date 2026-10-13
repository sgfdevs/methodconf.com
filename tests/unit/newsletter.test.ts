import { render } from 'svelte/server';
import { describe, expect, it, vi } from 'vitest';
import NewsletterForm from '../../src/lib/components/NewsletterForm.svelte';
import {
    handleNewsletterRequest,
    type NewsletterConfig,
    type NewsletterFetch,
} from '../../src/lib/server/newsletter.ts';

const endpoint = new URL('http://127.0.0.1:9/api/public/subscription');
const listId = 'list';
const config: Required<NewsletterConfig> = { endpoint, listId };

function requestWithBody(body: string): Request {
    return new Request('http://localhost/api/newsletter/', {
        method: 'POST',
        body,
    });
}

function jsonRequest(body: unknown): Request {
    return requestWithBody(JSON.stringify(body));
}

describe('newsletter server handler', () => {
    it('posts the listmonk payload with trimmed fields', async () => {
        const fetcher = vi
            .fn<NewsletterFetch>()
            .mockResolvedValue(Response.json({ data: true }));
        expect(
            await handleNewsletterRequest(
                jsonRequest({
                    name: '  Ada  ',
                    email: '  ada@example.com  ',
                    nullCheck: '',
                }),
                config,
                fetcher,
            ),
        ).toEqual({ body: { success: true }, status: 200 });
        expect(fetcher).toHaveBeenCalledOnce();
        const [url, init] = fetcher.mock.calls[0];
        expect(url).toBe(endpoint.toString());
        expect(init.method).toBe('POST');
        expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
        expect(JSON.parse(init.body as string)).toEqual({
            name: 'Ada',
            email: 'ada@example.com',
            list_uuids: [listId],
        });
    });

    it('allows an omitted name and browser-valid a@b addresses', async () => {
        const fetcher = vi
            .fn<NewsletterFetch>()
            .mockResolvedValue(Response.json({ data: true }));
        const result = await handleNewsletterRequest(
            jsonRequest({ email: 'a@b' }),
            config,
            fetcher,
        );
        expect(result.status).toBe(200);
        expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({
            name: '',
            email: 'a@b',
            list_uuids: [listId],
        });
    });

    it('short-circuits bots and missing config without upstream calls', async () => {
        const fetcher = vi.fn<NewsletterFetch>();
        expect(
            await handleNewsletterRequest(
                jsonRequest({ nullCheck: 'bot', email: '' }),
                config,
                fetcher,
            ),
        ).toEqual({ body: { success: true }, status: 200 });
        expect(
            await handleNewsletterRequest(
                requestWithBody('not json'),
                {},
                fetcher,
            ),
        ).toEqual({ body: { success: false }, status: 500 });
        expect(fetcher).not.toHaveBeenCalled();
    });

    it.each([
        ['malformed JSON', requestWithBody('{')],
        ['array JSON', jsonRequest([])],
        ['missing email', jsonRequest({ name: 'Ada' })],
        ['empty email', jsonRequest({ email: '   ' })],
        ['invalid email', jsonRequest({ email: 'not-an-email' })],
    ])('rejects %s without contacting upstream', async (_label, request) => {
        const fetcher = vi.fn<NewsletterFetch>();
        expect(await handleNewsletterRequest(request, config, fetcher)).toEqual(
            { body: { success: false }, status: 400 },
        );
        expect(fetcher).not.toHaveBeenCalled();
    });

    it.each([
        ['non-2xx', Response.json({ data: true }, { status: 500 })],
        ['bad JSON', new Response('not json')],
        ['missing data true', Response.json({ data: false })],
    ])('fails upstream %s responses', async (_label, response) => {
        const fetcher = vi.fn<NewsletterFetch>().mockResolvedValue(response);
        expect(
            await handleNewsletterRequest(
                jsonRequest({ email: 'a@b' }),
                config,
                fetcher,
            ),
        ).toEqual({ body: { success: false }, status: 502 });
    });

    it('returns a timeout failure when the upstream request is aborted', async () => {
        const fetcher: NewsletterFetch = (_input, init) =>
            new Promise((_resolve, reject) => {
                init.signal?.addEventListener('abort', () =>
                    reject(new Error('aborted')),
                );
            });
        expect(
            await handleNewsletterRequest(
                jsonRequest({ email: 'a@b' }),
                config,
                fetcher,
                1,
            ),
        ).toEqual({ body: { success: false }, status: 504 });
    });
});

describe('newsletter form SSR', () => {
    it('renders fields, native email validation, and a non-focusable honeypot', () => {
        const html = render(NewsletterForm).body;
        expect(html).toContain('name="name"');
        expect(html).toMatch(
            /<input[^>]*type="email"[^>]*name="email"[^>]*required/,
        );
        expect(html).toMatch(
            /<input[^>]*name="company"[^>]*tabindex="-1"[^>]*autocomplete="off"/,
        );
        expect(html).toMatch(/<button[^>]*type="submit"/);
    });
});
