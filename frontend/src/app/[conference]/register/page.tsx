import { notFound } from 'next/navigation';
import { getConference } from '@/data/getConference';
import { OveItEmbed } from '@/components/OveItEmbed';

export interface RegisterProps {
    params: {
        conference: string;
    };
}

export default async function Register({ params }: RegisterProps) {
    const conference = await getConference(params.conference);

    const registerUrl = conference?.properties.registerUrl;

    if (!registerUrl) {
        return notFound();
    }

    return (
        <section className="py-14">
            <div className="content-container">
                <OveItEmbed embedUrl={registerUrl} />
            </div>
        </section>
    );
}
