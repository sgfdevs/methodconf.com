import { umbracoClient } from '@/data/umbraco/client';
import { Sessions } from '@/data/types';
import { treeByRoutePath } from '@/data/umbraco/treeByRoutePath';
import * as fs from 'node:fs';

export async function getSchedule(conferenceSlug: string) {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    filter: ['contentType:sessions'],
                    fetch: `descendants:${conferenceSlug}`,
                },
            },
        },
    );

    if (error) {
        throw error;
    }

    const [firstNode] = data.items;

    if (firstNode?.contentType !== 'sessions') {
        return;
    }

    const sessionsNode = firstNode as Sessions;

    const { data: data2, error: error2 } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    fetch: `descendants:${sessionsNode.id}`,
                    expand: 'all',
                },
            },
        },
    );

    console.log(JSON.stringify(treeByRoutePath(data2?.items ?? [])));
}
