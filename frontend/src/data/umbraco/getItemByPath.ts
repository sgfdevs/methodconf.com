import { umbracoClient } from '@/data/umbraco/client';

export async function getItemByPath(path: string) {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content/item/{path}',
        {
            params: {
                path: {
                    path: path,
                },
            },
        },
    );

    if (error) {
        return;
    }

    return data;
}
