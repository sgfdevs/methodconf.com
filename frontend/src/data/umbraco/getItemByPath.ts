import { umbracoClient } from '@/data/umbraco/client';
import type { paths } from '@/data/umbraco/schema';

type GetItemByPathOptions =
    paths['/umbraco/delivery/api/v2/content/item/{path}']['get']['parameters']['query'];

export async function getItemByPathOrDefault(
    path: string,
    options: GetItemByPathOptions = {},
) {
    const { data, error } = await getItemByPath(path, options);

    if (error) {
        return;
    }

    return data;
}

export async function getItemByPath(
    path: string,
    options: GetItemByPathOptions = {},
) {
    return await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content/item/{path}',
        {
            params: {
                path: {
                    path: path,
                },
                query: options,
            },
        },
    );
}
