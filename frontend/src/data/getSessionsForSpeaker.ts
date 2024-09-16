import type { ParsedSession } from '@/data/types';
import { parseSession } from '@/data/parseSession';
import { getItemsOrDefault } from '@/data/umbraco/getItems';

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
