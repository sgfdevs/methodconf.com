import { contentClient } from '@/data/client';
import { DEFAULT_CONFERENCE } from '@/config';

export async function getConference(
    conferenceSlug: string = DEFAULT_CONFERENCE,
) {
    const res = await contentClient.getContentItemByPath20({
        path: conferenceSlug,
    });

    console.log(res);
}
