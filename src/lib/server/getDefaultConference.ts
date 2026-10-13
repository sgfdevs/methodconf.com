import type { ParsedConference } from '#lib/types.ts';
import { parseConference } from '#lib/server/parseConference.ts';
import { getItemsOrDefault } from '#lib/server/umbraco/getItems.ts';

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
