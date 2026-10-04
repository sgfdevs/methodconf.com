import type {
    PublicScheduleGridCell,
    Schedule,
    ScheduleItem,
} from '#lib/types.ts';
import { treeByRoutePath } from '#lib/server/umbraco/treeByRoutePath.ts';
import { parseSession } from '#lib/server/parseSession.ts';
import { getFirstChildNodeOfType } from '#lib/server/umbraco/getChildNodesOfType.ts';
import { getItemsOrDefault } from '#lib/server/umbraco/getItems.ts';
import { getUmbracoClient } from '#lib/server/umbraco/client.ts';

const MAXIMUM_SCHEDULE_ITEMS = 100;

export async function getSchedule(conferenceId: string): Promise<Schedule> {
    const [items, grid] = await Promise.all([
        getScheduleItems(conferenceId),
        getScheduleGrid(conferenceId),
    ]);

    return { items, grid };
}

export async function getScheduleItems(
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

export async function getScheduleGrid(
    conferenceId: string,
): Promise<PublicScheduleGridCell[][]> {
    const { data, error } = await getUmbracoClient().GET(
        '/api/v1/conference/{conferenceId}/schedule',
        { params: { path: { conferenceId } } },
    );

    if (error) {
        return [];
    }

    return data.scheduleGrid;
}
