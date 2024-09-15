import type { ParsedConference } from '@/data/types';
import { umbracoClient } from '@/data/umbraco/client';
import { parseConference } from '@/data/parseConference';

export async function getDefaultConference(): Promise<
    ParsedConference | undefined
> {
    const { data, error } = await umbracoClient.GET(
        '/umbraco/delivery/api/v2/content',
        {
            params: {
                query: {
                    filter: [`contentType:conference`],
                },
            },
        },
    );

    if (error) {
        return;
    }

    let latestConference: ParsedConference | undefined;

    for (const item of data.items) {
        if (item.contentType !== 'conference') {
            continue;
        }

        const conference = parseConference(item);
        const { date } = conference.properties;

        if (!date) {
            continue;
        }

        if (!latestConference || date > latestConference.properties.date!) {
            latestConference = conference;
        }
    }

    return latestConference;
}
