import { permanentRedirect } from 'next/navigation';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ conference: string }> },
) {
    const { conference } = await params;
    permanentRedirect(`/${conference}/register/`);
}
