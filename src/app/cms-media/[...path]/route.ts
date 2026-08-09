import { getUmbracoBaseUrl } from '@/serverConfig';

interface RouteContext {
    params: Promise<{ path: string[] }>;
}

async function proxyCmsMedia(
    request: Request,
    { params }: RouteContext,
): Promise<Response> {
    const { path } = await params;
    const upstreamUrl = new URL(
        path.map(encodeURIComponent).join('/'),
        `${getUmbracoBaseUrl().toString().replace(/\/$/, '')}/`,
    );
    upstreamUrl.search = new URL(request.url).search;

    const headers = new Headers();
    const accept = request.headers.get('accept');
    const range = request.headers.get('range');

    if (accept) headers.set('accept', accept);
    if (range) headers.set('range', range);

    const response = await fetch(upstreamUrl, {
        method: request.method,
        headers,
        next: { revalidate: 60 },
    });

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
    });
}

export const GET = proxyCmsMedia;
export const HEAD = proxyCmsMedia;
