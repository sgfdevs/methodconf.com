import type { ParsedConference } from '@/data/types';
import { parseConference } from '@/data/parseConference';
import { getItemsOrDefault } from '@/data/umbraco/getItems';

export async function getDefaultConference(): Promise<
    ParsedConference | undefined
> {
    const { items } = await getItemsOrDefault({
        filter: [`contentType:conference`],
    });

    let latestConference: ParsedConference | undefined;

    for (const item of items) {
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
