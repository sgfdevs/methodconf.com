import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';
import { LocationSection } from '@/components/sections/LocationSection';
import { ScheduleSection } from '@/components/sections/ScheduleSection';

export default function Home() {
    return (
        <>
            <HomeNav />
            <main>
                <HomeIntroSection />
                <ScheduleSection />
                <LocationSection />
                <SponsorsSection />
            </main>
        </>
    );
}
