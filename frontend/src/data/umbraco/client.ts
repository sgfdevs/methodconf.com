import createClient from 'openapi-fetch';
import type { paths as deliveryApiPaths } from '@/data/umbraco/deliveryApiSchema';
import type { paths as defaultApiPaths } from '@/data/umbraco/defaultApiSchema';
import { NEXT_PUBLIC_UMBRACO_BASE_URL } from '@/config';

export const umbracoClient = createClient<deliveryApiPaths & defaultApiPaths>({
    baseUrl: NEXT_PUBLIC_UMBRACO_BASE_URL.toString(),
    fetch: async (request) => {
        let { next } = request as RequestInit;

        if ((!request.cache || request.cache === 'default') && !next) {
            next = { revalidate: 60 };
        }

        try {
            return await fetch(request, { next });
        } catch (err) {
            console.log(err);
            throw err;
        }
    },
});
