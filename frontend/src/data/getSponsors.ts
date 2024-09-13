import { Sponsors } from '@/data/types';
import { getFirstChildNodeOfType } from '@/data/umbraco/getChildNodesOfType';

export async function getSponsors(
    conferenceId: string,
): Promise<Sponsors | undefined> {
    return await getFirstChildNodeOfType({
        nodeId: conferenceId,
        type: 'sponsors',
    });
}
