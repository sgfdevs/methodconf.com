import type { ScheduleItem } from '@/data/types';
import { treeByRoutePath } from '@/data/umbraco/treeByRoutePath';
import { parseSession } from '@/data/parseSession';
import { getFirstChildNodeOfType } from '@/data/umbraco/getChildNodesOfType';
import { getItemsOrDefault } from '@/data/umbraco/getItems';

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

    const { items } = await getItemsOrDefault({
        fetch: `descendants:${sessionsRootNode.id}`,
        expand: 'properties[$all]',
        take: MAXIMUM_SCHEDULE_ITEMS,
    });

    const withParsedSessions = items.map((item) => {
        if (item.contentType === 'session') {
            return parseSession(item);
        }
        return item;
    });

    return treeByRoutePath(withParsedSessions) as ScheduleItem[];
}
