import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';
import { LocationSection } from '@/components/sections/LocationSection';

export default function Home() {
    return (
        <>
            <HomeNav />
            <main>
                <HomeIntroSection />
                <LocationSection />
                <SponsorsSection />
            </main>
        </>
    );
}
