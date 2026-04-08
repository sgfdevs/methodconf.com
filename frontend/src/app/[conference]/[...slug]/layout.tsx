import type { ReactNode } from 'react';
import { DefaultNav } from '@/components/DefaultNav';
import { getConference } from '@/data/getConference';
import { notFound } from 'next/navigation';
import { getSponsors } from '@/data/getSponsors';
import { SponsorsBlock } from '@/components/contentBlocks/SponsorsBlock';

export interface PageLayoutProps {
    children: ReactNode;
    params: Promise<{
        conference: string;
    }>;
}

export default async function PageLayout({
    children,
    params,
}: PageLayoutProps) {
    const resolvedParams = await params;
    const conference = await getConference(resolvedParams.conference);

    if (!conference) {
        return notFound();
    }

    const sponsors = await getSponsors(conference.id);

    return (
        <>
            <DefaultNav conference={conference} params={resolvedParams} />
            <main>
                {children}
                {sponsors ? <SponsorsBlock sponsors={sponsors} /> : null}
            </main>
        </>
    );
}
