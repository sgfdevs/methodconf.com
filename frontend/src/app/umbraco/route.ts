import { redirect } from 'next/navigation';
import { UMBRACO_BASE_URL } from '@/config';

export function GET() {
    redirect(UMBRACO_BASE_URL.toString());
}
