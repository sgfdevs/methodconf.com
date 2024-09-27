import { notFound, redirect } from 'next/navigation';
import { getDefaultConference } from '@/data/getDefaultConference';

export async function GET() {
    const conference = await getDefaultConference();

    // const url = parseUrl(conference?.properties?.callForSpeakersUrl);

    if (!conference) {
        return notFound();
    }

    redirect(conference.route.path);
}
