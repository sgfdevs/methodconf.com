import {
    ImageOptimizerError,
    optimizeImageRequest,
    parseImageOptimizerRequest,
} from '#lib/server/imageOptimizer.ts';
import { redirectFromTrailingSlash } from '#lib/server/slashRedirect.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

function errorResponse(status: number, message: string): Response {
    return new Response(message, {
        status,
        headers: {
            'content-type': 'text/plain; charset=utf-8',
            'cache-control': 'no-store',
        },
    });
}

async function handleImage({ request, url }: Parameters<RequestHandler>[0]) {
    const canonicalRedirect = redirectFromTrailingSlash(url);

    if (canonicalRedirect) {
        return canonicalRedirect;
    }

    try {
        const optimizerRequest = parseImageOptimizerRequest(url);
        const optimized = await optimizeImageRequest(
            optimizerRequest,
            request.headers.get('accept'),
        );
        const headers = new Headers({
            'cache-control': optimized.cacheControl,
            'content-length': optimized.bytes.byteLength.toString(),
            'content-type': optimized.contentType,
            etag: optimized.etag,
            vary: 'Accept',
        });

        if (request.headers.get('if-none-match') === optimized.etag) {
            headers.delete('content-length');
            return new Response(null, { status: 304, headers });
        }

        if (request.method === 'HEAD') {
            return new Response(null, { headers });
        }

        const body = new ArrayBuffer(optimized.bytes.byteLength);
        new Uint8Array(body).set(optimized.bytes);

        return new Response(body, { headers });
    } catch (error) {
        if (error instanceof ImageOptimizerError) {
            return errorResponse(error.status, error.message);
        }

        console.error(error);
        return errorResponse(502, 'Image optimization failed');
    }
}

export const GET: RequestHandler = handleImage;
export const HEAD: RequestHandler = handleImage;
