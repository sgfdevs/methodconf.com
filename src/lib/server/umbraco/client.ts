import createClient from 'openapi-fetch';
import type { paths as deliveryApiPaths } from '#lib/umbraco/deliveryApiSchema.d.ts';
import type { paths as defaultApiPaths } from '#lib/umbraco/defaultApiSchema.d.ts';
import { createCmsJsonFetch } from '#lib/server/cache.ts';
import { getUmbracoBaseUrl } from '#lib/server/config.ts';

type UmbracoClient = ReturnType<
    typeof createClient<deliveryApiPaths & defaultApiPaths>
>;

const MAX_CLIENTS = 8;
const clients = new Map<string, UmbracoClient>();

function rememberClient(key: string, client: UmbracoClient): UmbracoClient {
    clients.set(key, client);

    while (clients.size > MAX_CLIENTS) {
        const oldestKey = clients.keys().next().value as string | undefined;
        if (!oldestKey) {
            break;
        }
        clients.delete(oldestKey);
    }

    return client;
}

export function getUmbracoClient() {
    const baseUrl = getUmbracoBaseUrl();
    const key = baseUrl.toString();
    const cached = clients.get(key);

    if (cached) {
        return cached;
    }

    return rememberClient(
        key,
        createClient<deliveryApiPaths & defaultApiPaths>({
            baseUrl: key,
            fetch: createCmsJsonFetch({ baseUrl }),
        }),
    );
}
