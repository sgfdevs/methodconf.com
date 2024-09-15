import { notFound } from 'next/navigation';
import { getConference } from '@/data/getConference';
import { getItemByPath } from '@/data/umbraco/getItemByPath';
import dynamic from 'next/dynamic';

export interface PageProps {
    params: {
        conference: string;
        slug: string[];
    };
}

export default async function Page({ params }: PageProps) {
    const conference = await getConference(params.conference);

    if (!conference) {
        return notFound();
    }

    const item = await getItemByPath(
        `${params.conference}/${params.slug.join('/')}`,
    );

    if (!item) {
        return notFound();
    }

    switch (item.contentType) {
        case 'speaker':
            const SpeakerDetailPage = dynamic(() =>
                import('@/components/pageTypes/SpeakerDetailPage').then(
                    (mod) => mod.SpeakerDetailPage,
                ),
            );
            return <SpeakerDetailPage conference={conference} speaker={item} />;
        default:
            return notFound();
    }
}
