import { notFound, redirect } from 'next/navigation';
import { getConference } from '@/data/getConference';
import { parseUrl } from '@/util';

export async function GET() {
    const conference = await getConference();

    const url = parseUrl(conference?.properties?.ticketUrl);

    if (!url) {
        return notFound();
    }

    redirect(url.toString());
}
