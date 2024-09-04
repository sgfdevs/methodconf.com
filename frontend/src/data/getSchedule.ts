import { umbracoClient } from '@/data/umbraco/client';
import { ScheduleItem, Session, Sessions, Track } from '@/data/types';
import { treeByRoutePath } from '@/data/umbraco/treeByRoutePath';
import { parseSessionDates } from '@/data/parseSessionDates';

const MAXIMUM_SCHEDULE_ITEMS = 100;

export async function getSchedule(
    conferenceId: string,
): Promise<ScheduleItem[]> {
    const sessionsRootNode = await getSessionsRootNode(conferenceId);

    if (!sessionsRootNode) {
        return [];
    }

    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    fetch: `descendants:${sessionsRootNode.id}`,
                    expand: 'properties[$all]',
                    take: MAXIMUM_SCHEDULE_ITEMS,
                },
            },
        },
    );

    if (error) {
        return [];
    }

    const withParsedSessions = data.items.map((item) => {
        if (item.contentType === 'session') {
            const updatedItem = item as Session;
            return parseSessionDates(updatedItem);
        }
        return item as Track;
    });

    return treeByRoutePath(withParsedSessions) as ScheduleItem[];
}

async function getSessionsRootNode(
    conferenceId: string,
): Promise<Sessions | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    filter: ['contentType:sessions'],
                    fetch: `descendants:${conferenceId}`,
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
