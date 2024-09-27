import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import type {
    ContentBlock,
    Page,
    ParsedConference,
    ScheduleItem,
    Sponsors,
} from '@/data/types';
import type { PageProps } from '@/app/[conference]/[...slug]/page';
import { imageUrl } from '@/data/umbraco/imageUrl';
import { getSchedule } from '@/data/getSchedule';
import { getSponsors } from '@/data/getSponsors';

export interface GenericPageProps extends PageProps {
    conference: ParsedConference;
    page: Page;
}

const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

export async function generateMetadata({
    page,
}: GenericPageProps): Promise<Metadata> {
    const {
        title,
        metaDescription,
        openGraphImage: openGraphImages,
    } = page.properties ?? {};
    const [openGraphImage] = openGraphImages ?? [];

    const metadata: Metadata = {};

    if (title) {
        metadata.title = title;
    }

    if (metaDescription) {
        metadata.description = metaDescription;
    }

    if (openGraphImage?.url) {
        const url = imageUrl(openGraphImage.url, {
            width: OG_IMAGE_WIDTH,
            height: OG_IMAGE_HEIGHT,
        });

        metadata.openGraph = {
            images: [
                {
                    url,
                    width: OG_IMAGE_WIDTH,
                    height: OG_IMAGE_HEIGHT,
                },
            ],
        };
    }

    return metadata;
}
const HomeIntroSection = dynamic(() =>
    import('@/components/sections/HomeIntroSection').then(
        (mod) => mod.HomeIntroSection,
    ),
);
const ScheduleSection = dynamic(() =>
    import('@/components/sections/ScheduleSection').then(
        (mod) => mod.ScheduleSection,
    ),
);
const LocationSection = dynamic(() =>
    import('@/components/sections/LocationSection').then(
        (mod) => mod.LocationSection,
    ),
);
const SponsorsSection = dynamic(() =>
    import('@/components/sections/SponsorsSection').then(
        (mod) => mod.SponsorsSection,
    ),
);

export async function GenericPage({
    params,
    conference,
    page,
}: GenericPageProps) {
    const blocks =
        page.properties?.blocks?.items?.map((item) => item.content) ?? [];

    const { schedule, sponsors } = await getPageDataForBlocks(
        conference,
        blocks,
    );

    return (
        <>
            {await Promise.all(
                blocks.map(async (block) => {
                    switch (block.contentType) {
                        case 'introAndEmailSignupBlock':
                            return (
                                <HomeIntroSection
                                    key={block.id}
                                    params={params}
                                />
                            );
                        case 'scheduleBlock':
                            return (
                                <ScheduleSection
                                    conference={conference}
                                    schedule={schedule}
                                />
                            );
                        case 'locationBlock':
                            return <LocationSection />;
                        case 'sponsorsBlock':
                            return <SponsorsSection sponsors={sponsors} />;
                    }
                }),
            )}
        </>
    );
}

export interface AdditionalPageData {
    schedule?: ScheduleItem[];
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

    if (blocks.find((block) => block.contentType === 'sponsor')) {
        tasks.push(
            getSponsors(conference.id).then((sponsors) => {
                pageData.sponsors = sponsors;
            }),
        );
    }

    await Promise.all(tasks);

    return pageData;
}
