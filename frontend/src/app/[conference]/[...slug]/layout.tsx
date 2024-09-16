import type { ReactNode } from 'react';
import { DefaultNav } from '@/components/DefaultNav';
import { getConference } from '@/data/getConference';
import { notFound } from 'next/navigation';
import { getSponsors } from '@/data/getSponsors';
import { SponsorsSection } from '@/components/sections/SponsorsSection';

export interface PageLayoutProps {
    children: ReactNode;
    params: {
        conference: string;
    };
}

export default async function PageLayout({
    children,
    params,
}: PageLayoutProps) {
    const conference = await getConference(params.conference);

    if (!conference) {
        return notFound();
    }

    const sponsors = await getSponsors(conference.id);

    return (
        <>
            <DefaultNav conference={conference} params={params} />
            <main>
                {children}
                {sponsors ? <SponsorsSection sponsors={sponsors} /> : null}
            </main>
        </>
    );
}
