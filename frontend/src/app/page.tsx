import { HomeNav } from '@/components/HomeNav';
import { HomeIntro } from '@/components/HomeIntro';

export default function Home() {
    return (
        <>
            <HomeNav />
            <main>
                <HomeIntro />
            </main>
        </>
    );
}
