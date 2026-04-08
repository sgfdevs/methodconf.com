import { umbracoClient } from '@/data/umbraco/client';
import type { paths } from '@/data/umbraco/deliveryApiSchema';
import type {
    RawUmbracoContentCollection,
    UmbracoClientOptions,
    UmbracoContentCollection,
} from '@/data/umbraco/types';
import { normalizeUmbracoContentCollection } from '@/data/umbraco/types';

type GetItemsOptions = NonNullable<
    paths['/umbraco/delivery/api/v2/content']['get']['parameters']['query'] &
        UmbracoClientOptions
>;

export async function getItemsOrDefault(
    options: GetItemsOptions,
): Promise<UmbracoContentCollection> {
    const { data, error } = await getItems(options);

    if (error || !data) {
        return { total: 0, items: [] };
    }

    return normalizeUmbracoContentCollection(data);
}

export async function getItems({
    requestOptions,
    ...options
}: GetItemsOptions): Promise<{
    data?: RawUmbracoContentCollection;
    error?: unknown;
    response: Response;
}> {
    return await umbracoClient.GET('/umbraco/delivery/api/v2/content', {
        params: {
            query: options,
        },
        ...requestOptions,
    });
}
