import { getNewsletterConfig } from '#lib/server/config.ts';
import { handleNewsletterRequest } from '#lib/server/newsletter.ts';
import type { RequestHandler } from './$types';

export const trailingSlash = 'ignore';

export const GET: RequestHandler = () =>
    Response.json({ success: false }, { status: 405 });

export const POST: RequestHandler = async ({ request, fetch }) => {
    const result = await handleNewsletterRequest(
        request,
        getNewsletterConfig(),
        fetch,
    );

    return Response.json(result.body, { status: result.status });
};
