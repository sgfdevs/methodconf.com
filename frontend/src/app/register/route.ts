import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { getDefaultConference } from '@/data/getDefaultConference';

export async function GET() {
    const conference = await getDefaultConference();

    if (!conference) {
        return notFound();
    }

    const path = conference.route.path.replace(/\/$/, '');

    permanentRedirect(`${path}/register/`);
}
