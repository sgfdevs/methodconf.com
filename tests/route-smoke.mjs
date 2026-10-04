/* global TextEncoder, URL, process, fetch, setTimeout */

import { spawn } from 'node:child_process';
import { createServer, request as httpRequest } from 'node:http';
import assert from 'node:assert/strict';
import sharp from 'sharp';

const TEXT_ENCODER = new TextEncoder();
const GOOGLE_PLAY_STORE_LINK =
    'https://play.google.com/store/apps/details?id=com.sgfdevs.methodConfApp';
const APPLE_APP_STORE_LINK =
    'https://apps.apple.com/us/app/method-conf/id1498359521';

const conference = (slug, date, callForSpeakersUrl) => ({
    contentType: 'conference',
    name: slug,
    route: { path: `/${slug}/` },
    properties: {
        date,
        callForSpeakersUrl,
    },
});

const imageFixture = await sharp({
    create: {
        width: 20,
        height: 10,
        channels: 3,
        background: { r: 24, g: 88, b: 160 },
    },
})
    .jpeg({ quality: 92 })
    .toBuffer();

const largeImagePlaceholderBytes = 16 * 1024 * 1024;

const state = {
    conferences: [
        conference('2023', '2023-09-01T09:00:00Z'),
        conference(
            '2024',
            '2024-09-01T09:00:00Z',
            'https://sessionize.example/method-2024/',
        ),
    ],
    mediaRequests: [],
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
    const server = createServer((request, response) => {
        const url = new URL(request.url ?? '/', 'http://upstream.test');

        if (url.pathname === '/umbraco/delivery/api/v2/content') {
            state.cmsRequests += 1;
            writeJson(response, 200, {
                total: state.conferences.length,
                items: state.conferences,
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

            const item = state.conferences.find((item) => item.name === slug);

            if (!item) {
                writeJson(response, 404, { message: 'not found' });
                return;
            }

            writeJson(response, 200, item);
            return;
        }

        if (url.pathname === '/media/image.jpg') {
            state.mediaRequests.push({
                method: request.method,
                path: url.pathname,
                search: url.search,
                accept: request.headers.accept,
                range: request.headers.range,
                ifNoneMatch: request.headers['if-none-match'],
                ifModifiedSince: request.headers['if-modified-since'],
            });
            response.writeHead(200, 'OK', {
                'content-type': 'image/jpeg',
                'content-length': String(imageFixture.byteLength),
                etag: '"image-etag"',
                'cache-control': 'public, max-age=604800, must-revalidate',
            });
            if (request.method !== 'HEAD') response.end(imageFixture);
            else response.end();
            return;
        }

        if (url.pathname === '/media/private-image.jpg') {
            response.writeHead(200, 'OK', {
                'content-type': 'image/jpeg',
                'content-length': String(imageFixture.byteLength),
                'cache-control': 'private, no-store',
            });
            response.end(imageFixture);
            return;
        }

        if (url.pathname === '/media/broken.jpg') {
            response.writeHead(200, 'OK', {
                'content-type': 'image/jpeg',
                'content-length': '12',
                'cache-control': 'public, max-age=604800, must-revalidate',
            });
            response.end('not an image');
            return;
        }

        if (url.pathname === '/media/too-large.jpg') {
            response.writeHead(200, 'OK', {
                'content-type': 'image/jpeg',
                'content-length': String(largeImagePlaceholderBytes),
                'cache-control': 'public, max-age=604800, must-revalidate',
            });
            response.end();
            return;
        }

        if (url.pathname === '/media/redirect.jpg') {
            response.writeHead(302, 'Found', {
                location: 'https://evil.example/image.jpg',
            });
            response.end();
            return;
        }

        if (url.pathname.startsWith('/media/')) {
            state.mediaRequests.push({
                method: request.method,
                path: url.pathname,
                search: url.search,
                accept: request.headers.accept,
                range: request.headers.range,
                ifNoneMatch: request.headers['if-none-match'],
                ifModifiedSince: request.headers['if-modified-since'],
            });

            const baseHeaders = {
                'content-type': 'application/pdf',
                etag: '"media-etag"',
                'accept-ranges': 'bytes',
                'cache-control': 'public, max-age=604800, must-revalidate',
                'last-modified': 'Wed, 01 Jan 2025 00:00:00 GMT',
            };

            if (request.headers['if-none-match'] === '"media-etag"') {
                response.writeHead(304, 'Not Modified', baseHeaders);
                response.end();
                return;
            }

            if (request.headers.range === 'bytes=0-3') {
                response.writeHead(206, 'Partial Content', {
                    ...baseHeaders,
                    'content-range': 'bytes 0-3/10',
                    'content-length': '4',
                });
                if (request.method !== 'HEAD') response.end('medi');
                else response.end();
                return;
            }

            response.writeHead(200, 'OK', {
                ...baseHeaders,
                'content-length': '10',
            });
            if (request.method !== 'HEAD') response.end('media-body');
            else response.end();
            return;
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

    return {
        url: `http://127.0.0.1:${address.port}/`,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

async function startApp({ upstreamUrl, searchIndexingEnabled }) {
    const port = await getFreePort();
    const child = spawn(process.execPath, ['build'], {
        cwd: process.cwd(),
        env: {
            ...process.env,
            PORT: String(port),
            HOST: '127.0.0.1',
            UMBRACO_BASE_URL: upstreamUrl,
            CMS_PUBLIC_URL: 'https://cms.example.test/',
            SITE_URL: 'https://www.example.test/',
            SEARCH_INDEXING_ENABLED: searchIndexingEnabled ? 'true' : 'false',
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

async function runRouteChecks(origin) {
    await expectRedirect(origin, '/', 307, '/2024/', {
        headers: { accept: 'text/html' },
    });
    await expectRedirect(origin, '/?utm=1', 307, '/2024/');
    await expectRedirect(origin, '/register?utm=1', 308, '/register/?utm=1');
    await expectRedirect(origin, '/register/', 308, '/2024/register/');
    await expectRedirect(origin, '/tickets?utm=1', 308, '/tickets/?utm=1');
    await expectRedirect(origin, '/tickets/?utm=1', 307, '/register/');
    await expectRedirect(origin, '/speak/', 307, '/2024/');
    await expectRedirect(origin, '/umbraco/', 307, 'https://cms.example.test/');
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
    await expectRedirect(
        origin,
        '/cms-media/media/file.pdf/',
        308,
        '/cms-media/media/file.pdf',
    );
    await expectRedirect(origin, '/robots.txt/', 308, '/robots.txt');

    assert.equal((await request(origin, '/nocall/speak/')).status, 404);
    assert.equal(
        (await request(origin, '/2024/sessions/not-a-page/')).status,
        404,
    );
    assert.equal((await request(origin, '/sitemap.xml')).status, 404);

    state.conferences = [];
    assert.equal((await request(origin, '/')).status, 404);
    state.conferences = [
        conference('2023', '2023-09-01T09:00:00Z'),
        conference(
            '2024',
            '2024-09-01T09:00:00Z',
            'https://sessionize.example/method-2024/',
        ),
    ];
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

    const notFound = await expectHead(origin, '/2024/nope/', 404);
    assertDefaultSharedHead(notFound.head, '/2024/nope/');
    assert.equal(countHeadTags(notFound.head, /name="robots"/g), 1);
    assert.match(notFound.head, /<meta name="robots" content="noindex"/);
    assert.equal(countHeadTags(notFound.head, /property="og:image"/g), 1);
    const shellIndex = notFound.html.indexOf('next-error-shell');
    const footerIndex = notFound.html.indexOf('<footer');
    assert.ok(shellIndex >= 0, '404 shell missing');
    assert.ok(footerIndex > shellIndex, '404 footer should render below shell');
    const notFoundCss = await stylesheetText(
        origin,
        '/2024/nope/',
        notFound.head,
    );
    assert.match(notFoundCss, /height:\s*100vh/);
    assert.match(notFoundCss, /font-family:\s*system-ui/);
}

async function runRobotChecks(upstreamUrl) {
    const before = state.cmsRequests;
    const enabledApp = await startApp({
        upstreamUrl,
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
        await runHeadChecks(enabledApp.origin, {
            searchIndexingEnabled: true,
        });
    } finally {
        await enabledApp.close();
    }

    const disabledApp = await startApp({
        upstreamUrl,
        searchIndexingEnabled: false,
    });
    try {
        await expectText(
            disabledApp.origin,
            '/robots.txt',
            200,
            'User-Agent: *\nDisallow: /\n\n',
        );
        await runHeadChecks(disabledApp.origin, {
            searchIndexingEnabled: false,
        });
    } finally {
        await disabledApp.close();
    }
    assert.equal(state.cmsRequests, before, 'robots should not hit CMS');
}

async function runImageOptimizerChecks(origin) {
    state.mediaRequests = [];

    const imagePath = `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg?width=20&height=10')}&w=32&q=75`;
    await expectRedirect(
        origin,
        imagePath.replace('/_image?', '/_image/?'),
        308,
        imagePath,
    );

    const image = await request(origin, imagePath, {
        headers: {
            accept: 'image/webp,image/apng,*/*',
        },
    });
    const imageBytes = new Uint8Array(await image.arrayBuffer());
    const imageMetadata = await sharp(imageBytes).metadata();

    assert.equal(image.status, 200);
    assert.equal(image.headers.get('content-type'), 'image/webp');
    assert.equal(
        image.headers.get('cache-control'),
        'public, max-age=604800, must-revalidate',
    );
    assert.equal(image.headers.get('vary'), 'Accept');
    assert.equal(
        image.headers.get('content-length'),
        String(imageBytes.length),
    );
    assert.match(image.headers.get('etag') ?? '', /^"[A-Za-z0-9_-]+"$/);
    assert.equal(imageMetadata.width, 20);
    assert.equal(imageMetadata.height, 10);
    assert.deepEqual(state.mediaRequests.at(-1), {
        method: 'GET',
        path: '/media/image.jpg',
        search: '?width=20&height=10',
        accept: '*/*',
        range: undefined,
        ifNoneMatch: undefined,
        ifModifiedSince: undefined,
    });

    const cropped = await request(
        origin,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg?crop=0,0,1,1&maxsize=50')}&w=32&q=75`,
        { headers: { accept: 'image/webp' } },
    );
    assert.equal(cropped.status, 200);
    assert.equal(
        state.mediaRequests.at(-1).search,
        '?crop=0%2C0%2C1%2C1&maxsize=50',
    );

    const notModified = await request(origin, imagePath, {
        headers: {
            accept: 'image/webp',
            'if-none-match': image.headers.get('etag'),
        },
    });
    assert.equal(notModified.status, 304);
    assert.equal(await notModified.text(), '');
    assert.equal(notModified.headers.get('etag'), image.headers.get('etag'));

    const head = await request(origin, imagePath, {
        method: 'HEAD',
        headers: { accept: 'image/webp' },
    });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get('content-type'), 'image/webp');
    assert.equal(TEXT_ENCODER.encode(await head.text()).byteLength, 0);

    const jpegFallback = await request(origin, imagePath, {
        headers: { accept: 'image/jpeg,*/*' },
    });
    assert.equal(jpegFallback.status, 200);
    assert.equal(jpegFallback.headers.get('content-type'), 'image/jpeg');

    const acceptCases = [
        ['image/webp;q=1,image/jpeg', 'image/webp'],
        ['image/webp;foo=bar;q=.5,image/jpeg', 'image/webp'],
        ['image/webp;q=0,image/jpeg,*/*;q=.8', 'image/jpeg'],
        ['image/*,*/*', 'image/jpeg'],
        ['*/*', 'image/jpeg'],
        ['', 'image/jpeg'],
        ['IMAGE/WEBP,image/jpeg', 'image/jpeg'],
    ];

    for (const [accept, contentType] of acceptCases) {
        const response = await request(origin, imagePath, {
            headers: { accept },
        });
        assert.equal(response.status, 200, accept);
        assert.equal(response.headers.get('content-type'), contentType, accept);
    }

    const privateCache = await request(
        origin,
        `/_image?url=${encodeURIComponent('/cms-media/media/private-image.jpg')}&w=32&q=75`,
        { headers: { accept: 'image/webp' } },
    );
    assert.equal(privateCache.status, 200);
    assert.equal(
        privateCache.headers.get('cache-control'),
        'private, no-store',
    );

    const cases = [
        `/_image?url=${encodeURIComponent('https://example.com/image.jpg')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('//example.com/image.jpg')}&w=32&q=75`,
        '/_image?url=%E0%A4%A&w=32&q=75',
        `/_image?url=${encodeURIComponent('/cms-media/../secret.jpg')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/file.pdf')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg#fragment')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg?format=webp')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg?width=0')}&w=32&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg')}&w=33&q=75`,
        `/_image?url=${encodeURIComponent('/cms-media/media/image.jpg')}&w=32&q=80`,
    ];

    for (const path of cases) {
        const response = await request(origin, path, {
            headers: { accept: 'image/webp' },
        });
        assert.equal(response.status, 400, path);
    }

    const tooLarge = await request(
        origin,
        `/_image?url=${encodeURIComponent('/cms-media/media/too-large.jpg')}&w=32&q=75`,
        { headers: { accept: 'image/webp' } },
    );
    assert.equal(tooLarge.status, 502);

    const redirect = await request(
        origin,
        `/_image?url=${encodeURIComponent('/cms-media/media/redirect.jpg')}&w=32&q=75`,
        { headers: { accept: 'image/webp' } },
    );
    assert.equal(redirect.status, 502);

    const processingFailure = await request(
        origin,
        `/_image?url=${encodeURIComponent('/cms-media/media/broken.jpg')}&w=32&q=75`,
        { headers: { accept: 'image/webp' } },
    );
    assert.equal(processingFailure.status, 502);
    assert.equal(await processingFailure.text(), 'Image optimization failed');
}

async function runMediaChecks(origin) {
    state.mediaRequests = [];

    const media = await request(
        origin,
        '/cms-media/media/a%20b/%23file.pdf?width=10&format=webp',
        {
            headers: {
                accept: 'application/pdf',
            },
        },
    );
    assert.equal(media.status, 200);
    assert.equal(media.statusText, 'OK');
    assert.equal(media.headers.get('content-type'), 'application/pdf');
    assert.equal(media.headers.get('etag'), '"media-etag"');
    assert.equal(
        media.headers.get('cache-control'),
        'public, max-age=604800, must-revalidate',
    );
    assert.equal(await media.text(), 'media-body');
    assert.deepEqual(state.mediaRequests.at(-1), {
        method: 'GET',
        path: '/media/a%20b/%23file.pdf',
        search: '?width=10&format=webp',
        accept: 'application/pdf',
        range: undefined,
        ifNoneMatch: undefined,
        ifModifiedSince: undefined,
    });

    const range = await request(origin, '/cms-media/media/file.pdf', {
        headers: {
            range: 'bytes=0-3',
        },
    });
    assert.equal(range.status, 206);
    assert.equal(range.statusText, 'Partial Content');
    assert.equal(range.headers.get('content-range'), 'bytes 0-3/10');
    assert.equal(range.headers.get('accept-ranges'), 'bytes');
    assert.equal(await range.text(), 'medi');

    const notModified = await request(origin, '/cms-media/media/file.pdf', {
        headers: {
            'if-none-match': '"media-etag"',
            'if-modified-since': 'Wed, 01 Jan 2025 00:00:00 GMT',
        },
    });
    assert.equal(notModified.status, 304);
    assert.equal(notModified.statusText, 'Not Modified');
    assert.equal(await notModified.text(), '');
    assert.equal(state.mediaRequests.at(-1).ifNoneMatch, '"media-etag"');
    assert.equal(
        state.mediaRequests.at(-1).ifModifiedSince,
        'Wed, 01 Jan 2025 00:00:00 GMT',
    );

    const head = await request(origin, '/cms-media/media/file.pdf', {
        method: 'HEAD',
        headers: {
            range: 'bytes=0-3',
        },
    });
    assert.equal(head.status, 206);
    assert.equal(head.headers.get('content-length'), '4');
    assert.equal(TEXT_ENCODER.encode(await head.text()).byteLength, 0);
    assert.equal(state.mediaRequests.at(-1).method, 'HEAD');
}

const upstream = await startUpstream();
try {
    await runRobotChecks(upstream.url);

    const app = await startApp({
        upstreamUrl: upstream.url,
        searchIndexingEnabled: true,
    });
    try {
        await runRouteChecks(app.origin);
        await runMobileChecks(app.origin);
        await runHeadChecks(app.origin, { searchIndexingEnabled: true });
        await runMediaChecks(app.origin);
        await runImageOptimizerChecks(app.origin);
    } finally {
        await app.close();
    }
} finally {
    await upstream.close();
}
