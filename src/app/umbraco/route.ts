import { redirect } from 'next/navigation';
import { getCmsPublicUrl } from '@/serverConfig';

export function GET() {
    redirect(getCmsPublicUrl().toString());
}
