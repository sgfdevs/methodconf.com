import { redirect } from 'next/navigation';
import { CMS_BASE_URL } from '@/config';

export function GET() {
    redirect(CMS_BASE_URL.toString());
}
