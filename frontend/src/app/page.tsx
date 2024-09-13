import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';
import { getConference } from '@/data/getConference';
import { getSchedule } from '@/data/getSchedule';

export default async function Home() {
    const { schedule } = await getHomePageData();

    return (
        <>
            <HomeNav />
            <main>
                <HomeIntroSection />
                <ScheduleSection schedule={schedule} />
                <LocationSection />
                <SponsorsSection />
            </main>
        </>
    );
}

async function getHomePageData() {
    const conference = await getConference();

    if (!conference) {
        return {};
    }

    const [schedule] = await Promise.all([getSchedule(conference.id)]);

    return { conference, schedule };
}
