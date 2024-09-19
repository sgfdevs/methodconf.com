import { permanentRedirect } from 'next/navigation';

export function GET(
    request: Request,
    { params }: { params: { conference: string } },
) {
    permanentRedirect(`/${params.conference}/register/`);
}
