import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getConference } from '@/data/getConference';
import { getItemByPathOrDefault } from '@/data/umbraco/getItemByPath';
import { generateMetadata as generateSpeakerMetadata } from '@/components/pageTypes/SpeakerDetailPage';
import { generateMetadata as generateGenericMetadata } from '@/components/pageTypes/GenericPage';

export interface PageProps {
    params: {
        conference: string;
        slug: string[];
    };
}

export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { conference, item } = await getData(params);

    if (!conference || !item) {
        return notFound();
    }

    switch (item.contentType) {
        case 'speaker':
            return await generateSpeakerMetadata({ conference, speaker: item });
        case 'page':
            return await generateGenericMetadata({
                params,
                conference,
                page: item,
            });
    }

    return {};
}

const SpeakerDetailPage = dynamic(() =>
    import('@/components/pageTypes/SpeakerDetailPage').then(
        (mod) => mod.SpeakerDetailPage,
    ),
);

const GenericPage = dynamic(() =>
    import('@/components/pageTypes/GenericPage').then((mod) => mod.GenericPage),
);

export default async function Page({ params }: PageProps) {
    const { conference, item } = await getData(params);

    if (!conference || !item) {
        return notFound();
    }

    switch (item.contentType) {
        case 'speaker':
            return <SpeakerDetailPage conference={conference} speaker={item} />;
        case 'page':
            return (
                <GenericPage
                    params={params}
                    conference={conference}
                    page={item}
                />
            );
        default:
            return notFound();
    }
}

async function getData(params: PageProps['params']) {
    const conference = await getConference(params.conference);

    if (!conference) {
        return {};
    }

    const item = await getItemByPathOrDefault(
        `${params.conference}/${params.slug.join('/')}`,
    );

    if (!item) {
        return { conference };
    }

    return { conference, item };
}
