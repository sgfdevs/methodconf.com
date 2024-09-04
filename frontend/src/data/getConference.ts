import { umbracoClient } from '@/data/umbraco/client';
import { DEFAULT_CONFERENCE } from '@/config';
import { Conference } from '@/data/types';

export async function getConference(
    conferenceName: string = DEFAULT_CONFERENCE,
): Promise<Conference | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: { query: { filter: [`name:${conferenceName}`] } },
        },
    );

    if (error) {
        return;
    }

    const [firstNode] = data.items;

    if (firstNode?.contentType !== 'conference') {
        return;
    }

    return firstNode as Conference;
}
