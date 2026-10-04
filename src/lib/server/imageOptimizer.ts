import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { getUmbracoBaseUrl } from '#lib/server/config.ts';

const ALLOWED_WIDTHS = new Set([
    32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840,
]);
const ALLOWED_QUALITIES = new Set([75, 100]);
const ALLOWED_CMS_QUERY_KEYS = new Set([
    'width',
    'height',
    'maxwidth',
    'maxheight',
    'maxsize',
    'crop',
    'mode',
    'anchor',
    'center',
    'rxy',
    'rnd',
]);
const REJECTED_EXTENSIONS = new Set(['.svg', '.pdf', '.gif']);
const SUPPORTED_UPSTREAM_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

export const IMAGE_UPSTREAM_TIMEOUT_MS = 7_000;
export const IMAGE_MAX_UPSTREAM_BYTES = 15 * 1024 * 1024;
export const IMAGE_MAX_INPUT_PIXELS = 40_000_000;

export class ImageOptimizerError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
    }
}

export interface ImageOptimizerRequest {
    source: string;
    upstreamUrl: URL;
    width: number;
    quality: 75 | 100;
}

export interface OptimizedImage {
    bytes: Uint8Array;
    contentType: string;
    etag: string;
    cacheControl: string;
}

function badRequest(message: string): never {
    throw new ImageOptimizerError(400, message);
}

function upstreamFailure(message: string): never {
    throw new ImageOptimizerError(502, message);
}

function getSingleParam(url: URL, name: string): string {
    const values = url.searchParams.getAll(name);

    if (values.length !== 1 || values[0] === '') {
        badRequest(`Expected one ${name} parameter`);
    }

    return values[0];
}

function decodeRawUrlParam(url: URL): string {
    const rawSearch = url.search.startsWith('?')
        ? url.search.slice(1)
        : url.search;
    const values = rawSearch
        .split('&')
        .filter(Boolean)
        .map((part) => {
            const [key, value = ''] = part.split('=', 2);
            return { key, value };
        })
        .filter(({ key }) => key === 'url');

    if (values.length !== 1 || values[0].value === '') {
        badRequest('Expected one url parameter');
    }

    try {
        return decodeURIComponent(values[0].value.replace(/\+/g, ' '));
    } catch {
        badRequest('Invalid url encoding');
    }
}

function parseIntegerParam(url: URL, name: string): number {
    const value = getSingleParam(url, name);

    if (!/^\d+$/.test(value)) {
        badRequest(`Invalid ${name} parameter`);
    }

    return Number(value);
}

function validateCmsQuery(searchParams: URLSearchParams): string {
    for (const [key, value] of searchParams) {
        const normalizedKey = key.toLowerCase();

        if (!ALLOWED_CMS_QUERY_KEYS.has(normalizedKey)) {
            badRequest(`Unsupported CMS image parameter: ${key}`);
        }

        if (
            ['width', 'height', 'maxwidth', 'maxheight', 'maxsize'].includes(
                normalizedKey,
            ) &&
            (!/^\d+$/.test(value) ||
                Number(value) < 1 ||
                Number(value) > 10_000)
        ) {
            badRequest(`Invalid CMS image dimension: ${key}`);
        }
    }

    return searchParams.toString();
}

function getSafeMediaPath(sourcePathname: string): string {
    if (!sourcePathname.startsWith('/cms-media/media/')) {
        badRequest('Images must use /cms-media/media/ paths');
    }

    const extension = sourcePathname
        .slice(sourcePathname.lastIndexOf('.'))
        .toLowerCase();

    if (REJECTED_EXTENSIONS.has(extension)) {
        badRequest('This media type is not optimized by /_image');
    }

    const mediaPath = sourcePathname.replace(/^\/cms-media\/?/, '');
    const safeSegments = mediaPath
        .split('/')
        .filter(Boolean)
        .map((segment) => {
            let decoded: string;

            try {
                decoded = decodeURIComponent(segment);
            } catch {
                badRequest('Invalid media path encoding');
            }

            if (
                decoded === '.' ||
                decoded === '..' ||
                decoded.includes('/') ||
                decoded.includes('\\') ||
                decoded.includes('\0')
            ) {
                badRequest('Invalid media path');
            }

            return encodeURIComponent(decoded);
        });

    if (safeSegments.length < 2 || safeSegments[0] !== 'media') {
        badRequest('Images must use /cms-media/media/ paths');
    }

    return safeSegments.join('/');
}

export function parseImageOptimizerRequest(url: URL): ImageOptimizerRequest {
    const source = decodeRawUrlParam(url);

    if (/^[a-z][a-z\d+.-]*:/i.test(source) || source.startsWith('//')) {
        badRequest('Absolute image URLs are not allowed');
    }

    if (!source.startsWith('/')) {
        badRequest('Image URL must be root-relative');
    }

    const sourceUrl = new URL(source, 'http://methodconf.local');

    if (sourceUrl.origin !== 'http://methodconf.local') {
        badRequest('Image URL must be local');
    }

    if (sourceUrl.hash) {
        badRequest('Image URL fragments are not supported');
    }

    const width = parseIntegerParam(url, 'w');
    const quality = parseIntegerParam(url, 'q');

    if (!ALLOWED_WIDTHS.has(width)) {
        badRequest('Unsupported image width');
    }

    if (!ALLOWED_QUALITIES.has(quality)) {
        badRequest('Unsupported image quality');
    }

    const upstreamUrl = new URL(
        getSafeMediaPath(sourceUrl.pathname),
        `${getUmbracoBaseUrl().toString().replace(/\/$/, '')}/`,
    );
    const cmsSearch = validateCmsQuery(sourceUrl.searchParams);
    upstreamUrl.search = cmsSearch;

    return {
        source,
        upstreamUrl,
        width,
        quality: quality as 75 | 100,
    };
}

function acceptsWebp(accept: string | null): boolean {
    return accept?.toLowerCase().includes('image/webp') ?? false;
}

function chooseOutputType(
    upstreamContentType: string,
    accept: string | null,
): 'webp' | 'jpeg' | 'png' {
    if (acceptsWebp(accept)) {
        return 'webp';
    }

    if (upstreamContentType === 'image/jpeg') {
        return 'jpeg';
    }

    if (upstreamContentType === 'image/png') {
        return 'png';
    }

    if (upstreamContentType === 'image/webp') {
        return 'webp';
    }

    upstreamFailure('Unsupported upstream image type');
}

function contentTypeForOutput(outputType: 'webp' | 'jpeg' | 'png'): string {
    if (outputType === 'jpeg') return 'image/jpeg';
    if (outputType === 'png') return 'image/png';
    return 'image/webp';
}

function responseCacheControl(upstreamHeaders: Headers): string {
    return (
        upstreamHeaders.get('cache-control') ??
        'public, max-age=604800, must-revalidate'
    );
}

async function readLimitedBody(response: Response): Promise<Uint8Array> {
    const contentLength = response.headers.get('content-length');

    if (contentLength && Number(contentLength) > IMAGE_MAX_UPSTREAM_BYTES) {
        upstreamFailure('Upstream image is too large');
    }

    if (!response.body) {
        upstreamFailure('Upstream image response has no body');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        total += value.byteLength;

        if (total > IMAGE_MAX_UPSTREAM_BYTES) {
            await reader.cancel();
            upstreamFailure('Upstream image is too large');
        }

        chunks.push(value);
    }

    const bytes = new Uint8Array(total);
    let offset = 0;

    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return bytes;
}

async function fetchUpstreamImage(upstreamUrl: URL): Promise<Response> {
    try {
        const response = await fetch(upstreamUrl, {
            redirect: 'manual',
            signal: AbortSignal.timeout(IMAGE_UPSTREAM_TIMEOUT_MS),
        });

        if (response.status === 404) {
            throw new ImageOptimizerError(404, 'Image not found');
        }

        if (response.status >= 300 && response.status < 400) {
            upstreamFailure('Upstream image redirects are not allowed');
        }

        if (!response.ok) {
            upstreamFailure('Upstream image request failed');
        }

        return response;
    } catch (error) {
        if (error instanceof ImageOptimizerError) throw error;
        upstreamFailure('Upstream image request failed');
    }
}

export async function optimizeImageBuffer({
    input,
    width,
    quality,
    upstreamContentType,
    accept,
}: {
    input: Uint8Array;
    width: number;
    quality: 75 | 100;
    upstreamContentType: string;
    accept: string | null;
}): Promise<{ bytes: Uint8Array; contentType: string }> {
    const outputType = chooseOutputType(upstreamContentType, accept);
    const pipeline = sharp(input, {
        limitInputPixels: IMAGE_MAX_INPUT_PIXELS,
        sequentialRead: true,
    });
    const metadata = await pipeline.metadata();

    if ((metadata.pages ?? 1) > 1) {
        badRequest('Animated images are not optimized by /_image');
    }

    let transformed = pipeline.rotate().resize(width, undefined, {
        withoutEnlargement: true,
    });

    if (outputType === 'webp') {
        transformed = transformed.webp({ quality });
    } else if (outputType === 'jpeg') {
        transformed = transformed.jpeg({ quality, mozjpeg: true });
    } else {
        transformed = transformed.png({ quality });
    }

    return {
        bytes: await transformed.toBuffer(),
        contentType: contentTypeForOutput(outputType),
    };
}

export async function optimizeImageRequest(
    optimizerRequest: ImageOptimizerRequest,
    accept: string | null,
): Promise<OptimizedImage> {
    const upstream = await fetchUpstreamImage(optimizerRequest.upstreamUrl);
    const upstreamContentType =
        upstream.headers
            .get('content-type')
            ?.split(';')[0]
            ?.trim()
            .toLowerCase() ?? '';

    if (!SUPPORTED_UPSTREAM_TYPES.has(upstreamContentType)) {
        upstreamFailure('Unsupported upstream image type');
    }

    const input = await readLimitedBody(upstream);
    const { bytes, contentType } = await optimizeImageBuffer({
        input,
        width: optimizerRequest.width,
        quality: optimizerRequest.quality,
        upstreamContentType,
        accept,
    });
    const digest = createHash('sha256').update(bytes).digest('base64url');

    return {
        bytes,
        contentType,
        etag: `"${digest}"`,
        cacheControl: responseCacheControl(upstream.headers),
    };
}
