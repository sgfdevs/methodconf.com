import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function readProjectFile(path: string): string {
    return readFileSync(join(root, path), 'utf8');
}

describe('shared UI static assets and root shell', () => {
    it('self-hosts the live Source Sans 3 font contract and license', () => {
        const css = readProjectFile('src/app.css');
        const fontDir = join(root, 'static/fonts/source-sans-3');
        const fonts = [
            'da8a9dd0d68e512b-s.0n8i_inn0i2i9.woff2',
            '94b4a5dc1fe84361-s.3wm_n5jv1to7s.woff2',
            'ff5be760267bb4bc-s.3dkqd4mro2h3_.woff2',
            '99596c30eb072d3c-s.2fp9tilo6sy14.woff2',
            'e5864b32625b6bc3-s.0m7i6b77o5yxd.woff2',
            'e285ad1a914469f0-s.15241mr5-1s6i.woff2',
            '47df9ba1c7236d3b-s.p.137759vg1sbmi.woff2',
        ];

        for (const font of fonts) {
            expect(existsSync(join(fontDir, font))).toBe(true);
            expect(css).toContain(`/fonts/source-sans-3/${font}`);
        }

        expect(css.match(/font-family: "Source Sans 3";/g)).toHaveLength(7);
        expect(css).toContain('font-weight: 200 900;');
        expect(css).toContain('font-display: swap;');
        expect(css).toContain('font-family: "Source Sans 3 Fallback";');
        expect(css).toContain('ascent-override: 109.21%;');
        expect(css).toContain('descent-override: 42.66%;');
        expect(css).toContain('size-adjust: 93.76%;');
        expect(css).toContain(
            '--font-sans: "Source Sans 3", "Source Sans 3 Fallback";',
        );

        const license = readProjectFile('static/fonts/source-sans-3/OFL.txt');
        expect(license).toContain('SIL OPEN FONT LICENSE');
    });

    it('preloads only the Latin subset and keeps next-plausible script parity', () => {
        const layout = readProjectFile('src/routes/+layout.svelte');

        expect(layout).toContain('47df9ba1c7236d3b-s.p.137759vg1sbmi.woff2');
        expect(layout).not.toContain('e285ad1a914469f0-s.15241mr5-1s6i.woff2');
        expect(layout).toContain('next-plausible-script');
        expect(layout).toContain(
            'https://plausible.sgf.dev/js/pa-MKQsdxqo5_oFk0NmM56b1.js',
        );
        expect(layout).toContain('plausible.init()');
        expect(layout).toContain('<Footer />');
        expect(layout).not.toContain('page.status >= 400');
    });

    it('keeps a Next-like 404 shell distinct from generic errors', () => {
        const errorPage = readProjectFile('src/routes/+error.svelte');

        expect(errorPage).toContain('This page could not be found.');
        expect(errorPage).toContain('page.status === 404');
        expect(errorPage).toContain('page.status !== 404');
        expect(errorPage).toContain('page.status}: {page.error?.message');
        expect(errorPage).toContain('content="noindex"');
        expect(errorPage).toContain('system-ui');
        expect(errorPage).not.toContain('property="og:image"');
    });
});
