import { umbracoClient } from '@/data/umbraco/client';
import { ScheduleItem, Sessions } from '@/data/types';
import { treeByRoutePath } from '@/data/umbraco/treeByRoutePath';
import { DEFAULT_CONFERENCE } from '@/config';

export async function getSchedule(
    conferenceSlug: string = DEFAULT_CONFERENCE,
): Promise<ScheduleItem[]> {
    const sessionsRootNode = await getSessionsRootNode(conferenceSlug);

    if (!sessionsRootNode) {
        return [];
    }

    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    fetch: `descendants:${sessionsRootNode.id}`,
                    expand: 'all',
                },
            },
        },
    );

    if (error) {
        return [];
    }

    console.log(data?.items?.map((item) => item.route));

    return treeByRoutePath(data.items) as ScheduleItem[];
}

async function getSessionsRootNode(
    conferenceSlug: string,
): Promise<Sessions | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    filter: ['contentType:sessions'],
                    fetch: `descendants:${conferenceSlug}`,
                    sort: ['sortOrder:asc'],
                },
            },
        },
    );

    if (error) {
        return;
    }

    const [firstNode] = data.items;

    if (firstNode?.contentType !== 'sessions') {
        return;
    }

    return firstNode as Sessions;
}
