import { umbracoClient } from '@/data/umbraco/client';
import type { paths } from '@/data/umbraco/schema';
import type { UmbracoClientOptions } from '@/data/umbraco/types';

type GetItemsOptions = NonNullable<
    paths['/umbraco/delivery/api/v2/content']['get']['parameters']['query'] &
        UmbracoClientOptions
>;

export async function getItemsOrDefault(options: GetItemsOptions) {
    const { data, error } = await getItems(options);

    if (error) {
        return { total: 0, items: [] };
    }

    return data;
}

export async function getItems({
    requestOptions,
    ...options
}: GetItemsOptions) {
    return await umbracoClient.GET('/umbraco/delivery/api/v2/content', {
        params: {
            query: options,
        },
        ...requestOptions,
    });
}
