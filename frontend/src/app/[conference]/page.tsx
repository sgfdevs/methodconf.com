import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
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
                <HomeIntroSection params={params} />
                {schedule ? (
                    <ScheduleSection
                        conference={conference}
                        schedule={schedule}
                    />
                ) : null}
                <LocationSection />
                {sponsors ? <SponsorsSection sponsors={sponsors} /> : null}
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
