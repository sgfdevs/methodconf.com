import { umbracoClient } from '@/data/umbraco/client';
import { DEFAULT_CONFERENCE } from '@/config';
import { Conference } from '@/data/types';
import { getSchedule } from '@/data/getSchedule';

export async function getConference(
    conferenceSlug: string = DEFAULT_CONFERENCE,
): Promise<Conference | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content/item/{path}',
        {
            params: { path: { path: conferenceSlug } },
        },
    );

    if (error) {
        return;
    }

    if (data.contentType !== 'conference') {
        return;
    }

    await getSchedule(data.id);

    return data as Conference;
}
