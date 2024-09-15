import { umbracoClient } from '@/data/umbraco/client';
import type { ParsedConference } from '@/data/types';
import { parseConference } from '@/data/parseConference';

export async function getConference(
    conferenceSlug: string,
): Promise<ParsedConference | undefined> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content/item/{path}',
        {
            params: {
                path: {
                    path: conferenceSlug,
                },
            },
        },
    );

    if (error) {
        return;
    }

    if (data?.contentType !== 'conference') {
        return;
    }

    return parseConference(data);
}
