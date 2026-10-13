import { getSchedule } from '#lib/server/getSchedule.ts';
import { getSponsors } from '#lib/server/getSponsors.ts';
import type {
    ContentBlock,
    ParsedConference,
    Schedule,
    Sponsors,
} from '#lib/types.ts';

export interface AdditionalPageData {
    schedule?: Schedule;
    sponsors?: Sponsors;
}

export async function getPageDataForBlocks(
    conference: ParsedConference,
    blocks: ContentBlock[],
): Promise<AdditionalPageData> {
    const pageData: AdditionalPageData = {};
    const tasks: Promise<void>[] = [];

    if (blocks.find((block) => block.contentType === 'scheduleBlock')) {
        tasks.push(
            getSchedule(conference.id).then((schedule) => {
                pageData.schedule = schedule;
            }),
        );
    }

    if (blocks.find((block) => block.contentType === 'sponsorsBlock')) {
        tasks.push(
            getSponsors(conference.id).then((sponsors) => {
                pageData.sponsors = sponsors;
            }),
        );
    }

    await Promise.all(tasks);

    return pageData;
}
