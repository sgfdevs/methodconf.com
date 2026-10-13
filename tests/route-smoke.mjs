/* global URL, process, fetch, setTimeout */

import { spawn } from 'node:child_process';
import { createServer, request as httpRequest } from 'node:http';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';

const GOOGLE_PLAY_STORE_LINK =
    'https://play.google.com/store/apps/details?id=com.sgfdevs.methodConfApp';
const APPLE_APP_STORE_LINK =
    'https://apps.apple.com/us/app/method-conf/id1498359521';
const NEWSLETTER_LIST_ID = 'fake-newsletter-list';

const contentBase = (id, contentType, name, path, properties = {}) => ({
    id,
    contentType,
    name,
    createDate: '2024-01-01T00:00:00Z',
    updateDate: '2024-01-01T00:00:00Z',
    route: { path, startItem: { id: 'root', path: '/' } },
    properties,
});

const conference = (slug, date, callForSpeakersUrl, registerUrl) =>
    contentBase(slug, 'conference', slug, `/${slug}/`, {
        date,
        callForSpeakersUrl,
        registerUrl,
    });

const block = (id, contentType, properties = {}) => ({
    id,
    contentType,
    properties,
});

const blocks = (...items) => ({
    items: items.map((content) => ({ content })),
});

const image = (url) => ({
    id: `${url}-id`,
    name: url,
    mediaType: 'Image',
    url,
    width: 1200,
    height: 630,
    properties: null,
});

const contentItems = (cmsUrl) => [
    contentBase('home-2024', 'home', 'Home', '/2024/home/', {
        title: 'Home',
        metaDescription: 'Conference home description',
        openGraphImage: [image(new URL('/media/home-og.png', cmsUrl).href)],
        blocks: blocks(
            block('intro-block', 'introAndEmailSignupBlock'),
            block('schedule-block', 'scheduleBlock'),
            block('location-block', 'locationBlock'),
            block('sponsors-block', 'sponsorsBlock'),
        ),
    }),
    contentBase(
        'conduct-page',
        'page',
        'Code of Conduct',
        '/2024/code-of-conduct/',
        {
            title: 'Code of Conduct',
            metaDescription: 'Code page description',
            openGraphImage: [image('/media/code-og.png')],
            blocks: blocks(
                block('rich-text-block', 'richText', {
                    text: {
                        markup: `<p>Be kind to each other.</p><img src="${new URL('/media/acme.svg?crop=center&height=120#logo', cmsUrl).href}" alt="Rich text logo"><a href="https://external.test/media/map.pdf">External map</a>`,
                        blocks: [],
                    },
                }),
            ),
        },
    ),
    contentBase(
        'speaker-ada',
        'speaker',
        'Ada Lovelace',
        '/2024/speakers/ada/',
        {
            jobTitle: 'Computer scientist',
            profileImage: [image(new URL('/media/ada.png', cmsUrl).href)],
            bio: { markup: '<p>Ada wrote about computing.</p>', blocks: [] },
            websiteUrl: 'https://example.test/ada',
        },
    ),
    contentBase('sessions-root', 'sessions', 'Sessions', '/2024/sessions/'),
    contentBase(
        'session-1',
        'session',
        'Opening keynote',
        '/2024/sessions/opening/',
        {
            start: '2024-09-01T09:00:00Z',
            end: '2024-09-01T10:00:00Z',
            speakers: [
                contentBase(
                    'speaker-ada',
                    'speaker',
                    'Ada Lovelace',
                    '/2024/speakers/ada/',
                    {
                        jobTitle: 'Computer scientist',
                        profileImage: [image('/media/ada.png')],
                    },
                ),
            ],
            description: { markup: '<p>Opening remarks.</p>', blocks: [] },
        },
    ),
    contentBase('sponsors-root', 'sponsors', 'Sponsors', '/2024/sponsors/', {
        tiers: {
            items: [
                {
                    content: block('sponsor-tier', 'sponsorTier', {
                        title: 'Community',
                        sponsors: {
                            items: [
                                {
                                    content: block('sponsor-acme', 'sponsor', {
                                        title: 'Acme',
                                        url: 'https://example.test',
                                        logo: [image('/media/acme.svg')],
                                    }),
                                },
                            ],
                        },
                    }),
                },
            ],
        },
    }),
    contentBase(
        'unsupported',
        'sessions',
        'Sessions leaf',
        '/2024/not-a-page/',
    ),
];

const defaultConferences = () => [
    conference('2023', '2023-09-01T09:00:00Z'),
    conference(
        '2024',
        '2024-09-01T09:00:00Z',
        'https://sessionize.example/method-2024/',
        'https://tickets.example/embed?id=5b12c452dc',
    ),
];

const state = {
    conferences: defaultConferences(),
    internalMediaRequests: [],
    publicMediaRequests: [],
    newsletterRequests: [],
    cmsRequests: 0,
};

function writeJson(response, status, body) {
    response.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
    });
    response.end(JSON.stringify(body));
}

async function getFreePort() {
    return new Promise((resolve, reject) => {
        const server = createServer();
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const address = server.address();
            const port =
                typeof address === 'object' && address ? address.port : 0;
            server.close(() => resolve(port));
        });
    });
}

async function startUpstream() {
    let fixtures;
    const server = createServer((request, response) => {
        const url = new URL(request.url ?? '/', 'http://upstream.test');

        if (url.pathname === '/umbraco/delivery/api/v2/content') {
            state.cmsRequests += 1;
            const filters = url.searchParams.getAll('filter');
            const fetch = url.searchParams.get('fetch') ?? '';
            let items = state.conferences;

            if (fetch.startsWith('descendants:2024')) {
                items = fixtures;
            }

            if (fetch.startsWith('descendants:sessions-root')) {
                items = fixtures.filter((item) =>
                    ['session', 'track'].includes(item.contentType),
                );
            }

            for (const filter of filters) {
                if (filter.startsWith('contentType:')) {
                    const contentType = filter.replace('contentType:', '');
                    items = items.filter(
                        (item) => item.contentType === contentType,
                    );
                }

                if (filter === 'speaker:speaker-ada') {
                    items = items.filter((item) => item.id === 'session-1');
                }
            }

            writeJson(response, 200, {
                total: items.length,
                items,
            });
            return;
        }

        if (url.pathname.startsWith('/umbraco/delivery/api/v2/content/item/')) {
            state.cmsRequests += 1;
            const slug = decodeURIComponent(
                url.pathname.replace(
                    '/umbraco/delivery/api/v2/content/item/',
                    '',
                ),
            );

            if (slug === 'nocall') {
                writeJson(
                    response,
                    200,
                    conference('nocall', '2025-09-01T09:00:00Z'),
                );
                return;
            }

            const byPath = new Map([
                ...state.conferences.map((item) => [item.name, item]),
                ...fixtures.map((item) => [
                    item.route.path.replace(/^\//, '').replace(/\/$/, ''),
                    item,
                ]),
                ['2024/home', fixtures[0]],
            ]);
            const item = byPath.get(slug.replace(/\/$/, ''));

            if (!item) {
                writeJson(response, 404, { message: 'not found' });
                return;
            }

            writeJson(response, 200, item);
            return;
        }

        if (url.pathname === '/api/v1/conference/2024/schedule') {
            writeJson(response, 200, {
                scheduleGrid: [['session-1']],
            });
            return;
        }

        if (url.pathname === '/api/public/subscription') {
            let body = '';
            request.setEncoding('utf8');
            request.on('data', (chunk) => {
                body += chunk;
            });
            request.on('end', () => {
                state.newsletterRequests.push({
                    method: request.method,
                    contentType: request.headers['content-type'],
                    body,
                });
                writeJson(response, 200, { data: true });
            });
            return;
        }

        if (url.pathname.startsWith('/media/')) {
            state.internalMediaRequests.push(url.href);
        }

        response.writeHead(404, { 'content-type': 'text/plain' });
        response.end('not found');
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    assert.equal(typeof address, 'object');

    const url = `http://127.0.0.1:${address.port}/`;
    fixtures = contentItems(url);

    return {
        url,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

async function startPublicCms() {
    const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOQiFgAAAGcARHkSIEmAAAAAElFTkSuQmCC',
        'base64',
    );
    const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="blue"/></svg>';
    const media = new Map([
        ['/media/home-og.png', ['image/png', png]],
        ['/media/code-og.png', ['image/png', png]],
        ['/media/ada.png', ['image/png', png]],
        ['/media/acme.svg', ['image/svg+xml', svg]],
    ]);
    const server = createServer((request, response) => {
        const url = new URL(request.url ?? '/', 'http://public-cms.test');
        const fixture = media.get(url.pathname);
        if (!fixture) {
            response.writeHead(404);
            response.end('not found');
            return;
        }

        state.publicMediaRequests.push({
            method: request.method,
            path: url.pathname,
            search: url.search,
        });
        response.writeHead(200, {
            'content-type': fixture[0],
            'cache-control': 'public, max-age=604800',
        });
        response.end(fixture[1]);
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();
    assert.equal(typeof address, 'object');
    return {
        url: `http://127.0.0.1:${address.port}/`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

async function startApp({ upstreamUrl, cmsPublicUrl, searchIndexingEnabled }) {
    const port = await getFreePort();
    const child = spawn(process.execPath, ['build'], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            PORT: String(port),
            HOST: '127.0.0.1',
            UMBRACO_BASE_URL: upstreamUrl,
            CMS_PUBLIC_URL: cmsPublicUrl,
            SITE_URL: 'https://www.example.test/',
            SEARCH_INDEXING_ENABLED: searchIndexingEnabled ? 'true' : 'false',
            NEWSLETTER_ENDPOINT: `${upstreamUrl}api/public/subscription`,
            NEWSLETTER_LIST_ID,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let output = '';
    child.stdout.on('data', (chunk) => {
        output += chunk;
    });
    child.stderr.on('data', (chunk) => {
        output += chunk;
    });

    const origin = `http://127.0.0.1:${port}`;
    const deadline = Date.now() + 10_000;
    let ready = false;

    while (Date.now() < deadline) {
        if (child.exitCode !== null) {
            throw new Error(`app exited before ready\n${output}`);
        }

        try {
            const response = await fetch(`${origin}/robots.txt`, {
                redirect: 'manual',
            });
            if (response.status === 200) {
                ready = true;
                break;
            }
        } catch {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    if (!ready) {
        child.kill('SIGTERM');
        throw new Error(`app did not start\n${output}`);
    }

    return {
        origin,
        close: async () => {
            child.kill('SIGTERM');
            await new Promise((resolve) => child.once('exit', resolve));
        },
    };
}

async function request(origin, path, init = {}) {
    return fetch(`${origin}${path}`, {
        redirect: 'manual',
        ...init,
    });
}

async function expectRedirect(origin, path, status, location, init = {}) {
    const response = await request(origin, path, init);
    const body = await response.text();
    assert.equal(response.status, status, `${path}\n${body}`);
    assert.equal(response.headers.get('location'), location, path);
    assert.equal(body, '', path);
}

async function expectText(origin, path, status, text, init = {}) {
    const response = await request(origin, path, init);
    assert.equal(response.status, status, path);
    assert.equal(await response.text(), text, path);
    return response;
}

function headHtml(html) {
    const match = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html);
    assert.ok(match, 'missing head');
    return match[1];
}

function countHeadTags(head, pattern) {
    return (head.match(pattern) ?? []).length;
}

function assertDefaultSharedHead(head, path) {
    assert.equal(countHeadTags(head, /<title[\s>]/g), 1, path);
    assert.match(
        head,
        /<title>Method Conference - October 12th 2024 - Springfield, MO<\/title>/,
        path,
    );
    assert.equal(countHeadTags(head, /property="og:title"/g), 1, path);
    assert.match(
        head,
        /<meta property="og:title" content="Method Conference - October 12th 2024 - Springfield, MO"/,
        path,
    );
    assert.equal(countHeadTags(head, /property="og:image"/g), 1, path);
    assert.match(
        head,
        /<meta property="og:image" content="https:\/\/www\.example\.test\/opengraph-image\.jpg\?opengraph-image\.44rvcdk19e2xk\.jpg"/,
        path,
    );
    assert.equal(countHeadTags(head, /property="og:image:type"/g), 1, path);
    assert.equal(countHeadTags(head, /property="og:image:width"/g), 1, path);
    assert.equal(countHeadTags(head, /property="og:image:height"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:card"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:title"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:image"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:image:type"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:image:width"/g), 1, path);
    assert.equal(countHeadTags(head, /name="twitter:image:height"/g), 1, path);
    assert.match(head, /content="summary_large_image"/, path);
    assert.match(head, /content="image\/jpeg"/, path);
    assert.match(head, /content="1200"/, path);
    assert.match(head, /content="630"/, path);
    assert.equal(countHeadTags(head, /rel="icon"/g), 1, path);
    assert.match(
        head,
        /<link rel="icon" href="\/icon\.png\?icon\.232taq741yhvg\.png" sizes="180x180" type="image\/png"/,
        path,
    );
}

async function expectHead(origin, path, status, init = {}) {
    const response = await request(origin, path, init);
    const html = await response.text();
    assert.equal(response.status, status, `${path}\n${html}`);
    return { html, head: headHtml(html) };
}

async function stylesheetText(origin, path, head) {
    const links = [...head.matchAll(/<link href="([^"]+)" rel="stylesheet"/g)];
    const styles = [];

    for (const [, href] of links) {
        const url = new URL(href, `${origin}${path}`).pathname;
        const response = await request(origin, url);
        assert.equal(response.status, 200, url);
        styles.push(await response.text());
    }

    return styles.join('\n');
}

async function requestWithoutUserAgent(origin, path) {
    const url = new URL(`${origin}${path}`);

    return new Promise((resolve, reject) => {
        const request = httpRequest(
            url,
            {
                method: 'GET',
                headers: {},
            },
            (response) => {
                let body = '';
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    resolve({
                        status: response.statusCode,
                        location: response.headers.location,
                        body,
                    });
                });
            },
        );
        request.on('error', reject);
        request.end();
    });
}

async function runRouteChecks(origin, cmsPublicUrl) {
    await expectRedirect(origin, '/', 307, '/2024/', {
        headers: { accept: 'text/html' },
    });
    await expectRedirect(origin, '/?utm=1', 307, '/2024/');
    await expectRedirect(origin, '/register?utm=1', 308, '/register/?utm=1');
    await expectRedirect(origin, '/register/', 308, '/2024/register/');
    await expectRedirect(origin, '/tickets?utm=1', 308, '/tickets/?utm=1');
    await expectRedirect(origin, '/tickets/?utm=1', 307, '/register/');
    await expectRedirect(origin, '/speak/', 307, '/2024/');
    await expectRedirect(origin, '/umbraco/', 307, cmsPublicUrl);
    await expectRedirect(origin, '/umbraco', 308, '/umbraco/');
    await expectRedirect(
        origin,
        '/2024/speak?source=homepage',
        308,
        '/2024/speak/?source=homepage',
    );
    await expectRedirect(
        origin,
        '/2024/speak/?source=homepage',
        307,
        'https://sessionize.example/method-2024/',
    );
    await expectRedirect(
        origin,
        '/2024/tickets/?utm=1',
        308,
        '/2024/register/',
    );
    await expectRedirect(origin, '/robots.txt/', 308, '/robots.txt');

    assert.equal((await request(origin, '/nocall/speak/')).status, 404);
    assert.equal(
        (await request(origin, '/2024/sessions/not-a-page/')).status,
        404,
    );
    assert.equal((await request(origin, '/2024/not-a-page/')).status, 404);
    await expectRedirect(origin, '/sitemap.xml', 308, './sitemap.xml/');
    assert.equal((await request(origin, '/sitemap.xml/')).status, 404);

    const home = await expectHead(origin, '/2024/', 200);
    assert.match(home.html, /Invest In Yourself and Hone Your Craft/);
    assert.match(home.html, /Stay in-the-know about event updates/);
    assert.match(home.html, /Schedule/);
    assert.match(home.html, /Location Info/);
    assert.match(home.html, /Sponsors/);
    assert.match(home.head, /<title>Method Conference - Home<\/title>/);
    assert.match(
        home.head,
        /<meta name="description" content="Conference home description"/,
    );
    assert.ok(
        home.head.includes(
            `<meta property="og:image" content="${cmsPublicUrl}media/home-og.png?width=1200&amp;height=630"`,
        ),
        'home Open Graph image should use the public CMS origin',
    );
    assert.equal(countHeadTags(home.head, /property="og:image:type"/g), 0);

    const generic = await expectHead(origin, '/2024/code-of-conduct/', 200);
    assert.match(generic.html, /Be kind to each other\./);
    assert.match(generic.html, /href="\/2024\/register\/"/);
    assert.match(
        generic.head,
        /<title>Method Conference - Code of Conduct<\/title>/,
    );
    assert.ok(
        generic.head.includes(
            `<meta property="og:image" content="${cmsPublicUrl}media/code-og.png?width=1200&amp;height=630"`,
        ),
        'relative Open Graph images should use the public CMS origin',
    );

    const speaker = await expectHead(origin, '/2024/speakers/ada/', 200);
    assert.match(speaker.html, /Ada Lovelace/);
    assert.match(speaker.html, /Opening keynote/);
    assert.match(speaker.html, /Ada Lovelace Website/);
    assert.match(
        speaker.head,
        /<title>Method Conference - Ada Lovelace<\/title>/,
    );

    const register = await expectHead(origin, '/2024/register/', 200);
    assert.match(register.html, /Loading\.\.\./);
    assert.doesNotMatch(register.html, /<iframe/);

    const success = await expectHead(origin, '/2024/register/success/', 200);
    assert.match(success.html, /Thank You for Registering/);
    assert.match(success.html, /href="\/2024\/"/);
    assert.match(success.head, /<meta name="robots" content="noindex"/);

    state.conferences = [];
    assert.equal((await request(origin, '/')).status, 404);
    state.conferences = defaultConferences();
}

async function runNewsletterChecks(origin) {
    state.newsletterRequests = [];

    const get = await request(origin, '/api/newsletter/');
    assert.equal(get.status, 405);
    assert.deepEqual(await get.json(), { success: false });

    const success = await request(origin, '/api/newsletter/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
            name: '  Ada Lovelace  ',
            email: '  ada@example.com  ',
            nullCheck: '',
        }),
    });
    assert.equal(success.status, 200);
    assert.deepEqual(await success.json(), { success: true });
    assert.equal(state.newsletterRequests.length, 1);
    assert.deepEqual(JSON.parse(state.newsletterRequests.at(-1).body), {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        list_uuids: [NEWSLETTER_LIST_ID],
    });

    const slashless = await request(origin, '/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'a@b', nullCheck: '' }),
    });
    assert.equal(slashless.status, 200);
    assert.deepEqual(await slashless.json(), { success: true });
    assert.equal(state.newsletterRequests.length, 2);

    const honeypot = await request(origin, '/api/newsletter/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: '', nullCheck: 'bot' }),
    });
    assert.equal(honeypot.status, 200);
    assert.deepEqual(await honeypot.json(), { success: true });
    assert.equal(state.newsletterRequests.length, 2);
}

async function runMobileChecks(origin) {
    await expectRedirect(
        origin,
        '/mobile-app?from=qr',
        308,
        '/mobile-app/?from=qr',
    );

    const missingUserAgent = await requestWithoutUserAgent(
        origin,
        '/mobile-app/',
    );
    assert.equal(missingUserAgent.status, 307);
    assert.equal(missingUserAgent.location, '/');
    assert.equal(missingUserAgent.body, '');

    await expectRedirect(origin, '/mobile-app/', 307, GOOGLE_PLAY_STORE_LINK, {
        headers: { 'user-agent': 'Mozilla/5.0 Android' },
    });
    await expectRedirect(origin, '/mobile-app/', 307, APPLE_APP_STORE_LINK, {
        headers: { 'user-agent': 'Mozilla/5.0 iPhone' },
    });
    await expectRedirect(origin, '/mobile-app/', 307, APPLE_APP_STORE_LINK, {
        headers: { 'user-agent': 'Mozilla/5.0 iphone' },
    });

    const desktop = await request(origin, '/mobile-app/', {
        headers: { 'user-agent': 'Mozilla/5.0 Macintosh' },
    });
    const html = await desktop.text();
    assert.equal(desktop.status, 200);
    assert.match(
        html,
        /If you are not automatically redirected click\s*<a href="\/">here<\/a>/,
    );
}

async function runHeadChecks(origin, { searchIndexingEnabled }) {
    const defaultPage = await expectHead(origin, '/mobile-app/', 200, {
        headers: { 'user-agent': 'Mozilla/5.0 Macintosh' },
    });
    assertDefaultSharedHead(defaultPage.head, '/mobile-app/');
    assert.equal(
        countHeadTags(defaultPage.head, /name="robots"/g),
        searchIndexingEnabled ? 0 : 1,
        '/mobile-app/ robots',
    );
    if (!searchIndexingEnabled) {
        assert.match(
            defaultPage.head,
            /<meta name="robots" content="noindex,nofollow"/,
        );
    }

    const notFound = await expectHead(origin, '/missing/', 404);
    assertDefaultSharedHead(notFound.head, '/missing/');
    assert.equal(countHeadTags(notFound.head, /name="robots"/g), 1);
    assert.match(notFound.head, /<meta name="robots" content="noindex"/);
    assert.equal(countHeadTags(notFound.head, /property="og:image"/g), 1);
    const shellIndex = notFound.html.indexOf('next-error-shell');
    const footerIndex = notFound.html.indexOf('<footer');
    assert.ok(shellIndex >= 0, '404 shell missing');
    assert.ok(footerIndex > shellIndex, '404 footer should render below shell');
    const notFoundCss = await stylesheetText(
        origin,
        '/missing/',
        notFound.head,
    );
    assert.match(notFoundCss, /height:\s*100vh/);
    assert.match(notFoundCss, /font-family:\s*system-ui/);
}

async function runRobotChecks(upstreamUrl, cmsPublicUrl) {
    const before = state.cmsRequests;
    const enabledApp = await startApp({
        upstreamUrl,
        cmsPublicUrl,
        searchIndexingEnabled: true,
    });
    try {
        const response = await expectText(
            enabledApp.origin,
            '/robots.txt',
            200,
            'User-Agent: *\nAllow: /\n\n',
        );
        assert.match(
            response.headers.get('content-type') ?? '',
            /^text\/plain/,
        );
        assert.equal(state.cmsRequests, before, 'robots should not hit CMS');
        await runHeadChecks(enabledApp.origin, {
            searchIndexingEnabled: true,
        });
    } finally {
        await enabledApp.close();
    }

    const disabledApp = await startApp({
        upstreamUrl,
        cmsPublicUrl,
        searchIndexingEnabled: false,
    });
    try {
        const beforeDisabledRobots = state.cmsRequests;
        await expectText(
            disabledApp.origin,
            '/robots.txt',
            200,
            'User-Agent: *\nDisallow: /\n\n',
        );
        assert.equal(
            state.cmsRequests,
            beforeDisabledRobots,
            'robots should not hit CMS',
        );
        await runHeadChecks(disabledApp.origin, {
            searchIndexingEnabled: false,
        });
    } finally {
        await disabledApp.close();
    }
}

async function runImageChecks(origin, upstreamUrl, cmsPublicUrl) {
    state.internalMediaRequests = [];
    state.publicMediaRequests = [];
    assert.notEqual(new URL(cmsPublicUrl).origin, new URL(upstreamUrl).origin);

    const pages = [
        ['/2024/', ['/media/ada.png', '/media/acme.svg']],
        ['/2024/speakers/ada/', ['/media/ada.png']],
        ['/2024/code-of-conduct/', ['/media/acme.svg']],
    ];

    for (const [path, expectedPaths] of pages) {
        const { html } = await expectHead(origin, path, 200);
        if (path === '/2024/code-of-conduct/') {
            assert.ok(
                html.includes(
                    `src="${cmsPublicUrl}media/acme.svg?crop=center&height=120#logo"`,
                ),
            );
            assert.ok(
                html.includes('href="https://external.test/media/map.pdf"'),
            );
        }
        const tags = [...html.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
        const loadedPaths = new Set();

        for (const tag of tags) {
            assert.doesNotMatch(tag, /\/_image[/?]|\/cms-media\//, path);
            const src = /\bsrc="([^"]+)"/.exec(tag)?.[1];
            assert.ok(src, `missing image source on ${path}`);
            const url = new URL(src.replaceAll('&amp;', '&'), origin);
            if (!url.pathname.startsWith('/media/')) continue;

            assert.equal(url.origin, new URL(cmsPublicUrl).origin, tag);
            const response = await fetch(url, { redirect: 'manual' });
            assert.equal(response.status, 200, url.href);
            assert.equal(
                response.headers.get('content-type'),
                url.pathname.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
                url.href,
            );
            assert.ok((await response.arrayBuffer()).byteLength > 0, url.href);
            loadedPaths.add(url.pathname);
        }

        for (const expectedPath of expectedPaths) {
            assert.ok(
                loadedPaths.has(expectedPath),
                `${path}: ${expectedPath}`,
            );
        }
    }

    assert.ok(
        state.publicMediaRequests.some(
            ({ path, search }) =>
                path === '/media/acme.svg' &&
                search === '?crop=center&height=120',
        ),
        'SVG images should load from the public CMS',
    );
    assert.deepEqual(
        state.internalMediaRequests,
        [],
        'images should not load from the internal CMS',
    );
}

const upstream = await startUpstream();
const publicCms = await startPublicCms();
try {
    await runRobotChecks(upstream.url, publicCms.url);

    const app = await startApp({
        upstreamUrl: upstream.url,
        cmsPublicUrl: publicCms.url,
        searchIndexingEnabled: true,
    });
    try {
        await runRouteChecks(app.origin, publicCms.url);
        await runMobileChecks(app.origin);
        await runNewsletterChecks(app.origin);
        await runHeadChecks(app.origin, { searchIndexingEnabled: true });
        await runImageChecks(app.origin, upstream.url, publicCms.url);
    } finally {
        await app.close();
    }
} finally {
    await Promise.all([upstream.close(), publicCms.close()]);
}
