import { notFound, redirect } from 'next/navigation';
import { parseUrl } from '@/util';
import { getConference } from '@/data/getConference';

export async function GET(
    request: Request,
    { params }: { params: { conference: string } },
) {
    const conference = await getConference(params.conference);

    const url = parseUrl(conference?.properties?.callForSpeakersUrl);

    if (!url) {
        return notFound();
    }

    redirect(url.toString());
}
