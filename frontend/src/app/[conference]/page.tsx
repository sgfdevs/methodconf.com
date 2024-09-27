import { HomeNav } from '@/components/HomeNav';
import { IntroAndEmailSignupBlock } from '@/components/contentBlocks/IntroAndEmailSignupBlock';
import { SponsorsBlock } from '@/components/contentBlocks/SponsorsBlock';
import { LocationBlock } from '@/components/contentBlocks/LocationBlock';
import { ScheduleBlock } from '@/components/contentBlocks/ScheduleBlock';
import { getConference } from '@/data/getConference';
import { getSchedule } from '@/data/getSchedule';
import { getSponsors } from '@/data/getSponsors';
import { notFound } from 'next/navigation';

export interface RootPageProps {
    params: { conference: string };
}

export default async function Home({ params }: RootPageProps) {
    const { conference, schedule, sponsors } = await getHomePageData(
        params.conference,
    );

    if (!conference) {
        return notFound();
    }

    return (
        <>
            <HomeNav params={params} conference={conference} />
            <main>
                <IntroAndEmailSignupBlock params={params} />
                {schedule ? (
                    <ScheduleBlock
                        conference={conference}
                        schedule={schedule}
                    />
                ) : null}
                <LocationBlock />
                {sponsors ? <SponsorsBlock sponsors={sponsors} /> : null}
            </main>
        </>
    );
}

async function getHomePageData(conferenceSlug: string) {
    const conference = await getConference(conferenceSlug);

    if (!conference) {
        return {};
    }

    const [schedule, sponsors] = await Promise.all([
        getSchedule(conference.id),
        getSponsors(conference.id),
    ]);

    return { conference, schedule, sponsors };
}
