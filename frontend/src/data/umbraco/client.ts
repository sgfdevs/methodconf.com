import createClient from 'openapi-fetch';
import type { paths } from '@/data/umbraco/schema';
import { NEXT_PUBLIC_UMBRACO_BASE_URL } from '@/config';

export const umbracoClient = createClient<paths>({
    baseUrl: NEXT_PUBLIC_UMBRACO_BASE_URL.toString(),
    fetch: (request) => {
        return fetch(request, { cache: 'no-cache' });
    },
});
