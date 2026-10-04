import { getUmbracoClient } from '#lib/server/umbraco/client.ts';
import type { paths } from '#lib/umbraco/deliveryApiSchema.d.ts';
import type {
    UmbracoClientOptions,
    UmbracoContentCollection,
} from '#lib/server/umbraco/types.ts';
import { normalizeUmbracoContentCollection } from '#lib/server/umbraco/types.ts';

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
}: GetItemsOptions) {
    return getUmbracoClient().GET('/umbraco/delivery/api/v2/content', {
        params: {
            query: options,
        },
        ...requestOptions,
    });
}
