import type { ParsedConference } from '@/data/types';
import { parseConference } from '@/data/parseConference';
import { getItemByPathOrDefault } from '@/data/umbraco/getItemByPath';

export async function getConference(
    conferenceSlug: string,
): Promise<ParsedConference | undefined> {
    const data = await getItemByPathOrDefault(conferenceSlug);

    if (data?.contentType !== 'conference') {
        return;
    }

    return parseConference(data);
}
