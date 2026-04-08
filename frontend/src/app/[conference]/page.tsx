import { HomeNav } from '@/components/HomeNav';
import { getConference } from '@/data/getConference';
import { notFound } from 'next/navigation';
import {
    generateMetadata as generateGenericMetadata,
    GenericPage,
} from '@/components/pageTypes/GenericPage';
import { getItemByPathOrDefault } from '@/data/umbraco/getItemByPath';
import type { Metadata } from 'next';

export interface RootPageProps {
    params: Promise<{ conference: string }>;
}

export async function generateMetadata({
    params,
}: RootPageProps): Promise<Metadata> {
    const { conference: conferenceSlug } = await params;
    const { conference, homeContent } = await getHomePageData(conferenceSlug);

    if (!conference || !homeContent) {
        return notFound();
    }

    return await generateGenericMetadata({
        params: {
            conference: conferenceSlug,
            slug: [],
        },
        conference,
        page: homeContent,
    });
}

export default async function Home({ params }: RootPageProps) {
    const resolvedParams = await params;
    const { conference, homeContent } = await getHomePageData(
        resolvedParams.conference,
    );

    if (!conference || !homeContent) {
        return notFound();
    }

    return (
        <>
            <HomeNav params={resolvedParams} conference={conference} />
            <main>
                <GenericPage
                    params={{
                        conference: resolvedParams.conference,
                        slug: [],
                    }}
                    conference={conference}
                    page={homeContent}
                />
            </main>
        </>
    );
}

async function getHomePageData(conferenceSlug: string) {
    const conference = await getConference(conferenceSlug);

    if (!conference) {
        return {};
    }

    const homeContent = await getItemByPathOrDefault(`${conferenceSlug}/home`);

    if (homeContent?.contentType !== 'home') {
        return { conference };
    }

    return { conference, homeContent };
}
