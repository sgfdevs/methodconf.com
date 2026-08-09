import createClient from 'openapi-fetch';
import type { paths as deliveryApiPaths } from '@/data/umbraco/deliveryApiSchema';
import type { paths as defaultApiPaths } from '@/data/umbraco/defaultApiSchema';
import { getUmbracoBaseUrl } from '@/serverConfig';

export function getUmbracoClient() {
    return createClient<deliveryApiPaths & defaultApiPaths>({
        baseUrl: getUmbracoBaseUrl().toString(),
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
}
