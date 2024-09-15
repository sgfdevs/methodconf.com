import { notFound, redirect } from 'next/navigation';
import { parseUrl } from '@/util';
import { getDefaultConference } from '@/data/getDefaultConference';

export async function GET() {
    const conference = await getDefaultConference();

    const url = parseUrl(conference?.properties?.callForSpeakersUrl);

    if (!url) {
        return notFound();
    }

    redirect(url.toString());
}
