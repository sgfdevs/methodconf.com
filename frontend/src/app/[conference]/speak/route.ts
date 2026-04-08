import { notFound, redirect } from 'next/navigation';
import { parseUrl } from '@/util';
import { getConference } from '@/data/getConference';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conference: string }> },
) {
    const { conference: conferenceSlug } = await params;
    const conference = await getConference(conferenceSlug);

    const url = parseUrl(conference?.properties?.callForSpeakersUrl);

    if (!url) {
        return notFound();
    }

    redirect(url.toString());
}
