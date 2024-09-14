import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { getConference } from '@/data/getConference';
import { getSchedule } from '@/data/getSchedule';
import { getSponsors } from '@/data/getSponsors';

export default async function Home() {
    const { schedule, sponsors } = await getHomePageData();

    return (
        <>
            <HomeNav />
            <main>
                <HomeIntroSection />
                {schedule ? <ScheduleSection schedule={schedule} /> : null}
                <LocationSection />
                {sponsors ? <SponsorsSection sponsors={sponsors} /> : null}
            </main>
        </>
    );
}

async function getHomePageData() {
    const conference = await getConference();

    if (!conference) {
        return {};
    }

    const [schedule, sponsors] = await Promise.all([
        getSchedule(conference.id),
        getSponsors(conference.id),
    ]);

    return { conference, schedule, sponsors };
}
