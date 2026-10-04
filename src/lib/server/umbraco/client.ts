import createClient from 'openapi-fetch';
import type { paths as deliveryApiPaths } from '#lib/umbraco/deliveryApiSchema.d.ts';
import type { paths as defaultApiPaths } from '#lib/umbraco/defaultApiSchema.d.ts';
import { createCmsJsonFetch } from '#lib/server/cache.ts';
import { getUmbracoBaseUrl } from '#lib/server/config.ts';

export function getUmbracoClient() {
    const baseUrl = getUmbracoBaseUrl();

    return createClient<deliveryApiPaths & defaultApiPaths>({
        baseUrl: baseUrl.toString(),
        fetch: createCmsJsonFetch({ baseUrl }),
    });
}
