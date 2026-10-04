import { redirect } from '@sveltejs/kit';
import { getMobileAppStoreRedirect } from '#lib/mobileApp.ts';
import type { PageServerLoad } from './$types';

export const trailingSlash = 'ignore';

export const load: PageServerLoad = ({ request, url }) => {
    if (!url.pathname.endsWith('/')) {
        redirect(308, `${url.pathname}/${url.search}`);
    }

    const userAgent = request.headers.get('user-agent');

    if (!userAgent) {
        redirect(307, '/');
    }

    const appStoreUrl = getMobileAppStoreRedirect(userAgent);

    if (appStoreUrl) {
        redirect(307, appStoreUrl, { external: true });
    }

    return {};
};
