import type { ParsedSession } from '#lib/types.ts';
import { parseSession } from '#lib/server/parseSession.ts';
import { getItemsOrDefault } from '#lib/server/umbraco/getItems.ts';

export async function getSessionsForSpeaker(
    conferenceId: string,
    speakerId: string,
): Promise<ParsedSession[]> {
    const { items } = await getItemsOrDefault({
        fetch: `descendants:${conferenceId}`,
        expand: 'properties[$all]',
        filter: ['contentType:session', `speaker:${speakerId}`],
    });

    return items
        .filter((item) => item.contentType === 'session')
        .map(parseSession);
}
