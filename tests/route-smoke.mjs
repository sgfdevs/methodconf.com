/* global URL, process, fetch, setTimeout */

import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';

const content = (id, contentType, path, properties = {}, name = id) => ({
    id,
    contentType,
    name,
    route: { path, startItem: { id: 'root', path: '/' } },
    properties,
});
const blocks = (...items) => ({
    items: items.map((item) => ({ content: item })),
});
const block = (contentType, properties = {}) => ({
    id: contentType,
    contentType,
    properties,
});
const image = (url) => ({ url, width: 1200, height: 630 });
const conference = content('2024', 'conference', '/2024/', {
    date: '2024-09-01T09:00:00Z',
    callForSpeakersUrl: 'https://sessionize.example/method-2024/',
    registerUrl: 'https://tickets.example/embed?id=5b12c452dc',
});

function fixtures(cmsUrl) {
    const speaker = content(
        'ada',
        'speaker',
        '/2024/speakers/ada/',
        {
            profileImage: [image(new URL('/media/ada.png', cmsUrl).href)],
            bio: { markup: '<p>Ada wrote about computing.</p>' },
        },
        'Ada Lovelace',
    );
    return [
        content('home', 'home', '/2024/home/', {
            title: 'Home',
            metaDescription: 'Conference home description',
            openGraphImage: [image(new URL('/media/home.png', cmsUrl).href)],
            blocks: blocks(
                block('introAndEmailSignupBlock'),
                block('scheduleBlock'),
                block('locationBlock'),
                block('sponsorsBlock'),
            ),
        }),
        content('conduct', 'page', '/2024/code-of-conduct/', {
            title: 'Code of Conduct',
            openGraphImage: [image('/media/home.png')],
            blocks: blocks(
                block('richText', {
                    text: {
                        markup: `<p>Be kind.</p><img src="${cmsUrl}media/acme.svg?crop=center&height=120#logo"><a href="https://external.test/media/map.pdf">External map</a>`,
                    },
                }),
            ),
        }),
        speaker,
        content('sessions', 'sessions', '/2024/sessions/'),
        content(
            'opening',
            'session',
            '/2024/sessions/opening/',
            {
                start: '2024-09-01T09:00:00Z',
                end: '2024-09-01T10:00:00Z',
                speakers: [speaker],
                description: { markup: '<p>Opening remarks.</p>' },
            },
            'Opening keynote',
        ),
        content('sponsors', 'sponsors', '/2024/sponsors/', {
            tiers: blocks(
                block('sponsorTier', {
                    title: 'Community',
                    sponsors: blocks(
                        block('sponsor', {
                            title: 'Acme',
                            logo: [image('/media/acme.svg')],
                        }),
                    ),
                }),
            ),
        }),
        content('unsupported', 'sessions', '/2024/not-a-page/'),
    ];
}

async function listen(handler) {
    const server = createServer(handler);
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    return {
        url: `http://127.0.0.1:${server.address().port}/`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

function json(response, status, body) {
    response.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-store',
    });
    response.end(JSON.stringify(body));
}

async function startCms() {
    const state = {
        conferences: [conference],
        mediaRequests: 0,
        newsletter: [],
    };
    let items;
    const server = await listen(async (request, response) => {
        const url = new URL(request.url, 'http://cms.test');
        if (url.pathname === '/umbraco/delivery/api/v2/content') {
            const root = url.searchParams.get('fetch');
            let result = root ? items : state.conferences;
            if (root === 'descendants:sessions') {
                result = result.filter(
                    (item) => item.contentType === 'session',
                );
            }
            for (const filter of url.searchParams.getAll('filter')) {
                if (filter.startsWith('contentType:')) {
                    result = result.filter(
                        (item) => item.contentType === filter.slice(12),
                    );
                }
                if (filter === 'speaker:ada') {
                    result = result.filter((item) => item.id === 'opening');
                }
            }
            json(response, 200, { total: result.length, items: result });
        } else if (
            url.pathname.startsWith('/umbraco/delivery/api/v2/content/item/')
        ) {
            const path = decodeURIComponent(url.pathname.split('/item/')[1]);
            const item = [...state.conferences, ...items].find(
                (item) => item.route.path === `/${path.replace(/\/$/, '')}/`,
            );
            json(response, item ? 200 : 404, item ?? { message: 'not found' });
        } else if (url.pathname === '/api/v1/conference/2024/schedule') {
            json(response, 200, { scheduleGrid: [['opening']] });
        } else if (url.pathname === '/api/public/subscription') {
            let body = '';
            for await (const chunk of request) body += chunk;
            state.newsletter.push(JSON.parse(body));
            json(response, 200, { data: true });
        } else {
            if (url.pathname.startsWith('/media/')) state.mediaRequests += 1;
            json(response, 404, { message: 'not found' });
        }
    });
    items = fixtures(server.url);
    return { ...server, state };
}

async function startMedia() {
    const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGOQiFgAAAGcARHkSIEmAAAAAElFTkSuQmCC',
        'base64',
    );
    return listen((request, response) => {
        const path = new URL(request.url, 'http://media.test').pathname;
        const svg = path === '/media/acme.svg';
        if (!svg && !['/media/home.png', '/media/ada.png'].includes(path)) {
            response.writeHead(404).end();
            return;
        }
        response.writeHead(200, {
            'content-type': svg ? 'image/svg+xml' : 'image/png',
        });
        response.end(svg ? '<svg xmlns="http://www.w3.org/2000/svg"/>' : png);
    });
}

async function startApp(cms, media, indexing) {
    const child = spawn(process.execPath, ['build'], {
        env: {
            ...process.env,
            PORT: '0',
            HOST: '127.0.0.1',
            UMBRACO_BASE_URL: cms.url,
            CMS_PUBLIC_URL: media.url,
            SITE_URL: 'https://www.example.test/',
            SEARCH_INDEXING_ENABLED: String(indexing),
            NEWSLETTER_ENDPOINT: `${cms.url}api/public/subscription`,
            NEWSLETTER_LIST_ID: 'test-list',
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
    const app = {
        url: '',
        close: async () => {
            if (child.exitCode !== null || child.signalCode !== null) return;
            const exited = once(child, 'exit');
            child.kill('SIGTERM');
            await exited;
        },
    };
    try {
        const deadline = Date.now() + 10_000;
        while (Date.now() < deadline && child.exitCode === null) {
            const address = /Listening on (http:\/\/\S+)/.exec(output)?.[1];
            if (address) {
                app.url = address;
                return app;
            }
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
        throw new Error(`App failed to start:\n${output}`);
    } catch (error) {
        await app.close();
        throw error;
    }
}

function request(app, path, init = {}) {
    return fetch(new URL(path, app.url), { redirect: 'manual', ...init });
}

async function page(app, path, status = 200, init = {}) {
    const response = await request(app, path, init);
    const html = await response.text();
    assert.equal(response.status, status, `${path}\n${html}`);
    const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1];
    assert.ok(head, `Missing head: ${path}`);
    assert.equal((head.match(/<title[\s>]/g) ?? []).length, 1, path);
    return { html, head };
}

async function checkRoutes(app, media) {
    const redirects = [
        ['/', 307, '/2024/'],
        ['/register?utm=1', 308, '/register/?utm=1'],
        ['/register/', 308, '/2024/register/'],
        ['/tickets/', 307, '/register/'],
        ['/speak/', 307, '/2024/'],
        ['/umbraco', 308, '/umbraco/'],
        ['/umbraco/', 307, media.url],
        ['/2024/speak?source=home', 308, '/2024/speak/?source=home'],
        ['/2024/speak/', 307, 'https://sessionize.example/method-2024/'],
        ['/2024/tickets/', 308, '/2024/register/'],
        ['/robots.txt/', 308, '/robots.txt'],
        ['/mobile-app?qr=1', 308, '/mobile-app/?qr=1'],
    ];
    for (const [path, status, location] of redirects) {
        const response = await request(app, path, {
            headers: { accept: 'text/html' },
        });
        assert.equal(response.status, status, path);
        assert.equal(response.headers.get('location'), location, path);
    }
    for (const [agent, store] of [
        [
            'Android',
            'https://play.google.com/store/apps/details?id=com.sgfdevs.methodConfApp',
        ],
        ['iPhone', 'https://apps.apple.com/us/app/method-conf/id1498359521'],
    ]) {
        const response = await request(app, '/mobile-app/', {
            headers: { 'user-agent': agent },
        });
        assert.equal(response.status, 307);
        assert.equal(response.headers.get('location'), store);
    }
    for (const path of ['/missing/', '/2024/missing/', '/2024/not-a-page/']) {
        await page(app, path, 404);
    }
    assert.equal((await request(app, '/missing/speak/')).status, 404);
    await page(app, '/2024/register/');
    const success = await page(app, '/2024/register/success/');
    assert.match(success.html, /Thank You for Registering/);
    assert.match(success.head, /name="robots" content="noindex"/);
}

async function checkPages(app, cms, media) {
    for (const [path, title, text, expectedImages] of [
        ['/2024/', 'Home', 'Schedule', ['/media/ada.png', '/media/acme.svg']],
        [
            '/2024/speakers/ada/',
            'Ada Lovelace',
            'Opening keynote',
            ['/media/ada.png'],
        ],
        [
            '/2024/code-of-conduct/',
            'Code of Conduct',
            'Be kind.',
            ['/media/acme.svg'],
        ],
    ]) {
        const { html, head } = await page(app, path);
        assert.ok(
            head.includes(`<title>Method Conference - ${title}</title>`),
            path,
        );
        assert.ok(html.includes(text), path);
        assert.ok(
            !html.includes(cms.url),
            `Internal CMS origin leaked on ${path}`,
        );
        const images = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)]
            .map(([, src]) => new URL(src.replaceAll('&amp;', '&'), app.url))
            .filter((url) => url.pathname.startsWith('/media/'));
        for (const expected of expectedImages) {
            assert.ok(
                images.some((url) => url.pathname === expected),
                `${path}: ${expected}`,
            );
        }
        for (const url of images) {
            assert.equal(url.origin, new URL(media.url).origin);
            const response = await fetch(url, { redirect: 'manual' });
            assert.equal(response.status, 200, url.href);
            assert.equal(
                response.headers.get('content-type'),
                url.pathname.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
            );
            assert.ok((await response.arrayBuffer()).byteLength > 0);
        }
        if (path === '/2024/code-of-conduct/') {
            assert.equal(images[0].search, '?crop=center&height=120');
            assert.equal(images[0].hash, '#logo');
            assert.ok(
                html.includes('href="https://external.test/media/map.pdf"'),
            );
        }
        if (path !== '/2024/speakers/ada/') {
            assert.ok(
                head.includes(
                    `${media.url}media/home.png?width=1200&amp;height=630`,
                ),
            );
        }
    }
    assert.equal(cms.state.mediaRequests, 0);
    const get = await request(app, '/api/newsletter/');
    assert.equal(get.status, 405);
    for (const path of ['/api/newsletter/', '/api/newsletter']) {
        const response = await request(app, path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ name: 'Ada', email: 'ada@example.com' }),
        });
        assert.equal(response.status, 200);
        assert.deepEqual(await response.json(), { success: true });
    }
    assert.deepEqual(
        cms.state.newsletter,
        Array(2).fill({
            name: 'Ada',
            email: 'ada@example.com',
            list_uuids: ['test-list'],
        }),
    );
    cms.state.conferences = [];
    assert.equal((await request(app, '/')).status, 404);
    cms.state.conferences = [conference];
}

async function checkIndexing(app, enabled) {
    const robots = await request(app, '/robots.txt');
    assert.equal(robots.status, 200);
    assert.equal(
        await robots.text(),
        `User-Agent: *\n${enabled ? 'Allow' : 'Disallow'}: /\n\n`,
    );
    const normal = await page(app, '/mobile-app/', 200, {
        headers: { 'user-agent': 'Desktop' },
    });
    assert.equal(/name="robots"/.test(normal.head), !enabled);
    const missing = await page(app, '/missing/', 404);
    assert.match(missing.head, /name="robots" content="noindex"/);
    assert.match(missing.html, /This page could not be found\./);
    assert.match(missing.html, /<footer/);
}

const resources = [];
try {
    const cms = await startCms();
    resources.push(cms);
    const media = await startMedia();
    resources.push(media);
    const app = await startApp(cms, media, true);
    resources.push(app);
    await checkRoutes(app, media);
    await checkPages(app, cms, media);
    await checkIndexing(app, true);
    await app.close();
    const disabled = await startApp(cms, media, false);
    resources.push(disabled);
    await checkIndexing(disabled, false);
} finally {
    await Promise.all(resources.map((resource) => resource.close()));
}
