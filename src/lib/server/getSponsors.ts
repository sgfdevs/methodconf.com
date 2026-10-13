import type { Sponsors } from '#lib/types.ts';
import { getFirstChildNodeOfType } from '#lib/server/umbraco/getChildNodesOfType.ts';

export async function getSponsors(
    conferenceId: string,
): Promise<Sponsors | undefined> {
    return await getFirstChildNodeOfType({
        nodeId: conferenceId,
        type: 'sponsors',
    });
}
