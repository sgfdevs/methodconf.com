import { umbracoClient } from '@/data/umbraco/client';
import type { Conference } from '@/data/types';

export async function getConference(
    conferenceSlug: string,
): Promise<Conference | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: { query: { filter: [`name:${conferenceSlug}`] } },
        },
    );

    if (error) {
        return;
    }

    const [firstNode] = data.items;

    if (firstNode?.contentType !== 'conference') {
        return;
    }

    return firstNode;
}
