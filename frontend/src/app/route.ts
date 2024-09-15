import { getDefaultConference } from '@/data/getDefaultConference';
import { notFound, redirect } from 'next/navigation';

export async function GET() {
    const conference = await getDefaultConference();

    if (!conference) {
        return notFound();
    }

    redirect(conference.route.path);
}
