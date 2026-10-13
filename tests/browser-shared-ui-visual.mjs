#!/usr/bin/env node
/* global WebSocket, console, fetch, process */

import { spawn, spawnSync } from 'node:child_process';
import {
    existsSync,
    mkdirSync,
    rmSync,
    symlinkSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request as httpRequest } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const outputRoot =
    process.env.SHARED_UI_BROWSER_OUT ??
    join(tmpdir(), 'methodconf-shared-ui-browser');
const fixtureRoot = join(outputRoot, 'fixture-copy');
const port = Number(process.env.PORT ?? 4296);
const local = `http://127.0.0.1:${port}`;
const live = process.env.LIVE_SITE_URL ?? 'https://www.methodconf.com';
const chromeBin = process.env.CHROME_BIN ?? '/usr/bin/google-chrome';
const chromeUserAgent =
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const fixtureServer = `import { error } from '@sveltejs/kit';
import { getConference } from '#lib/server/getConference.ts';
import { getSponsors } from '#lib/server/getSponsors.ts';
export async function load({ fetch }) {
    const conference = await getConference('2024', fetch);
    if (!conference) error(500, 'Missing conference fixture data');
    const sponsors = await getSponsors(conference.id, fetch);
    return { conference, sponsors };
}
`;

const fixturePage = `<script lang="ts">
    import { APPLE_APP_STORE_LINK, GOOGLE_PLAY_STORE_LINK } from '#lib/config.ts';
    import Button from '#lib/components/Button.svelte';
    import HomeNav from '#lib/components/HomeNav.svelte';
    import SponsorsBlock from '#lib/components/SponsorsBlock.svelte';
    import TextInput from '#lib/components/TextInput.svelte';
    import type { PageData } from './$types';
    let { data }: { data: PageData } = $props();
    let name = $state('');
    let email = $state('');
    let company = $state('');
</script>

<HomeNav params={{ conference: '2024' }} conference={data.conference} />
<section class="flex flex-col lg:flex-row" data-fixture="intro-newsletter">
    <div class="bg-gray-100 py-16 lg:w-1/2 lg:px-5">
        <div class="content-container lg:max-w-[500px]">
            <div class="mb-8">
                <h2 class="font-bold text-xl lg:text-4xl">Invest In Yourself and Hone Your Craft</h2>
                <p>Method Conference Springfield, MO is an immersive one-day conference with three tracks, two one-hour session tracks, a workshop track, and a keynote. All with an intense focus on digital development, design, UX, content, code, and more.</p>
            </div>
            <a href="/2024/register/" class="button inline-block mb-8">Register Now</a>
            <h3 class="font-bold text-xl lg:text-2xl mb-4">Download Our Mobile App!</h3>
            <div class="flex space-x-4">
                <a class="block" href={APPLE_APP_STORE_LINK} title="Download iOS app"><img src="/app-store.svg" alt="Download on the App Store" height="55" /></a>
                <a class="block" href={GOOGLE_PLAY_STORE_LINK} title="Download android app"><img src="/play-store.svg" alt="Get it on Google Play" height="55" /></a>
            </div>
        </div>
    </div>
    <div class="lg:w-1/2 lg:px-5">
        <div class="content-container max-w-[650px] lg:max-w-[400px] mx-auto py-8 lg:pt-16">
            <p class="font-bold text-xl mb-4">Stay in-the-know about event updates and new speaker announcements.</p>
            <form action="" data-fixture="newsletter-form">
                <TextInput class="mb-4" label="Name" name="name" bind:value={name} />
                <TextInput class="mb-4" label="Email" name="email" type="email" bind:value={email} required />
                <label for="fixture-company" class="sr-only">Leave this field empty</label>
                <input type="text" id="fixture-company" name="company" class="sr-only" tabindex="-1" autocomplete="off" bind:value={company} />
                <button class="button" type="submit">Email Signup</button>
            </form>
        </div>
    </div>
</section>
<SponsorsBlock sponsors={data.sponsors} />
`;

const defaultTitle = 'Method Conference - October 12th 2024 - Springfield, MO';
const notFoundTitle = '404: This page could not be found.';
const fixtureLeafTitle = 'Fixture leaf title';
const fixtureLeafOgTitle = 'Fixture leaf OG title';

const headFixtureServer = `import { buildSharedHead } from '#lib/head.ts';
import { getSiteUrl } from '#lib/server/config.ts';

export function load() {
    return {
        sharedHead: buildSharedHead({
            siteUrl: getSiteUrl().toString(),
            metadata: {
                title: '${fixtureLeafTitle}',
                openGraph: { title: '${fixtureLeafOgTitle}' },
            },
        }),
    };
}
`;

const headFixturePage = `<h1>Head fixture</h1>
<a data-fixture="to-404" href="/fixture-404/">Missing fixture</a>
`;

const defaultFixturePage = `<h1>Default fixture</h1>
<a data-fixture="to-404" href="/fixture-404/">Missing fixture</a>
<a data-fixture="to-500" href="/fixture-500/">Server error fixture</a>
`;

const notFoundFixture = `import { error } from '@sveltejs/kit';

export function load() {
    error(404, 'Not found');
}
`;

const serverErrorFixture = `import { error } from '@sveltejs/kit';

export function load() {
    error(500, 'Probe failure');
}
`;

function run(command, args, options = {}) {
    const result = spawnSync(command, args, {
        cwd: options.cwd ?? root,
        env: options.env ?? process.env,
        stdio: options.stdio ?? 'inherit',
    });
    if (result.status !== 0) {
        throw new Error(
            `${command} ${args.join(' ')} failed with ${result.status}`,
        );
    }
    return result;
}

function httpJson(portNumber, path) {
    return new Promise((resolve, reject) => {
        const request = httpRequest(
            { host: '127.0.0.1', port: portNumber, path },
            (response) => {
                let data = '';
                response.setEncoding('utf8');
                response.on('data', (chunk) => {
                    data += chunk;
                });
                response.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(error);
                    }
                });
            },
        );
        request.on('error', reject);
        request.end();
    });
}

async function waitForHttp(url, attempts = 160) {
    for (let index = 0; index < attempts; index += 1) {
        try {
            const response = await fetch(url, {
                headers: { 'user-agent': chromeUserAgent },
            });
            if (response.status < 500) return;
        } catch {
            // retry below
        }
        await delay(250);
    }
    throw new Error(`server did not become ready: ${url}`);
}

class ChromeSession {
    constructor() {
        this.port = 12000 + Math.floor(Math.random() * 1000);
        this.profile = join(
            outputRoot,
            `chrome-profile-${process.pid}-${this.port}`,
        );
        this.nextId = 1;
        this.pending = new Map();
        this.consoleMessages = [];
    }

    async start() {
        this.process = spawn(
            chromeBin,
            [
                '--headless=new',
                `--remote-debugging-port=${this.port}`,
                '--remote-allow-origins=*',
                `--user-data-dir=${this.profile}`,
                '--no-first-run',
                '--no-default-browser-check',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--force-device-scale-factor=1',
                'about:blank',
            ],
            { stdio: ['ignore', 'pipe', 'pipe'] },
        );
        this.stderr = '';
        this.process.stderr.on('data', (data) => {
            this.stderr += data.toString();
        });

        for (let index = 0; index < 160; index += 1) {
            try {
                await httpJson(this.port, '/json/version');
                break;
            } catch {
                await delay(100);
            }
            if (index === 159)
                throw new Error(
                    `Chrome did not start: ${this.stderr.slice(-1000)}`,
                );
        }

        const targets = await httpJson(this.port, '/json/list');
        const target = targets.find((item) => item.type === 'page');
        this.ws = new WebSocket(target.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            this.ws.addEventListener('open', resolve, { once: true });
            this.ws.addEventListener('error', reject, { once: true });
        });
        this.ws.addEventListener('message', (event) =>
            this.onMessage(JSON.parse(event.data)),
        );
        await this.cdp('Page.enable');
        await this.cdp('Runtime.enable');
        await this.cdp('Log.enable');
        await this.cdp('Network.enable');
        await this.cdp('Network.setUserAgentOverride', {
            userAgent: chromeUserAgent,
        });
    }

    onMessage(message) {
        if (message.method === 'Runtime.consoleAPICalled') {
            this.consoleMessages.push({
                source: 'console',
                type: message.params.type,
                text: message.params.args
                    .map((arg) => arg.value ?? arg.description ?? '')
                    .join(' '),
            });
        }
        if (message.method === 'Runtime.exceptionThrown') {
            this.consoleMessages.push({
                source: 'exception',
                type: 'error',
                text: message.params.exceptionDetails?.text ?? 'exception',
            });
        }
        if (message.method === 'Log.entryAdded') {
            this.consoleMessages.push({
                source: 'log',
                type: message.params.entry.level,
                text: message.params.entry.text,
            });
        }
        if (message.id && this.pending.has(message.id)) {
            const { resolve, reject } = this.pending.get(message.id);
            this.pending.delete(message.id);
            if (message.error) reject(new Error(JSON.stringify(message.error)));
            else resolve(message.result ?? {});
        }
    }

    cdp(method, params = {}) {
        const id = this.nextId;
        this.nextId += 1;
        this.ws.send(JSON.stringify({ id, method, params }));
        return new Promise((resolve, reject) =>
            this.pending.set(id, { resolve, reject }),
        );
    }

    async evaluate(expression) {
        const result = await this.cdp('Runtime.evaluate', {
            expression,
            awaitPromise: true,
            returnByValue: true,
        });
        if (result.exceptionDetails)
            throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result?.value;
    }

    async waitForExpression(expression, attempts = 80) {
        for (let index = 0; index < attempts; index += 1) {
            if (await this.evaluate(expression)) return;
            await delay(100);
        }
        throw new Error(`timed out waiting for ${expression}`);
    }

    async navigate(url, viewport) {
        await this.cdp('Emulation.setDeviceMetricsOverride', {
            width: viewport.width,
            height: viewport.height,
            deviceScaleFactor: 1,
            mobile: false,
        });
        await this.cdp(
            'Emulation.setTouchEmulationEnabled',
            viewport.touch
                ? { enabled: true, maxTouchPoints: 1 }
                : { enabled: false },
        );
        await this.cdp('Page.navigate', { url });
        for (let index = 0; index < 220; index += 1) {
            if ((await this.evaluate('document.readyState')) === 'complete')
                break;
            await delay(100);
        }
        await this.evaluate(
            'document.fonts?.ready ? document.fonts.ready.then(() => true) : true',
        );
        await delay(250);
    }

    async settleSponsors() {
        await this.evaluate(`(async () => {
            const root = document.querySelector('#sponsor');
            root.scrollIntoView({ block: 'start', inline: 'nearest' });
            await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            for (const img of root.querySelectorAll('img')) {
                img.scrollIntoView({ block: 'center', inline: 'nearest' });
                await new Promise((resolve) => requestAnimationFrame(resolve));
                if (!img.complete) await new Promise((resolve) => {
                    img.addEventListener('load', resolve, { once: true });
                    img.addEventListener('error', resolve, { once: true });
                });
            }
            root.scrollIntoView({ block: 'start', inline: 'nearest' });
            await document.fonts.ready;
            await new Promise((resolve) => setTimeout(resolve, 500));
            return true;
        })()`);
    }

    async sponsorMeta() {
        return await this.evaluate(`(() => {
            const root = document.querySelector('#sponsor');
            const rect = (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, top: r.top + scrollY, left: r.left + scrollX }; };
            const css = (el) => { const s = getComputedStyle(el); return { color: s.color, fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, display: s.display, objectFit: s.objectFit, transform: s.transform }; };
            return {
                url: location.href,
                scrollY,
                viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
                body: { box: rect(document.body), css: css(document.body) },
                main: document.querySelector('main') ? { box: rect(document.querySelector('main')), css: css(document.querySelector('main')) } : null,
                root: { box: rect(root), css: css(root), text: root.textContent.replace(/\\s+/g, ' ').trim() },
                imgs: [...root.querySelectorAll('img')].map((img) => ({ alt: img.alt, currentSrc: img.currentSrc, widthAttr: img.getAttribute('width'), heightAttr: img.getAttribute('height'), naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, complete: img.complete, box: rect(img), css: css(img) })),
                headings: [...root.querySelectorAll('h1,h2,h3,p')].map((el) => ({ tag: el.tagName, text: el.textContent.replace(/\\s+/g, ' ').trim(), box: rect(el), css: css(el) })),
            };
        })()`);
    }

    async captureSponsor(url, viewport) {
        await this.navigate(url, viewport);
        await this.settleSponsors();
        return await this.sponsorMeta();
    }

    async stop() {
        try {
            this.ws?.close();
        } catch {
            // ignore cleanup errors
        }
        this.process?.kill('SIGTERM');
        await delay(200);
        if (existsSync(this.profile))
            rmSync(this.profile, { recursive: true, force: true });
    }
}

function boxDelta(liveBox, candidateBox, rootLive, rootCandidate) {
    return {
        x: candidateBox.x - liveBox.x,
        width: candidateBox.width - liveBox.width,
        height: candidateBox.height - liveBox.height,
        yRelative: candidateBox.y - rootCandidate.y - (liveBox.y - rootLive.y),
    };
}

function assertNear(value, limit, label, failures) {
    if (Math.abs(value) > limit) failures.push(`${label}: ${value}`);
}

function compactText(value) {
    return value.replace(/\s+/g, '');
}

function headHtml(html) {
    return /<head[^>]*>([\s\S]*?)<\/head>/i.exec(html)?.[1] ?? '';
}

function countHeadTags(head, pattern) {
    return (head.match(pattern) ?? []).length;
}

function assertSharedHeadCounts(head, label, failures) {
    const expectations = [
        [/property="og:title"/g, 1, 'og:title'],
        [/property="og:image"/g, 1, 'og:image'],
        [/name="twitter:card"/g, 1, 'twitter:card'],
        [/name="twitter:title"/g, 1, 'twitter:title'],
        [/name="twitter:image"/g, 1, 'twitter:image'],
    ];

    for (const [pattern, expected, name] of expectations) {
        const actual = countHeadTags(head, pattern);
        if (actual !== expected) {
            failures.push(
                `${label}: expected ${expected} ${name}, got ${actual}`,
            );
        }
    }
}

async function assertRawHead(localOrigin, failures) {
    const cases = [
        {
            path: '/fixture-404/',
            status: 404,
            title: defaultTitle,
            robots: '<meta name="robots" content="noindex"',
        },
        {
            path: '/fixture-500/',
            status: 500,
            title: '500: Probe failure',
            robots: '<meta name="robots" content="noindex"',
        },
    ];
    const results = [];

    for (const entry of cases) {
        const response = await fetch(`${localOrigin}${entry.path}`);
        const html = await response.text();
        const head = headHtml(html);
        const titleMatch = /<title>([^<]*)<\/title>/.exec(head);
        const title = titleMatch?.[1] ?? '';
        const robotsCount = countHeadTags(head, /name="robots"/g);

        results.push({
            path: entry.path,
            status: response.status,
            title,
            robotsCount,
        });

        if (response.status !== entry.status) {
            failures.push(
                `${entry.path}: expected status ${entry.status}, got ${response.status}`,
            );
        }
        if (countHeadTags(head, /<title[\s>]/g) !== 1) {
            failures.push(`${entry.path}: expected one title tag`);
        }
        if (title !== entry.title) {
            failures.push(`${entry.path}: title ${title}`);
        }
        if (robotsCount !== 1 || !head.includes(entry.robots)) {
            failures.push(`${entry.path}: robots noindex count/value mismatch`);
        }
        assertSharedHeadCounts(head, entry.path, failures);
    }

    return results;
}

function prepareFixture() {
    rmSync(outputRoot, { recursive: true, force: true });
    mkdirSync(outputRoot, { recursive: true });
    run('rsync', [
        '-a',
        '--exclude',
        '.git',
        '--exclude',
        'node_modules',
        '--exclude',
        '.next',
        '--exclude',
        '.svelte-kit',
        '--exclude',
        'build',
        `${root}/`,
        `${fixtureRoot}/`,
    ]);
    symlinkSync(
        join(root, 'node_modules'),
        join(fixtureRoot, 'node_modules'),
        'dir',
    );
    const routeDir = join(fixtureRoot, 'src/routes/fixture-home');
    mkdirSync(routeDir, { recursive: true });
    writeFileSync(join(routeDir, '+page.server.ts'), fixtureServer);
    writeFileSync(join(routeDir, '+page.svelte'), fixturePage);

    const defaultRouteDir = join(fixtureRoot, 'src/routes/fixture-default');
    mkdirSync(defaultRouteDir, { recursive: true });
    writeFileSync(join(defaultRouteDir, '+page.svelte'), defaultFixturePage);

    const headRouteDir = join(fixtureRoot, 'src/routes/fixture-title');
    mkdirSync(headRouteDir, { recursive: true });
    writeFileSync(join(headRouteDir, '+page.server.ts'), headFixtureServer);
    writeFileSync(join(headRouteDir, '+page.svelte'), headFixturePage);

    const notFoundRouteDir = join(fixtureRoot, 'src/routes/fixture-404');
    mkdirSync(notFoundRouteDir, { recursive: true });
    writeFileSync(join(notFoundRouteDir, '+page.server.ts'), notFoundFixture);

    const errorRouteDir = join(fixtureRoot, 'src/routes/fixture-500');
    mkdirSync(errorRouteDir, { recursive: true });
    writeFileSync(join(errorRouteDir, '+page.server.ts'), serverErrorFixture);

    run('npm', ['run', 'build'], { cwd: fixtureRoot });
}

async function readBrowserHead(chrome) {
    return await chrome.evaluate(`(() => ({
        url: location.pathname,
        title: document.title,
        ogTitle: document.querySelector('meta[property="og:title"]')?.content ?? null,
        twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content ?? null,
        titleCount: document.querySelectorAll('title').length,
        robots: [...document.querySelectorAll('meta[name="robots"]')].map((node) => node.content),
        ogImageCount: document.querySelectorAll('meta[property="og:image"]').length,
        twitterImageCount: document.querySelectorAll('meta[name="twitter:image"]').length,
        csrMarker: window.__sharedUiCsrMarker ?? null,
    }))()`);
}

async function clickAndWaitForTitle(chrome, selector, marker, title) {
    await chrome.evaluate(`(() => {
        window.__sharedUiCsrMarker = ${JSON.stringify(marker)};
        document.querySelector(${JSON.stringify(selector)}).click();
        return true;
    })()`);
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(title)} && window.__sharedUiCsrMarker === ${JSON.stringify(marker)}`,
    );
}

async function historyBackAndWaitForTitle(chrome, marker, title) {
    await chrome.evaluate('history.back(); true');
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(title)} && window.__sharedUiCsrMarker === ${JSON.stringify(marker)}`,
    );
}

async function historyForwardAndWaitForTitle(chrome, marker, title) {
    await chrome.evaluate('history.forward(); true');
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(title)} && window.__sharedUiCsrMarker === ${JSON.stringify(marker)}`,
    );
}

async function assertBrowserTitleLifecycle(chrome, failures) {
    const titleViewport = { name: 'title-probe', width: 1024, height: 768 };
    const snapshots = [];

    await chrome.navigate(`${local}/fixture-404/`, titleViewport);
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(notFoundTitle)}`,
    );
    snapshots.push({
        step: 'direct hydrated 404',
        ...(await readBrowserHead(chrome)),
    });

    await chrome.navigate(`${local}/fixture-default/`, titleViewport);
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(defaultTitle)}`,
    );
    snapshots.push({
        step: 'normal default',
        ...(await readBrowserHead(chrome)),
    });
    await clickAndWaitForTitle(
        chrome,
        '[data-fixture="to-404"]',
        'default-to-404',
        notFoundTitle,
    );
    snapshots.push({
        step: 'default to 404',
        ...(await readBrowserHead(chrome)),
    });
    await historyBackAndWaitForTitle(chrome, 'default-to-404', defaultTitle);
    snapshots.push({
        step: '404 back to default',
        ...(await readBrowserHead(chrome)),
    });

    await chrome.navigate(`${local}/fixture-title/`, titleViewport);
    await chrome.waitForExpression(
        `document.title === ${JSON.stringify(fixtureLeafTitle)}`,
    );
    snapshots.push({ step: 'leaf custom', ...(await readBrowserHead(chrome)) });
    await clickAndWaitForTitle(
        chrome,
        '[data-fixture="to-404"]',
        'leaf-to-404',
        notFoundTitle,
    );
    snapshots.push({ step: 'leaf to 404', ...(await readBrowserHead(chrome)) });
    await historyBackAndWaitForTitle(chrome, 'leaf-to-404', fixtureLeafTitle);
    snapshots.push({
        step: '404 back to leaf',
        ...(await readBrowserHead(chrome)),
    });
    await historyForwardAndWaitForTitle(chrome, 'leaf-to-404', notFoundTitle);
    snapshots.push({
        step: 'forward to 404',
        ...(await readBrowserHead(chrome)),
    });
    await historyBackAndWaitForTitle(chrome, 'leaf-to-404', fixtureLeafTitle);
    snapshots.push({
        step: 'back again to leaf',
        ...(await readBrowserHead(chrome)),
    });

    await chrome.navigate(`${local}/fixture-default/`, titleViewport);
    await clickAndWaitForTitle(
        chrome,
        '[data-fixture="to-500"]',
        'default-to-500',
        '500: Probe failure',
    );
    snapshots.push({
        step: 'default to 500',
        ...(await readBrowserHead(chrome)),
    });
    await historyBackAndWaitForTitle(chrome, 'default-to-500', defaultTitle);
    snapshots.push({
        step: '500 back to default',
        ...(await readBrowserHead(chrome)),
    });

    const direct404 = snapshots.find(
        (item) => item.step === 'direct hydrated 404',
    );
    const defaultBack = snapshots.find(
        (item) => item.step === '404 back to default',
    );
    const leafBack = snapshots.find((item) => item.step === '404 back to leaf');
    const errorBack = snapshots.find(
        (item) => item.step === '500 back to default',
    );

    if (direct404?.title !== notFoundTitle)
        failures.push('direct hydrated 404 title mismatch');
    if (defaultBack?.title !== defaultTitle)
        failures.push('default title did not restore after 404');
    if (leafBack?.title !== fixtureLeafTitle)
        failures.push('leaf title did not restore after 404');
    if (leafBack?.ogTitle !== fixtureLeafOgTitle)
        failures.push('leaf og:title did not restore after 404');
    if (errorBack?.title !== defaultTitle)
        failures.push('default title did not restore after 500');

    for (const snapshot of snapshots) {
        if (snapshot.titleCount !== 1)
            failures.push(
                `${snapshot.step}: titleCount ${snapshot.titleCount}`,
            );
        if (
            snapshot.title === notFoundTitle ||
            snapshot.title.startsWith('500:')
        ) {
            if (
                snapshot.robots.length !== 1 ||
                snapshot.robots[0] !== 'noindex'
            ) {
                failures.push(
                    `${snapshot.step}: expected one noindex robots tag`,
                );
            }
        } else if (snapshot.robots.length !== 0) {
            failures.push(
                `${snapshot.step}: expected robots tags to be restored away`,
            );
        }
        if (snapshot.ogImageCount !== 1 || snapshot.twitterImageCount !== 1) {
            failures.push(`${snapshot.step}: OG/Twitter image count mismatch`);
        }
    }

    const hydrationConsoleErrors = chrome.consoleMessages.filter((message) => {
        const text = message.text.toLowerCase();
        return text.includes('hydration') || text.includes('svelte');
    });
    if (hydrationConsoleErrors.length > 0) {
        failures.push('Svelte hydration/browser console errors were reported');
    }

    return { snapshots, hydrationConsoleErrors };
}

prepareFixture();

const server = spawn(process.execPath, ['build'], {
    cwd: fixtureRoot,
    env: {
        ...process.env,
        PORT: String(port),
        HOST: '127.0.0.1',
        UMBRACO_BASE_URL: 'https://cms.methodconf.com/',
        CMS_PUBLIC_URL: 'https://cms.methodconf.com/',
        SITE_URL: 'https://www.methodconf.com/',
        SEARCH_INDEXING_ENABLED: 'true',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
});
let serverLog = '';
server.stdout.on('data', (data) => {
    serverLog += data.toString();
});
server.stderr.on('data', (data) => {
    serverLog += data.toString();
});

const viewports = [
    { name: 'desktop-1440x1000', width: 1440, height: 1000 },
    { name: 'tablet-1024x900', width: 1024, height: 900 },
    { name: 'mobile-390x844', width: 390, height: 844 },
    { name: 'narrow-touch-375x844', width: 375, height: 844, touch: true },
];

const chrome = new ChromeSession();
try {
    await waitForHttp(`${local}/fixture-home/`);
    await chrome.start();
    const results = [];
    const failures = [];
    const rawHead = await assertRawHead(local, failures);
    const titleLifecycle = await assertBrowserTitleLifecycle(chrome, failures);

    for (const viewport of viewports) {
        const liveMeta = await chrome.captureSponsor(`${live}/2024/`, viewport);
        const candidateMeta = await chrome.captureSponsor(
            `${local}/fixture-home/`,
            viewport,
        );
        const cta = candidateMeta.imgs.find((img) => img.alt === 'Method Logo');

        if (candidateMeta.root.css.color !== 'rgb(0, 0, 0)') {
            failures.push(
                `${viewport.name}: sponsor root color ${candidateMeta.root.css.color}`,
            );
        }
        if (candidateMeta.main?.css.color !== 'rgb(0, 0, 0)') {
            failures.push(
                `${viewport.name}: main color ${candidateMeta.main?.css.color}`,
            );
        }
        if (cta?.widthAttr !== '359' || cta?.heightAttr !== '78') {
            failures.push(
                `${viewport.name}: CTA attrs ${cta?.widthAttr}x${cta?.heightAttr}`,
            );
        }
        if (
            compactText(liveMeta.root.text) !==
            compactText(candidateMeta.root.text)
        ) {
            failures.push(`${viewport.name}: sponsor text content changed`);
        }
        if (
            !liveMeta.imgs.every((img) => img.complete) ||
            !candidateMeta.imgs.every((img) => img.complete)
        ) {
            failures.push(
                `${viewport.name}: sponsor images did not finish loading`,
            );
        }

        const imageGeometry = liveMeta.imgs.map((liveImg, index) => {
            const candidateImg = candidateMeta.imgs[index];
            const delta = boxDelta(
                liveImg.box,
                candidateImg.box,
                liveMeta.root.box,
                candidateMeta.root.box,
            );
            assertNear(
                delta.x,
                0.05,
                `${viewport.name} ${liveImg.alt} x`,
                failures,
            );
            assertNear(
                delta.width,
                0.05,
                `${viewport.name} ${liveImg.alt} width`,
                failures,
            );
            assertNear(
                delta.height,
                0.05,
                `${viewport.name} ${liveImg.alt} height`,
                failures,
            );
            assertNear(
                delta.yRelative,
                0.05,
                `${viewport.name} ${liveImg.alt} relative y`,
                failures,
            );
            return { label: liveImg.alt, delta };
        });

        results.push({
            viewport,
            colors: {
                liveRoot: liveMeta.root.css.color,
                candidateRoot: candidateMeta.root.css.color,
                candidateMain: candidateMeta.main?.css.color ?? null,
            },
            sectionHeight: {
                live: liveMeta.root.box.height,
                candidate: candidateMeta.root.box.height,
            },
            cta: {
                widthAttr: cta?.widthAttr ?? null,
                heightAttr: cta?.heightAttr ?? null,
            },
            imageGeometry,
            text: {
                live: liveMeta.root.text,
                candidate: candidateMeta.root.text,
            },
        });
    }

    const summary = {
        generatedAt: new Date().toISOString(),
        local,
        live,
        results,
        rawHead,
        titleLifecycle,
        failures,
        serverLog,
    };
    writeFileSync(
        join(outputRoot, 'browser-shared-ui-visual-summary.json'),
        JSON.stringify(summary, null, 2),
    );
    console.log(JSON.stringify(summary, null, 2));
    if (failures.length > 0) process.exitCode = 1;
} finally {
    await chrome.stop();
    server.kill('SIGTERM');
}
