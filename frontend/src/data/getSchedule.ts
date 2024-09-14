import { umbracoClient } from '@/data/umbraco/client';
import type { ScheduleItem } from '@/data/types';
import { Sessions, Track } from '@/data/types';
import { treeByRoutePath } from '@/data/umbraco/treeByRoutePath';
import { parseSessionDates } from '@/data/parseSessionDates';
import { getFirstChildNodeOfType } from '@/data/umbraco/getChildNodesOfType';

const MAXIMUM_SCHEDULE_ITEMS = 100;

export async function getSchedule(
    conferenceId: string,
): Promise<ScheduleItem[]> {
    const sessionsRootNode = await getFirstChildNodeOfType({
        nodeId: conferenceId,
        type: 'sessions',
    });

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
            return parseSessionDates(item);
        }
        return item;
    });

    return treeByRoutePath(withParsedSessions) as ScheduleItem[];
}
