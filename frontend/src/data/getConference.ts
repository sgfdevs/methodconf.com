import { umbracoClient } from '@/data/umbraco/client';
import { DEFAULT_CONFERENCE } from '@/config';
import { components } from '@/data/umbraco/schema';

export async function getConference(
    conferenceSlug: string = DEFAULT_CONFERENCE,
): Promise<
    components['schemas']['ConferenceContentResponseModel'] | undefined
> {
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

    return data;
}
