import { HomeNav } from '@/components/HomeNav';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { SponsorsSection } from '@/components/sections/SponsorsSection';

export default function Home() {
    return (
        <>
            <HomeNav />
            <main>
                <HomeIntroSection />
                <SponsorsSection />
            </main>
        </>
    );
}
