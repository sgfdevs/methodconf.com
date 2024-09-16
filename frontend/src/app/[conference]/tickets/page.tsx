import { notFound } from 'next/navigation';
import { getConference } from '@/data/getConference';
import { OveItEmbed } from '@/components/OveItEmbed';

export interface TicketsProps {
    params: {
        conference: string;
    };
}

export default async function Tickets({ params }: TicketsProps) {
    const conference = await getConference(params.conference);

    const ticketUrl = conference?.properties.ticketUrl;

    if (!ticketUrl) {
        return notFound();
    }

    return (
        <section className="py-14">
            <div className="content-container">
                <OveItEmbed embedUrl={ticketUrl} />
            </div>
        </section>
    );
}
