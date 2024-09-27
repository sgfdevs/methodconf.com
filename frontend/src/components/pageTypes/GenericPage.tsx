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
const IntroAndEmailSignupBlock = dynamic(() =>
    import('@/components/contentBlocks/IntroAndEmailSignupBlock').then(
        (mod) => mod.IntroAndEmailSignupBlock,
    ),
);

const ScheduleBlock = dynamic(() =>
    import('@/components/contentBlocks/ScheduleBlock').then(
        (mod) => mod.ScheduleBlock,
    ),
);

const LocationBlock = dynamic(() =>
    import('@/components/contentBlocks/LocationBlock').then(
        (mod) => mod.LocationBlock,
    ),
);

const SponsorsBlock = dynamic(() =>
    import('@/components/contentBlocks/SponsorsBlock').then(
        (mod) => mod.SponsorsBlock,
    ),
);

const RichTextBlock = dynamic(() =>
    import('@/components/contentBlocks/RichTextBlock').then(
        (mod) => mod.RichTextBlock,
    ),
);

const TextWithButtonsBlock = dynamic(() =>
    import('@/components/contentBlocks/TextWithButtonsBlock').then(
        (mod) => mod.TextWithButtonsBlock,
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
            {blocks.map((block) => {
                switch (block.contentType) {
                    case 'introAndEmailSignupBlock':
                        return (
                            <IntroAndEmailSignupBlock
                                key={block.id}
                                params={params}
                            />
                        );
                    case 'scheduleBlock':
                        return (
                            <ScheduleBlock
                                key={block.id}
                                conference={conference}
                                schedule={schedule}
                            />
                        );
                    case 'locationBlock':
                        return <LocationBlock key={block.id} />;
                    case 'sponsorsBlock':
                        return (
                            <SponsorsBlock key={block.id} sponsors={sponsors} />
                        );
                    case 'richText':
                        return <RichTextBlock key={block.id} block={block} />;
                    case 'textWithButtons':
                        return (
                            <TextWithButtonsBlock
                                key={block.id}
                                block={block}
                            />
                        );
                }
            })}
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
