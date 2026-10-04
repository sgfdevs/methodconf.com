import type { ParsedConference } from '#lib/types.ts';
import { parseConference } from '#lib/server/parseConference.ts';
import { getItemByPathOrDefault } from '#lib/server/umbraco/getItemByPath.ts';

export async function getConference(
    conferenceSlug: string,
): Promise<ParsedConference | undefined> {
    const data = await getItemByPathOrDefault(conferenceSlug);

    if (data?.contentType !== 'conference') {
        return;
    }

    return parseConference(data);
}
