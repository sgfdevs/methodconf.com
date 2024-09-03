import { umbracoClient } from '@/data/umbraco/client';

export async function getSchedule(conferenceId: string) {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    filter: ['contentType:sessions'],
                },
            },
        },
    );

    if (error) {
        return;
    }

    const [first] = data.items;

    if (!first) {
        return;
    }

    // if (first.contentType === 'sessions') {
    //     return;
    // }
    //
    // if (data.items)
}
