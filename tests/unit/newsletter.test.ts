import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import IntroAndEmailSignupBlock from '../../src/lib/components/IntroAndEmailSignupBlock.svelte';
import NewsletterForm from '../../src/lib/components/NewsletterForm.svelte';
import {
    handleNewsletterRequest,
    type NewsletterConfig,
    type NewsletterFetch,
} from '../../src/lib/server/newsletter.ts';

const endpoint = new URL('http://127.0.0.1:9/api/public/subscription');
const listId = 'fake-newsletter-list';
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

async function readPayload(init: RequestInit): Promise<unknown> {
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(typeof init.body).toBe('string');

    return JSON.parse(init.body as string);
}

describe('newsletter server handler', () => {
    it('posts the exact listmonk payload with trimmed optional fields', async () => {
        const calls: Array<{ input: string; init: RequestInit }> = [];
        const fetcher: NewsletterFetch = async (input, init) => {
            calls.push({ input, init });
            return Response.json({ data: true });
        };

        const result = await handleNewsletterRequest(
            jsonRequest({
                name: '  Ada Lovelace  ',
                email: '  ada@example.com  ',
                nullCheck: '',
            }),
            config,
            fetcher,
        );

        expect(result).toEqual({ body: { success: true }, status: 200 });
        expect(calls).toHaveLength(1);
        expect(calls[0].input).toBe(endpoint.toString());
        expect(await readPayload(calls[0].init)).toEqual({
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            list_uuids: [listId],
        });
    });

    it('allows an omitted name and keeps browser-valid a@b addresses', async () => {
        let forwarded: unknown;
        const fetcher: NewsletterFetch = async (_input, init) => {
            forwarded = await readPayload(init);
            return Response.json({ data: true });
        };

        const result = await handleNewsletterRequest(
            jsonRequest({ email: 'a@b' }),
            config,
            fetcher,
        );

        expect(result.status).toBe(200);
        expect(forwarded).toEqual({
            name: '',
            email: 'a@b',
            list_uuids: [listId],
        });
    });

    it('short-circuits honeypot and missing config before upstream calls', async () => {
        let calls = 0;
        const fetcher: NewsletterFetch = async () => {
            calls += 1;
            return Response.json({ data: true });
        };

        expect(
            await handleNewsletterRequest(
                jsonRequest({ nullCheck: 'bot', email: '' }),
                config,
                fetcher,
            ),
        ).toEqual({ body: { success: true }, status: 200 });
        expect(calls).toBe(0);

        expect(
            await handleNewsletterRequest(
                requestWithBody('not json'),
                {},
                fetcher,
            ),
        ).toEqual({ body: { success: false }, status: 500 });
        expect(calls).toBe(0);
    });

    it.each([
        ['malformed JSON', requestWithBody('{')],
        ['array JSON', jsonRequest([])],
        ['missing email', jsonRequest({ name: 'Ada' })],
        ['empty email', jsonRequest({ email: '   ' })],
        ['invalid email', jsonRequest({ email: 'not-an-email' })],
    ])('fails %s without contacting upstream', async (_label, request) => {
        let calls = 0;
        const fetcher: NewsletterFetch = async () => {
            calls += 1;
            return Response.json({ data: true });
        };

        expect(await handleNewsletterRequest(request, config, fetcher)).toEqual(
            { body: { success: false }, status: 400 },
        );
        expect(calls).toBe(0);
    });

    it.each([
        ['non-2xx', Response.json({ data: true }, { status: 500 })],
        ['bad JSON', new Response('not json')],
        ['missing data true', Response.json({ data: false })],
    ])('fails upstream %s responses', async (_label, response) => {
        const fetcher: NewsletterFetch = async () => response;

        expect(
            await handleNewsletterRequest(
                jsonRequest({ email: 'test@example.com' }),
                config,
                fetcher,
            ),
        ).toEqual({ body: { success: false }, status: 502 });
    });

    it('returns a timeout failure when the upstream request is aborted', async () => {
        const fetcher: NewsletterFetch = (_input, init) =>
            new Promise((_resolve, reject) => {
                init.signal?.addEventListener('abort', () => {
                    reject(new Error('aborted'));
                });
            });

        expect(
            await handleNewsletterRequest(
                jsonRequest({ email: 'test@example.com' }),
                config,
                fetcher,
                1,
            ),
        ).toEqual({ body: { success: false }, status: 504 });
    });
});

describe('newsletter components', () => {
    it('keeps the public form fields, native validation, and duplicate pending guard', () => {
        const html = render(NewsletterForm).body;

        expect(html).toContain('<form action=""');
        expect(html).not.toContain('method=');
        expect(html.indexOf('name="name"')).toBeLessThan(
            html.indexOf('name="email"'),
        );
        expect(html.indexOf('name="email"')).toBeLessThan(
            html.indexOf('name="company"'),
        );
        expect(html).toContain('type="email"');
        expect(html).toContain('required');
        expect(html).toContain('placeholder=" "');
        expect(html).toContain('class="sr-only"');
        expect(html).toContain('tabindex="-1"');
        expect(html).toContain('autocomplete="off"');
        expect(html).toContain('<button class="button" type="submit">');
        expect(html).toContain('Email Signup');

        const source = readFileSync(
            join(process.cwd(), 'src/lib/components/NewsletterForm.svelte'),
            'utf8',
        );
        expect(source).toContain('if (pending)');
        expect(source).toContain("fetch('/api/newsletter'");
        expect(source).toContain("text: 'Something went wrong!'");
        expect(source).toContain("title: 'Check your email'");
        expect(source).not.toContain('confirmButtonText');
    });

    it('renders the hard-coded intro/signup block and app badge links', () => {
        const html = render(IntroAndEmailSignupBlock, {
            props: { params: { conference: '2024' } },
        }).body;

        expect(html).toContain('class="flex flex-col lg:flex-row"');
        expect(html).toContain('Invest In Yourself and Hone Your Craft');
        expect(html).toContain('Method Conference Springfield, MO');
        expect(html).toContain('href="/2024/register/"');
        expect(html).toContain('Download Our Mobile App!');
        expect(html).toContain(
            'href="https://apps.apple.com/us/app/method-conf/id1498359521"',
        );
        expect(html).toContain('title="Download iOS app"');
        expect(html).toContain('alt="Download on the App Store"');
        expect(html).toContain('width="165"');
        expect(html).toContain('height="55"');
        expect(html).toContain(
            'href="https://play.google.com/store/apps/details?id=com.sgfdevs.methodConfApp"',
        );
        expect(html).toContain('title="Download android app"');
        expect(html).toContain('alt="Get it on Google Play"');
        expect(html).toContain('width="186"');
        expect(html).toMatch(
            /Stay in-the-know about event updates and new speaker\s+announcements\./,
        );
        expect(html).toContain('Email Signup');
    });
});
