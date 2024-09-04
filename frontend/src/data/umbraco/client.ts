import createClient from 'openapi-fetch';
import type { paths } from '@/data/umbraco/schema';
import { UMBRACO_BASE_URL } from '@/config';

export const umbracoClient = createClient<paths>({
    baseUrl: UMBRACO_BASE_URL.toString(),
    fetch: (request) => {
        return fetch(request, { cache: 'no-cache' });
    },
});
