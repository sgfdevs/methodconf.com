import { getUmbracoClient } from '#lib/server/umbraco/client.ts';
import type { paths } from '#lib/umbraco/deliveryApiSchema.d.ts';
import type {
    UmbracoClientOptions,
    UmbracoContent,
} from '#lib/server/umbraco/types.ts';
import { normalizeUmbracoContent } from '#lib/server/umbraco/types.ts';

type GetItemByPathOptions =
    paths['/umbraco/delivery/api/v2/content/item/{path}']['get']['parameters']['query'] &
        UmbracoClientOptions;

export async function getItemByPathOrDefault(
    path: string,
    options: GetItemByPathOptions = {},
): Promise<UmbracoContent | undefined> {
    const { data, error } = await getItemByPath(path, options);

    if (error || !data) {
        return;
    }

    return normalizeUmbracoContent(data);
}

export async function getItemByPath(
    path: string,
    { requestOptions = {}, ...options }: GetItemByPathOptions = {},
) {
    return getUmbracoClient().GET(
        '/umbraco/delivery/api/v2/content/item/{path}',
        {
            params: {
                path: {
                    path: path,
                },
                query: options,
            },
            ...requestOptions,
        },
    );
}
