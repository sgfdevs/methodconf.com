import { umbracoClient } from '@/data/umbraco/client';
import type { paths } from '@/data/umbraco/deliveryApiSchema';
import type {
    RawUmbracoContent,
    UmbracoClientOptions,
    UmbracoContent,
} from '@/data/umbraco/types';
import { normalizeUmbracoContent } from '@/data/umbraco/types';

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
): Promise<{
    data?: RawUmbracoContent;
    error?: unknown;
    response: Response;
}> {
    return await umbracoClient.GET(
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
