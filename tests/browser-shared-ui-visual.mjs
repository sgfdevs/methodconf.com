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
        await this.cdp('Network.enable');
        await this.cdp('Network.setUserAgentOverride', {
            userAgent: chromeUserAgent,
        });
    }

    onMessage(message) {
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
    run('npm', ['run', 'build'], { cwd: fixtureRoot });
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
        SEARCH_INDEXING_ENABLED: 'false',
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
