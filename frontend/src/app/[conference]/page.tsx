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
    params: { conference: string };
}

export async function generateMetadata({
    params,
}: RootPageProps): Promise<Metadata> {
    const { conference, homeContent } = await getHomePageData(
        params.conference,
    );

    if (!conference || !homeContent) {
        return notFound();
    }

    return await generateGenericMetadata({
        params: {
            conference: params.conference,
            slug: [],
        },
        conference,
        page: homeContent,
    });
}

export default async function Home({ params }: RootPageProps) {
    const { conference, homeContent } = await getHomePageData(
        params.conference,
    );

    if (!conference || !homeContent) {
        return notFound();
    }

    return (
        <>
            <HomeNav params={params} conference={conference} />
            <main>
                <GenericPage
                    params={{
                        conference: params.conference,
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
